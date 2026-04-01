export interface PresetInfo {
  type: string;
  point: number | null;
  level: number;
  increase: string | null;
}

export interface HyperStatPreset {
  no: number;
  remainPoint: number;
  items: PresetInfo[];
}

export interface CharacterHyperStat {
  date: string | null;
  characterClass: string;
  usePresetNo: number;
  useAvailableHyperStat: number;
  presets: HyperStatPreset[];
}
