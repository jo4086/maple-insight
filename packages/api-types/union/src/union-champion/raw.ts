export interface UnionChampionBadgeStatRaw {
  stat: string;
}

export interface UnionChampionEntryRaw {
  champion_name: string;
  champion_slot: number;
  champion_grade: string;
  champion_class: string;
  champion_badge_info: UnionChampionBadgeStatRaw[];
}

export interface UnionChampionResponseRaw {
  date: string | null;
  union_champion: UnionChampionEntryRaw[];
  champion_badge_total_info: UnionChampionBadgeStatRaw[];
}
