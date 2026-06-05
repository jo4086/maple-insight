export type StatUnit = '%';

export interface StatItem {
  statName: string;
  statValue: number;
  statUnit?: StatUnit;
}

export interface CharacterStat {
  date: string | null;
  characterClass: string;
  finalStat: StatItem[];
  remainAp: number;
}
