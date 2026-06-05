import { createAppError } from '@@error';

// INFO: ranking/overall에서 허용하는 월드 이름 목록이다.
const rankingWorldNames = [
  '스카니아',
  '베라',
  '루나',
  '제니스',
  '크로아',
  '유니온',
  '엘리시움',
  '이노시스',
  '레드',
  '오로라',
  '아케인',
  '노바',
  '에오스',
  '헬리오스',
  '챌린저스',
  '챌린저스2',
  '챌린저스3',
  '챌린저스4',
] as const;

// INFO: ranking/overall의 월드 타입 값이다. 0은 일반, 1은 리부트 계열이다.
const rankingWorldTypes = [0, 1] as const;

// INFO: ranking/overall에서 허용하는 직업 필터 목록이다.
const rankingClassNames = [
  '초보자-전체 전직',
  '전사-전체 전직',
  '전사-검사',
  '전사-파이터',
  '전사-페이지',
  '전사-스피어맨',
  '전사-크루세이더',
  '전사-나이트',
  '전사-버서커',
  '전사-히어로',
  '전사-팔라딘',
  '전사-다크나이트',
  '마법사-전체 전직',
  '마법사-매지션',
  '마법사-위자드(불,독)',
  '마법사-위자드(썬,콜)',
  '마법사-클레릭',
  '마법사-메이지(불,독)',
  '마법사-메이지(썬,콜)',
  '마법사-프리스트',
  '마법사-아크메이지(불,독)',
  '마법사-아크메이지(썬,콜)',
  '마법사-비숍',
  '궁수-전체 전직',
  '궁수-아처',
  '궁수-헌터',
  '궁수-사수',
  '궁수-레인저',
  '궁수-저격수',
  '궁수-보우마스터',
  '궁수-신궁',
  '궁수-아처(패스파인더)',
  '궁수-에인션트아처',
  '궁수-체이서',
  '궁수-패스파인더',
  '도적-전체 전직',
  '도적-로그',
  '도적-어쌔신',
  '도적-시프',
  '도적-허밋',
  '도적-시프마스터',
  '도적-나이트로드',
  '도적-섀도어',
  '도적-세미듀어러',
  '도적-듀어러',
  '도적-듀얼마스터',
  '도적-슬래셔',
  '도적-듀얼블레이더',
  '해적-전체 전직',
  '해적-해적',
  '해적-인파이터',
  '해적-건슬링거',
  '해적-캐논슈터',
  '해적-버커니어',
  '해적-발키리',
  '해적-캐논블래스터',
  '해적-바이퍼',
  '해적-캡틴',
  '해적-캐논마스터',
  '기사단-전체 전직',
  '기사단-노블레스',
  '기사단-소울마스터',
  '기사단-플레임위자드',
  '기사단-윈드브레이커',
  '기사단-나이트워커',
  '기사단-스트라이커',
  '기사단-미하일',
  '아란-전체 전직',
  '에반-전체 전직',
  '레지스탕스-전체 전직',
  '레지스탕스-시티즌',
  '레지스탕스-배틀메이지',
  '레지스탕스-와일드헌터',
  '레지스탕스-메카닉',
  '레지스탕스-데몬슬레이어',
  '레지스탕스-데몬어벤져',
  '레지스탕스-제논',
  '레지스탕스-블래스터',
  '메르세데스-전체 전직',
  '팬텀-전체 전직',
  '루미너스-전체 전직',
  '카이저-전체 전직',
  '엔젤릭버스터-전체 전직',
  '초월자-전체 전직',
  '초월자-제로',
  '은월-전체 전직',
  '프렌즈 월드-전체 전직',
  '프렌즈 월드-키네시스',
  '카데나-전체 전직',
  '일리움-전체 전직',
  '아크-전체 전직',
  '호영-전체 전직',
  '아델-전체 전직',
  '카인-전체 전직',
  '라라-전체 전직',
  '칼리-전체 전직',
  '렌-전체 전직',
] as const;

export type RankingWorldName = (typeof rankingWorldNames)[number];
export type RankingWorldType = (typeof rankingWorldTypes)[number];
export type RankingClassName = (typeof rankingClassNames)[number];

/** INFO:
 *  ranking/overall 요청 쿼리
 *  - curl의 query string에 대응하는 입력 타입이다.
 *  - 실제 전송 전까지는 이 타입을 기준으로 값이 이동한다.
 **/
export type RankingOverallQuery = {
  date?: string;
  world_name?: RankingWorldName;
  world_type?: RankingWorldType;
  class?: RankingClassName;
  page: number;
};

/** INFO:
 *  ranking/overall 파라미터 계약
 *  - 어떤 헤더와 query key를 쓰는지 정리한 실행용 명세다.
 *  - validator와 query builder가 이 정의를 기준으로 움직인다.
 **/
export const rankingOverallParameterSpec = {
  headers: ['x-nxopen-api-key'] as const,
  required: ['page'] as const,
  optional: ['date', 'world_name', 'world_type', 'class'] as const,
  enums: {
    world_name: rankingWorldNames,
    world_type: rankingWorldTypes,
    class: rankingClassNames,
  },
} as const;

// INFO: 문자열 enum 목록에 값이 포함되는지 검사한다.
function isAllowedStringValue<T extends readonly string[]>(value: string, values: T): value is T[number] {
  return values.includes(value as T[number]);
}

// INFO: env의 월드 이름 값을 실행 타입으로 검증/변환한다.
export function parseRankingWorldName(value: string | undefined) {
  if (!value) return undefined;
  if (isAllowedStringValue(value, rankingOverallParameterSpec.enums.world_name)) return value;
  throw createAppError(400, `Invalid CRAWLER_WORLD_NAME: ${value}`, {
    parameter: 'world_name',
    value,
  });
}

// INFO: env의 월드 타입 문자열을 숫자로 변환한 뒤 허용값인지 검사한다.
export function parseRankingWorldType(value: string | undefined) {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (rankingOverallParameterSpec.enums.world_type.includes(parsed as RankingWorldType)) return parsed as RankingWorldType;
  throw createAppError(400, `Invalid CRAWLER_WORLD_TYPE: ${value}`, {
    parameter: 'world_type',
    value,
  });
}

// INFO: env의 직업 필터 값을 실행 타입으로 검증/변환한다.
export function parseRankingClassName(value: string | undefined) {
  if (!value) return undefined;
  if (isAllowedStringValue(value, rankingOverallParameterSpec.enums.class)) return value;
  throw createAppError(400, `Invalid CRAWLER_CLASS: ${value}`, {
    parameter: 'class',
    value,
  });
}

/** INFO:
 *  ranking/overall query string 생성기
 *  - 검증이 끝난 설정값을 URLSearchParams로 변환한다.
 *  - HTTP client는 이 함수가 만든 결과를 그대로 요청 URL에 붙인다.
 **/
export function buildRankingOverallParams(query: RankingOverallQuery) {
  const params = new URLSearchParams();

  if (query.date) params.set('date', query.date);
  if (query.world_name) params.set('world_name', query.world_name);
  if (query.world_type !== undefined) params.set('world_type', String(query.world_type));
  if (query.class) params.set('class', query.class);
  params.set('page', String(query.page));

  return params;
}
