import { createAppError, isIngestorError } from '@@error';
import type { OverallRankingEntryRaw, UnionRankingResponseRaw, UnionRankingEntryRaw } from '@maple/api-ranking';
import { isNexonOpenApiErrorResponse, isNexonQuotaExceededError, NEXON_OPENAPI_ERRORS } from '@maple/nexon-contracts';

import type { WorkerConfig } from '@/config/env';
import { buildRankingOverallParams } from '@/config/ranking-parameters';

// INFO: 종합 랭킹 조회 endpoint 경로다.
// const RANKING_OVERALL_ENDPOINT = '/ranking/overall';
// const RANKING_UNION_ENDPOINNT = '/ranking/union';
// const CHARACTER_ID_ENDPOINT = '/id';
// const CHARACTER_BASIC_ENDPOINT = '/character/basic';
// const USER_UNION_ENDPOINT = '/user/union';
// const USER_UNION_RAIDER_ENDPOINT = '/user/union-raider';
// const USER_UNION_CHAMPION_ENDPOINT = '/user/union-champion';
const RETRYABLE_STATUS = 429;
const RETRY_BACKOFF_MS = [1500, 3000, 5000] as const;

const ENDPOINT_MAP = {
  ranking_overall: '/ranking/overall',
  ranking_union: '/ranking/union',
  id: '/id',
  character_basic: '/character/basic',
  user_union: '/user/union',
  user_unionRaider: '/user/union-raider',
  user_unionChampion: '/user/union-champion',
};

let lastRequestAt = 0;
let requestStartQueue = Promise.resolve();

// INFO: 모든 Nexon 요청이 공유하는 전역 요청 간격 제어기다.
async function throttleRequest(config: WorkerConfig) {
  const previousRequestStart = requestStartQueue;
  let releaseRequestStart!: () => void;
  requestStartQueue = new Promise((resolve) => {
    releaseRequestStart = resolve;
  });

  await previousRequestStart;

  const now = Date.now();
  const elapsed = now - lastRequestAt;
  const waitMs = Math.max(0, config.requestThrottleMs - elapsed);

  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  lastRequestAt = Date.now();
  releaseRequestStart();
}

async function readResponseJson(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function getNexonOpenApiErrorMeta(payload: unknown) {
  if (!isNexonOpenApiErrorResponse(payload)) {
    return null;
  }

  return NEXON_OPENAPI_ERRORS[payload.error.name as keyof typeof NEXON_OPENAPI_ERRORS] ?? null;
}

// INFO: ranking 응답이 배열이든 { ranking: [] }이든 동일한 배열 형태로 맞춘다.
function normalizeRankingResponse(payload: unknown): OverallRankingEntryRaw[] {
  if (Array.isArray(payload)) {
    return payload as OverallRankingEntryRaw[];
  }

  if (payload && typeof payload === 'object' && 'ranking' in payload) {
    const ranking = (payload as { ranking?: unknown }).ranking;
    if (Array.isArray(ranking)) {
      return ranking as OverallRankingEntryRaw[];
    }
  }

  throw createAppError(502, 'Unexpected ranking response shape', {
    endpoint: ENDPOINT_MAP.ranking_overall,
  });
}

// INFO: union ranking 응답을 개별 랭킹 행 배열로 맞춘다.
function normalizeUnionRankingResponse(payload: unknown): UnionRankingEntryRaw[] {
  if (payload && typeof payload === 'object' && 'ranking' in payload) {
    const ranking = (payload as UnionRankingResponseRaw).ranking;
    if (Array.isArray(ranking)) {
      return ranking;
    }
  }

  throw createAppError(502, 'Unexpected union ranking response shape', {
    endpoint: ENDPOINT_MAP.ranking_union,
  });
}

/** INFO:
 *  ranking/overall 단일 페이지 조회
 *  - query builder로 URL 파라미터를 만든다.
 *  - Nexon 헤더를 붙여 HTTP 요청을 보낸다.
 *  - 응답 shape를 내부 공통 배열 형태로 정규화한다.
 **/
export async function fetchRankingPage(config: WorkerConfig, page: number) {
  const params = buildRankingOverallParams({
    date: config.rankingDate,
    world_name: config.worldName,
    world_type: config.worldType,
    class: config.className,
    page,
  });

  const payload = await fetchNexonJson(config, ENDPOINT_MAP.ranking_overall, Object.fromEntries(params.entries()));
  return normalizeRankingResponse(payload);
}

// INFO: 공통 Nexon GET 요청 함수다. endpoint와 query를 받아 JSON 응답을 반환한다.
async function fetchNexonJson(config: WorkerConfig, endpoint: string, query: Record<string, string | number | undefined>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  try {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        params.set(key, String(value));
      }
    }

    for (const [attemptIndex, retryDelayMs] of [0, ...RETRY_BACKOFF_MS].entries()) {
      await throttleRequest(config);

      const response = await fetch(`${config.apiBaseUrl}${endpoint}?${params.toString()}`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-nxopen-api-key': config.apiKey,
        },
        signal: controller.signal,
      });

      if (response.ok) {
        return (await response.json()) as unknown;
      }

      const errorPayload = await readResponseJson(response);
      const openApiErrorMeta = getNexonOpenApiErrorMeta(errorPayload);

      if (!isNexonQuotaExceededError(errorPayload) && response.status === RETRYABLE_STATUS && attemptIndex < RETRY_BACKOFF_MS.length) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        continue;
      }

      throw createAppError(
        openApiErrorMeta?.status === 429 || response.status === 429 ? 503 : 502,
        openApiErrorMeta?.description ?? (response.status === 429 ? '요청 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요.' : 'Nexon request failed'),
        {
          endpoint,
          query,
          status: openApiErrorMeta?.status ?? response.status,
          statusText: openApiErrorMeta?.message ?? response.statusText,
          openApiErrorName: isNexonOpenApiErrorResponse(errorPayload) ? errorPayload.error.name : null,
          openApiErrorMessage: isNexonOpenApiErrorResponse(errorPayload) ? errorPayload.error.message : null,
          officialDescription: openApiErrorMeta?.description ?? null,
          responseStatus: response.status,
          responseStatusText: response.statusText,
          attempt: attemptIndex + 1,
        },
      );
    }

    throw createAppError(502, 'Nexon request failed after retries', {
      endpoint,
      query,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw createAppError(
        504,
        'Nexon request timed out',
        {
          endpoint,
          query,
          timeoutMs: config.requestTimeoutMs,
        },
        error,
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

// INFO: character_name으로 ocid를 조회한다.
export async function fetchCharacterId(config: WorkerConfig, characterName: string) {
  const payload = await fetchNexonJson(config, ENDPOINT_MAP.id, {
    character_name: characterName,
  });

  if (!payload || typeof payload !== 'object' || !('ocid' in payload)) {
    throw createAppError(502, 'Unexpected character id response shape', {
      endpoint: ENDPOINT_MAP.id,
      characterName,
    });
  }

  const ocid = (payload as { ocid?: unknown }).ocid;
  if (typeof ocid !== 'string' || !ocid) {
    throw createAppError(502, 'Missing ocid in character id response', {
      endpoint: ENDPOINT_MAP.id,
      characterName,
    });
  }

  return {
    ocid,
    rawPayload: payload,
  };
}

// INFO: ocid로 캐릭터 기본 정보를 조회한다.
export async function fetchCharacterBasic(config: WorkerConfig, ocid: string) {
  return fetchNexonJson(config, ENDPOINT_MAP.character_basic, {
    ocid,
    date: config.detailDate,
  });
}

// INFO: ocid 기준으로 ranking/union 값을 조회한다.
export async function fetchUnionRanking(config: WorkerConfig, ocid: string, worldName: string) {
  const payload = await fetchNexonJson(config, ENDPOINT_MAP.ranking_union, {
    date: config.rankingDate,
    world_name: worldName,
    ocid,
  });

  return {
    ranking: normalizeUnionRankingResponse(payload),
    rawPayload: payload,
  };
}

// INFO: ocid로 유니온 정보를 조회한다.
export async function fetchUserUnion(config: WorkerConfig, ocid: string) {
  return fetchNexonJson(config, ENDPOINT_MAP.user_union, {
    ocid,
    date: config.detailDate,
  });
}

// INFO: ocid로 유니온 공격대 정보를 조회한다.
export async function fetchUserUnionRaider(config: WorkerConfig, ocid: string) {
  return fetchNexonJson(config, ENDPOINT_MAP.user_unionRaider, {
    ocid,
    date: config.detailDate,
  });
}

// INFO: ocid로 유니온 챔피언 정보를 조회한다.
export async function fetchUserUnionChampion(config: WorkerConfig, ocid: string) {
  try {
    return await fetchNexonJson(config, ENDPOINT_MAP.user_unionChampion, {
      ocid,
      date: config.detailDate,
    });
  } catch (error) {
    if (isIngestorError(error) && error.details?.status === 400) {
      throw createAppError(404, 'Union champion data is not available', {
        endpoint: ENDPOINT_MAP.user_unionChampion,
        ocid,
        date: config.detailDate,
      });
    }

    throw error;
  }
}
