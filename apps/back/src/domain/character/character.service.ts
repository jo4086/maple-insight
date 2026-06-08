import { isAxiosError } from 'axios';

import { nexonBaseApi } from '../../api/baseApi';

import { getSkillGrades, type CharacterApiEndpoint, type CharacterSkillGrade } from './character.constants';

import { createAppError, createExternalApiError } from '@/errors/app-error';

/**
 * TODO: 캐시된 닉네임 재조회를 의도적으로 할 시 조회 가능하게
 *  - [ ] 다만 1분 이내에 의도적 재조회는 원래 데이터를 사용해서 마치 새롭게 조회하는 것 처럼 보여주기 (front)
 * */

// GUIDE: Service layer error code guide
// - 400: 잘못된 요청 파라미터가 들어온 경우
// - 404: 캐릭터 또는 조회 대상 데이터가 존재하지 않는 경우
// - 502: 넥슨 API 응답이 비정상인 경우
// - 503: 넥슨 API가 일시적으로 응답할 수 없는 경우
// - 500: 위 경우로 분류되지 않는 내부 처리 오류
//   현재 서비스는 상태 코드를 직접 반환하지 않고 Error를 throw 한다.
//   실제 HTTP statusCode 결정은 컨트롤러 또는 errorHandler에서 처리한다.

const isProduction = process.env.NODE_ENV === 'production';
const DEFAULT_CHARACTER_REQUEST_DELAY_MS = isProduction ? 0 : 300;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getCharacterRequestDelayMs() {
  const rawValue = process.env.CHARACTER_REQUEST_DELAY_MS;

  if (!rawValue) {
    return DEFAULT_CHARACTER_REQUEST_DELAY_MS;
  }

  const delayMs = Number(rawValue);

  if (!Number.isFinite(delayMs) || delayMs < 0) {
    return DEFAULT_CHARACTER_REQUEST_DELAY_MS;
  }

  return delayMs;
}

type CharacterRequestParams = {
  character_skill_grade?: CharacterSkillGrade;
};

export type CharacterEndpointRequest =
  | CharacterApiEndpoint
  | {
      endpoint: CharacterApiEndpoint;
      key?: string;
      params?: CharacterRequestParams;
    };

export const getCharacterOCID = async (nick: string): Promise<{ ocid: string }> => {
  try {
    const response = await nexonBaseApi.get('/id', {
      params: {
        character_name: nick,
      },
    });

    const data = response.data as { ocid?: string };

    if (!data.ocid) {
      throw createAppError(404, '일치하는 닉네임 검색 결과가 없습니다.');
    }

    try {
      await nexonBaseApi.get('/character/basic', {
        params: {
          ocid: data.ocid,
        },
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400) {
        throw createAppError(404, '현재 조회할 수 없는 캐릭터입니다.');
      }

      throw error;
    }

    return { ocid: data.ocid };
  } catch (error) {
    if ((error as AppError)?.statusCode === 404) {
      throw error;
    }

    if (isAxiosError(error)) {
      console.error('API Request Error: ', error.message);

      throw createExternalApiError(
        error.response?.status,
        {
          400: '일치하는 닉네임 검색 결과가 없습니다.',
          404: '존재하지 않는 캐릭터입니다.',
          429: '외부 API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
        },
        error.message || '캐릭터 ocid 조회 중 오류 발생',
      );
    }

    console.error('API Request Error:, ', error);

    throw createAppError(500, '캐릭터 ocid 조회 중 오류 발생');
  }
};

// INFO: 캐릭터 정보 조회 서비스
export class CharacterService {
  constructor(
    private ocid: string,
    private date: string | null = null,
    private characterClass: string | null = null,
  ) {}

  // NOTE: 단일 캐릭터 endpoint를 호출하는 진입점
  public async call(request: CharacterEndpointRequest) {
    const { endpoint, params } = this.normalizeRequest(request);
    const data = await this.fetch(endpoint, params);

    if (endpoint === 'basic') {
      this.cacheCharacterClassFromBasic(data);
    }

    return data;
  }

  // NOTE: 여러 endpoint를 딜레이를 두고 순차적으로 조회한다.
  public async getMultipleWithDelay(requests: CharacterEndpointRequest[], delayMs: number = getCharacterRequestDelayMs()) {
    const results: [string, unknown][] = [];

    for (const [index, request] of requests.entries()) {
      const { key } = this.normalizeRequest(request);
      const data = await this.call(request);

      results.push([key, data]);

      if (delayMs > 0 && index < requests.length - 1) {
        await delay(delayMs);
      }
    }

    return Object.fromEntries(results);
  }

  // NOTE: skill 요청이 포함된 endpoint 목록을 실제 요청 목록으로 확장한다.
  public async createRequestsWithSkill(endpoints: CharacterApiEndpoint[]) {
    const requests: CharacterEndpointRequest[] = [];
    const hasBasic = endpoints.includes('basic');
    const endpointsWithoutSkill = endpoints.filter((endpoint) => endpoint !== 'skill');

    for (const endpoint of endpointsWithoutSkill) {
      requests.push(endpoint);
    }

    if (endpoints.includes('skill')) {
      const characterClass = hasBasic ? (this.characterClass ?? (await this.ensureCharacterClass())) : await this.ensureCharacterClass();

      if (characterClass) {
        requests.push(...this.createSkillRequests(characterClass));
      }
    }

    return requests;
  }

  // NOTE: 현재 직업에 맞는 skill 요청 목록을 생성한다.
  public createSkillRequests(characterClass: string) {
    return getSkillGrades(characterClass).map((grade) => ({
      endpoint: 'skill' as const,
      key: `skill-${grade}`,
      params: {
        character_skill_grade: grade,
      },
    }));
  }

  // WARN: (현재 미사용) 여러 endpoint를 병렬로 조회한다.
  public async getMultiple(requests: CharacterEndpointRequest[]) {
    const results = await Promise.all(
      requests.map((request) => {
        const { key } = this.normalizeRequest(request);
        return this.call(request).then((data) => [key, data] as const);
      }),
    );

    return Object.fromEntries(results);
  }

  // NOTE: 문자열 또는 객체 요청을 endpoint, key, params 구조로 정규화한다.
  private normalizeRequest(request: CharacterEndpointRequest) {
    if (typeof request === 'string') {
      return {
        endpoint: request,
        key: request,
        params: undefined,
      };
    }

    return {
      endpoint: request.endpoint,
      key: request.key ?? request.endpoint,
      params: request.params,
    };
  }

  // NOTE: 실제 넥슨 캐릭터 API를 호출한다.
  private async fetch(endpoint: CharacterApiEndpoint, params?: CharacterRequestParams) {
    const res = await nexonBaseApi.get(`/character/${endpoint}`, {
      params: { ocid: this.ocid, date: this.date, ...params },
    });
    return res.data;
  }

  // NOTE: basic 응답에서 직업명을 읽어 서비스 내부 상태에 저장한다.
  private cacheCharacterClassFromBasic(data: unknown) {
    if (!data || typeof data !== 'object') return;

    const basic = data as { character_class?: string };
    if (basic.character_class) {
      this.characterClass = basic.character_class;
    }
  }

  // NOTE: 캐시된 직업명이 없으면 basic을 다시 조회해 직업명을 확보한다.
  private async ensureCharacterClass() {
    if (this.characterClass) return this.characterClass;

    const basic = await this.fetch('basic');
    this.cacheCharacterClassFromBasic(basic);

    return this.characterClass;
  }
}

export default { getCharacterOCID, CharacterService };
