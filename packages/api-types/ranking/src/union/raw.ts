export interface UnionRankingEntryRaw {
  /** 랭킹 업데이트 일자 (KST)
   *  example: 2025-12-22*/
  date: string;
  /** 유니온 랭킹 순위 */
  ranking: number;
  /** 캐릭터 명 */
  character_name: string;
  /** 월드 명 */
  world_name: string;
  /** 직업 명 */
  class_name: string;
  /** 전직 직업 명 */
  sub_class_name: string;
  /** 유니온 레벨 */
  union_level: number;
  /** 유니온 파워 */
  union_power: number;
}

export interface UnionRankingResponseRaw {
  ranking: UnionRankingEntryRaw[];
}
