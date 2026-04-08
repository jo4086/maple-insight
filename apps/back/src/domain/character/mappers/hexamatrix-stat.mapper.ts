import type { CharacterHexamatrixStat, HexaStat, HexaStatPreset } from '@maple/types';

import type { HexamatrixStatRaw } from '../types/hexamatrix-stat.raw';

type HexaStatRawItem = NonNullable<HexamatrixStatRaw['character_hexa_stat_core']>[number];

const EQUIPPED_KEYS = ['character_hexa_stat_core', 'character_hexa_stat_core_2', 'character_hexa_stat_core_3'] as const;

const PRESET_KEYS = ['preset_hexa_stat_core', 'preset_hexa_stat_core_2', 'preset_hexa_stat_core_3'] as const;

function toHexaStat(raw: HexaStatRawItem): HexaStat {
  return {
    slotId: raw.slot_id ?? '',
    mainStatName: raw.main_stat_name ?? '',
    subStatName1: raw.sub_stat_name_1 ?? '',
    subStatName2: raw.sub_stat_name_2 ?? '',
    mainStatLevel: raw.main_stat_level ?? 0,
    subStatLevel1: raw.sub_stat_level_1 ?? 0,
    subStatLevel2: raw.sub_stat_level_2 ?? 0,
    statGrade: raw.stat_grade ?? 0,
  };
}

function toHexaStatPreset(no: number, stats: HexaStatRawItem[] | null): HexaStatPreset {
  return {
    no,
    stats: (stats ?? []).map(toHexaStat),
  };
}

export function toCharacterHexamatrixStat(raw: HexamatrixStatRaw): CharacterHexamatrixStat {
  return {
    date: raw.date,
    equipped: EQUIPPED_KEYS.map((key, index) => toHexaStatPreset(index + 1, raw[key])),
    presets: PRESET_KEYS.map((key, index) => toHexaStatPreset(index + 1, raw[key])),
  };
}
