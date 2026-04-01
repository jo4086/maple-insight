import type { AbilityInfo, AbilityPreset, CharacterAbility } from '@maple/types';
import { toNumberSafe } from 'src/utils/number';

import type { AbilityRaw, AbilityPresetRaw, AbilityInfoRaw } from '../types/ability.raw';
import { toRarityGrade } from '../utils/grade';

const ABILITY_PRESET_KEYS = ['ability_preset_1', 'ability_preset_2', 'ability_preset_3'] as const;

/** 개별 옵션 변환 */
function mapAbilityInfo(raw: AbilityInfoRaw): AbilityInfo {
  return {
    abilityNo: toNumberSafe(raw.ability_no),
    grade: toRarityGrade(raw.ability_grade),
    value: raw.ability_value,
  };
}

/** 프리셋 1개 변환 */
function mapAbilityPreset(raw: AbilityPresetRaw, presetNo: number): AbilityPreset {
  return {
    presetNo,
    grade: toRarityGrade(raw.ability_preset_grade),
    info: raw.ability_info.map(mapAbilityInfo),
  };
}

/** AbilityRaw -> CharacterAbility */
export function toCharacterAbility(raw: AbilityRaw): CharacterAbility {
  const presets = ABILITY_PRESET_KEYS.map((presetKey, index) => mapAbilityPreset(raw[presetKey], index + 1));

  return {
    date: raw.date,
    equipped: {
      grade: toRarityGrade(raw.ability_grade),
      info: raw.ability_info.map(mapAbilityInfo),
    },
    remainFame: raw.remain_fame,
    presetNo: raw.preset_no,
    presets,
  };
}
