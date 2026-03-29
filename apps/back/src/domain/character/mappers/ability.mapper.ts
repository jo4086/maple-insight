import { toNumberSafe } from 'src/utils/number';

import type { AbilityInfo, AbilityPreset, CharacterAbility } from '../types/ability';
import type { AbilityRaw, AbilityPresetRaw, AbilityInfoRaw } from '../types/ability.raw';
import { RarityGrade } from '../types/common';
import { mapPresets } from '../utils/preset';

/** 개별 옵션 변환 */
function mapAbilityInfo(raw: AbilityInfoRaw): AbilityInfo {
  return {
    abilityNo: toNumberSafe(raw.ability_no),
    grade: raw.ability_grade as RarityGrade,
    value: raw.ability_value,
  };
}

/** 프리셋 1개 변환 */
function mapAbilityPreset(raw: AbilityPresetRaw, presetNo: number): AbilityPreset {
  return {
    presetNo,
    grade: raw.ability_preset_grade as RarityGrade,
    info: raw.ability_info.map(mapAbilityInfo),
  };
}

/** AbilityRaw -> CharacterAbility */
export function toCharacterAbility(raw: AbilityRaw): CharacterAbility {
  const presets = mapPresets((presetNo) => {
    const presetKey = `ability_preset_${presetNo}` as keyof AbilityRaw;
    const preset = raw[presetKey] as AbilityPresetRaw;

    return mapAbilityPreset(preset, presetNo);
  });

  return {
    date: raw.date,
    equipped: {
      grade: raw.ability_grade as RarityGrade,
      info: raw.ability_info.map(mapAbilityInfo),
    },
    remainFame: raw.remain_fame,
    presetNo: raw.preset_no,
    presets,
  };
}
