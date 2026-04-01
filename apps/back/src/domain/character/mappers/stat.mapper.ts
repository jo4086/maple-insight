import type { CharacterStat } from '@maple/types';
import { toNumberSafe } from 'src/utils/number';

import type { StatRaw } from '../types/stat.raw';
import { getStatUnit } from '../utils/getStatUnit';

export function toCharacterStat(raw: StatRaw): CharacterStat {
  return {
    date: raw.date,
    characterClass: raw.character_class,
    finalStat: raw.final_stat.map((stat) => {
      const statUnit = getStatUnit(stat.stat_name);

      return {
        statName: stat.stat_name,
        statValue: toNumberSafe(stat.stat_value),
        ...(statUnit ? { statUnit } : {}),
      };
    }),
    remainAp: raw.remain_ap,
  };
}
