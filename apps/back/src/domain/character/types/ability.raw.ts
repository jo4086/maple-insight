import type { DeepNullable } from '@/types/deep-nullable';

interface AbilityInfoRawBase {
  ability_no: string;
  ability_grade: string;
  ability_value: string;
}

interface AbilityPresetRawBase {
  ability_preset_grade: string;
  ability_info: AbilityInfoRawBase[];
}

interface AbilityRawBase {
  date: string | null;
  ability_grade: string;
  ability_info: AbilityInfoRawBase[];
  remain_fame: number;
  preset_no: number;
  ability_preset_1: AbilityPresetRawBase;
  ability_preset_2: AbilityPresetRawBase;
  ability_preset_3: AbilityPresetRawBase;
}

export type AbilityInfoRaw = DeepNullable<AbilityInfoRawBase>;
export type AbilityPresetRaw = DeepNullable<AbilityPresetRawBase>;
export type AbilityRaw = DeepNullable<AbilityRawBase>;
