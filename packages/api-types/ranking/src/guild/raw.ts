export interface GuildRankingEntryRaw {
  /** [required]
   * 조회 기준일 (KST) - Example : 2025-12-22 */
  date: string;
  ranking: number;
  guild_name: string;
  world_name: string;
  guild_level: number;
  guild_master_name: string;
  guild_mark: string;
  guild_point: number;
}

export interface GuildRankingResponseRaw {
  ranking: GuildRankingEntryRaw[];
}
