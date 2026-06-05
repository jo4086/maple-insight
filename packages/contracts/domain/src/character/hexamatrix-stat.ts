export interface HexaStat {
  slotId: string;
  mainStatName: string;
  subStatName1: string;
  subStatName2: string;
  mainStatLevel: number;
  subStatLevel1: number;
  subStatLevel2: number;
  statGrade: number;
}

export interface HexaStatPreset {
  no: number;
  stats: HexaStat[];
}

export interface CharacterHexamatrixStat {
  date: string | null;
  equipped: HexaStatPreset[];
  presets: HexaStatPreset[];
}
