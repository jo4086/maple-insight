export interface AbilityInfoRawLegacy {
  ability_no: string;
  ability_grade: string;
  ability_value: string;
}

export interface AbilityPresetRawLegacy {
  ability_preset_grade: string;
  ability_info: AbilityInfoRawLegacy[];
}

type AbilityPresetFieldsLegacy = {
  [K in `ability_preset_${1 | 2 | 3}`]: AbilityPresetRawLegacy;
};

export interface AbilityRawLegacy extends AbilityPresetFieldsLegacy {
  date: string | null;
  ability_grade: string;
  ability_info: AbilityInfoRawLegacy[];
  remain_fame: number;
  preset_no: number;
}
