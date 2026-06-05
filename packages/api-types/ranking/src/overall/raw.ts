export interface OverallRankingEntryRaw {
  /** 랭킹 업데이트 일자 (KST)
   *  example: 2025-12-22 */
  date: string;
  /** 종합 랭킹 순위 */
  ranking: number;
  /** 캐릭터 명 */
  character_name: string;
  /** 월드 명 */
  world_name: string;
  /** 직업 명 */
  class_name: string;
  /** 전직 직업 명 */
  sub_class_name: string;
  /** 캐릭터 레벨 */
  character_level: number;
  /** 캐릭터 경험치 */
  character_exp: number;
  /** 캐릭터 인기도 */
  character_popularity: number;
  /** 캐릭터 길드 명 */
  character_guildname: string;
}

export interface OverallRankingResponseRaw {
  ranking: OverallRankingEntryRaw[];
}
