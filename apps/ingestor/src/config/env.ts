import { createAppError, normalizeError } from '@@error';

import { parseRankingClassName, parseRankingWorldName, parseRankingWorldType, type RankingClassName, type RankingWorldName, type RankingWorldType } from './ranking-parameters';

const DEFAULT_INTERVAL_MS = 60_000;
const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;
const DEFAULT_REQUEST_THROTTLE_MS = 500;
const DEFAULT_PAGE_START = 1;
const DEFAULT_PAGE_END = 5;
const DEFAULT_NEXON_API_BASE_URL = 'https://open.api.nexon.com/maplestory/v1';
const DEFAULT_REQUEST_BATCH_SIZE = 5;
const DEFAULT_MAX_FETCH_COUNT = 100;
const DEFAULT_DEVELOPMENT_OCID_FETCH_LIMIT = 50;
const DEFAULT_APP_MODE = 'development';

export type AppMode = 'development' | 'production';

const configuration = {
  development: {
    pageStart: DEFAULT_PAGE_START,
    pageEnd: DEFAULT_PAGE_END,
    intervalMs: DEFAULT_INTERVAL_MS,
    requestTimeoutMs: DEFAULT_REQUEST_TIMEOUT_MS,
    requestThrottleMs: DEFAULT_REQUEST_THROTTLE_MS,
    requestBatchSize: DEFAULT_REQUEST_BATCH_SIZE,
    maxFetchCount: DEFAULT_DEVELOPMENT_OCID_FETCH_LIMIT,
  },
  production: {
    pageStart: 1,
    pageEnd: DEFAULT_PAGE_END,
    intervalMs: DEFAULT_INTERVAL_MS,
    requestTimeoutMs: DEFAULT_REQUEST_TIMEOUT_MS,
    requestThrottleMs: DEFAULT_REQUEST_THROTTLE_MS,
    requestBatchSize: DEFAULT_REQUEST_BATCH_SIZE,
    maxFetchCount: DEFAULT_MAX_FETCH_COUNT,
  },
} as const;

// INFO: ranking API 기본 조회일로 쓸 KST 기준 전날 날짜를 만든다.
function getPreviousKstDate() {
  const currentDate = new Date();
  const kstNow = new Date(currentDate.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  kstNow.setDate(kstNow.getDate() - 1);

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(kstNow);
}

/** INFO:
 *  워커 실행 설정
 *  - ingestor 전역 실행 옵션을 한 번에 들고 다닌다.
 *  - env 해석 이후에는 다른 계층이 process.env를 직접 보지 않게 한다.
 **/
export type WorkerConfig = {
  mode: AppMode;
  apiKey: string;
  apiBaseUrl: string;
  rankingDate: string;
  detailDate?: string;
  worldName?: RankingWorldName;
  worldType?: RankingWorldType;
  className?: RankingClassName;
  pageStart: number;
  pageEnd: number;
  intervalMs: number;
  requestTimeoutMs: number;
  requestThrottleMs: number;
  requestBatchSize: number;
  maxFetchCount: number;
};

// INFO: 반복 주기, 타임아웃, 페이지 범위 같은 숫자 설정을 안전하게 정수로 변환한다.
function parsePositiveInt(value: string | undefined, fallback: number) {
  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseAppMode(value: string | undefined): AppMode {
  if (!value) {
    return DEFAULT_APP_MODE;
  }

  if (value === 'development' || value === 'production') {
    return value;
  }

  throw createAppError(400, `Invalid APP_MODE: ${value}`, {
    envKey: 'APP_MODE',
    value,
  });
}

function resolveMode(env: NodeJS.ProcessEnv): AppMode {
  return parseAppMode(env.NODE_ENV ?? DEFAULT_APP_MODE);
}

/** INFO:
 *  환경변수에서 워커 설정 만들기
 *  - 필수 키 존재 여부를 검증한다.
 *  - ranking 관련 선택 파라미터를 허용값 기준으로 파싱한다.
 *  - client와 service가 바로 사용할 수 있는 설정 객체를 반환한다.
 **/
export function getWorkerConfig(env: NodeJS.ProcessEnv = process.env): WorkerConfig {
  try {
    const apiKey = env.NEXON_API_KEY;

    if (!apiKey) {
      throw createAppError(500, 'NEXON_API_KEY is required', {
        envKey: 'NEXON_API_KEY',
      });
    }

    const mode = resolveMode(env);
    const modeConfig = configuration[mode];
    const pageStart = parsePositiveInt(env.CRAWLER_RANKING_PAGE_START, modeConfig.pageStart);
    const pageEnd = parsePositiveInt(env.CRAWLER_RANKING_PAGE_END, modeConfig.pageEnd);

    return {
      mode,
      apiKey,
      apiBaseUrl: env.NEXON_API_BASE_URL || DEFAULT_NEXON_API_BASE_URL,
      rankingDate: env.CRAWLER_RANKING_DATE || getPreviousKstDate(),
      detailDate: env.CRAWLER_DETAIL_DATE || undefined,
      worldName: parseRankingWorldName(env.CRAWLER_WORLD_NAME),
      worldType: parseRankingWorldType(env.CRAWLER_WORLD_TYPE),
      className: parseRankingClassName(env.CRAWLER_CLASS),
      pageStart: Math.min(pageStart, pageEnd),
      pageEnd: Math.max(pageStart, pageEnd),
      intervalMs: parsePositiveInt(env.CRAWLER_INTERVAL_MS, modeConfig.intervalMs),
      requestTimeoutMs: parsePositiveInt(env.CRAWLER_REQUEST_TIMEOUT_MS, modeConfig.requestTimeoutMs),
      requestThrottleMs: parsePositiveInt(env.CRAWLER_REQUEST_THROTTLE_MS, modeConfig.requestThrottleMs),
      requestBatchSize: parsePositiveInt(env.CRAWLER_REQUEST_BATCH_SIZE, modeConfig.requestBatchSize),
      maxFetchCount: parsePositiveInt(env.CRAWLER_MAX_FETCH_COUNT, modeConfig.maxFetchCount),
    };
  } catch (error) {
    throw normalizeError(error, 'Failed to parse worker config');
  }
}
