export interface UnionRaiderParams {
  /** [(required)]
   *  [description]: "api key" */
  'x-nxopen-api-key': string;

  /** [(required)]
   *  [description]: "캐릭터 식별자" */
  ocid: string;

  /** [(required)]
   *  [description]: "조회 기준일 (kst)"
   *  example: 2025-12-12 */
  date: string;
}
