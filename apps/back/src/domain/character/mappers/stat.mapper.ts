import type { CharacterStat } from '@maple/types';

import type { StatRaw } from '../types/stat.raw';
import { getStatUnit } from '../utils/getStatUnit';

import { toNumberSafe } from '@/utils/number';

export function toCharacterStat(raw: StatRaw): CharacterStat {
  return {
    date: raw.date,
    characterClass: raw.character_class ?? '',
    finalStat: (raw.final_stat ?? []).map((stat) => {
      const statName = stat.stat_name ?? '';
      const statUnit = getStatUnit(statName);

      return {
        statName,
        statValue: toNumberSafe(stat.stat_value ?? '0'),
        ...(statUnit ? { statUnit } : {}),
      };
    }),
    remainAp: raw.remain_ap ?? 0,
  };
}
