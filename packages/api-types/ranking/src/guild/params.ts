export type GuildRankingWorldNames =
  | '스카니아'
  | '베라'
  | '루나'
  | '제니스'
  | '크로아'
  | '유니온'
  | '엘리시움'
  | '이노시스'
  | '레드'
  | '오로라'
  | '아케인'
  | '노바'
  | '에오스'
  | '핼리오스'
  | '챌린저스'
  | '챌린저스2'
  | '챌린저스3'
  | '챌린저스4';

export interface GuildRankingParams {
  /** [(required)]
   *  [description]: "API KEY" */
  'x-nxopen-api-key': string;

  /** [(required)]
   *  [description]: "조회 기준일 (KST)"
   *  example: 2025-12-12 */
  date: string;

  /** [(required)]
   *  [description]: "랭킹 타입 (0:주간 명성치, 1:플래그 레이스, 2:지하 수로)"*/
  ranking_type: number;

  /** [(optional)]
   *  [description]: "월드 명"
   *  [Available values] : 스카니아 | 베라 | 루나 | 제니스 | 크로아 | 유니온 | 엘리시움 | 이노시스 | 레드 | 오로라 | 아케인 | 노바 | 에오스 | 핼리오스 | 챌린저스 | 챌린저스2 | 챌린저스3 | 챌린저스4 */
  world_name: GuildRankingWorldNames;

  /** [(optional)]
   *  [description]: "길드 명" */
  guild_name: string;

  /** [(optional)]
   *  [description]: "페이지 번호" */
  page: number;
}
