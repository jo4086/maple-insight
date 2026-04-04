import type { CharacterHexamatrixStat, HexaStat, HexaStatPreset } from '../types/hexamatrix-stat';
import type { HexamatrixStatRaw } from '../types/hexamatrix-stat.raw';

type HexaStatRawItem = HexamatrixStatRaw['character_hexa_stat_core'][number];

const EQUIPPED_KEYS = [
  'character_hexa_stat_core',
  'character_hexa_stat_core_2',
  'character_hexa_stat_core_3',
] as const;

const PRESET_KEYS = ['preset_hexa_stat_core', 'preset_hexa_stat_core_2', 'preset_hexa_stat_core_3'] as const;

function toHexaStat(raw: HexaStatRawItem): HexaStat {
  return {
    slotId: raw.slot_id,
    mainStatName: raw.main_stat_name,
    subStatName1: raw.sub_stat_name_1,
    subStatName2: raw.sub_stat_name_2,
    mainStatLevel: raw.main_stat_level,
    subStatLevel1: raw.sub_stat_level_1,
    subStatLevel2: raw.sub_stat_level_2,
    statGrade: raw.stat_grade,
  };
}

function toHexaStatPreset(no: number, stats: HexaStatRawItem[]): HexaStatPreset {
  return {
    no,
    stats: stats.map(toHexaStat),
  };
}

export function toCharacterHexamatrixStat(raw: HexamatrixStatRaw): CharacterHexamatrixStat {
  return {
    date: raw.date,
    equipped: EQUIPPED_KEYS.map((key, index) => toHexaStatPreset(index + 1, raw[key])),
    presets: PRESET_KEYS.map((key, index) => toHexaStatPreset(index + 1, raw[key])),
  };
}
