import { toNumberSafe } from 'src/utils/number';

import type { CharacterHyperStat, PresetInfo, HyperStatPreset } from '../types/hyper-stat';
import type { HyperStatRaw } from '../types/hyper-stat.raw';

const PRESET_NOS = [1, 2, 3] as const;

function mapPresetInfo(preset: HyperStatRaw['hyper_stat_preset_1']): PresetInfo[] {
  return preset.map((item) => ({
    type: item.stat_type,
    point: item.stat_point,
    level: item.stat_level,
    increase: item.stat_increase,
  }));
}

export function toCharacterHyperStat(raw: HyperStatRaw): CharacterHyperStat {
  const presets: HyperStatPreset[] = PRESET_NOS.map((no) => {
    const presetKey = `hyper_stat_preset_${no}` as keyof HyperStatRaw;
    const remainPointKey = `hyper_stat_preset_${no}_remain_point` as keyof HyperStatRaw;

    return {
      no,
      remainPoint: raw[remainPointKey] as number,
      items: mapPresetInfo(raw[presetKey] as HyperStatRaw['hyper_stat_preset_1']),
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
