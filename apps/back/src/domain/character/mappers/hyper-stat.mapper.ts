import { toNumberSafe } from 'src/utils/number';

import type { CharacterHyperStat, PresetInfo, HyperStatPreset } from '../types/hyper-stat';
import type { HyperStatRaw } from '../types/hyper-stat.raw';

const HYPER_STAT_PRESET_PAIRS = [
  ['hyper_stat_preset_1', 'hyper_stat_preset_1_remain_point'],
  ['hyper_stat_preset_2', 'hyper_stat_preset_2_remain_point'],
  ['hyper_stat_preset_3', 'hyper_stat_preset_3_remain_point'],
] as const;

function mapPresetInfo(preset: HyperStatRaw['hyper_stat_preset_1']): PresetInfo[] {
  return preset.map((item) => ({
    type: item.stat_type,
    point: item.stat_point,
    level: item.stat_level,
    increase: item.stat_increase,
  }));
}

export function toCharacterHyperStat(raw: HyperStatRaw): CharacterHyperStat {
  const presets: HyperStatPreset[] = HYPER_STAT_PRESET_PAIRS.map(([presetKey, remainPointKey], index) => {
    return {
      no: index + 1,
      remainPoint: raw[remainPointKey],
      items: mapPresetInfo(raw[presetKey]),
    };
  });

  return {
    date: raw.date,
    characterClass: raw.character_class,
    usePresetNo: toNumberSafe(raw.use_preset_no),
    useAvailableHyperStat: raw.use_available_hyper_stat,
    presets,
  };
}
