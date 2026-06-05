export type UnionRankingWorldNames =
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
  | '핼리오스';

export interface UnionRankingParams {
  /** [(required)]
   *  [description]: "API KEY" */
  'x-nxopen-api-key': string;

  /** [(required)]
   *  [description]: "조회 기준일 (KST)"
   *  example: 2025-12-12 */
  date: string;

  /** [(optional)]
   *  [description]: "월드 명" */
  world_name: UnionRankingWorldNames;

  /** [(optional)]
   *  [description]: "캐릭터 식별자" */
  ocid: string;

  /** [(optional)]
   *  [description]: "페이지 번호" */
  page: number;
}
