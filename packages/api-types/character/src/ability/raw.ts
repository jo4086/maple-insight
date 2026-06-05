export interface AbilityInfoRaw {
  ability_no: string;
  ability_grade: string;
  ability_value: string;
}

export interface AbilityPresetRaw {
  ability_preset_grade: string;
  ability_info: AbilityInfoRaw[];
}

export interface AbilityRaw {
  date: string | null;
  ability_grade: string;
  ability_info: AbilityInfoRaw[];
  remain_fame: number;
  preset_no: number;
  ability_preset_1: AbilityPresetRaw | null;
  ability_preset_2: AbilityPresetRaw | null;
  ability_preset_3: AbilityPresetRaw | null;
}
