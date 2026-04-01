import { PERCENT_STAT_KEYWORDS, PERCENT_STAT_NAMES } from '../character.constants';
import type { StatUnit } from '@maple/types';

export function getStatUnit(statName: string): StatUnit | undefined {
  if (PERCENT_STAT_NAMES.has(statName)) {
    return '%';
  }

  if (PERCENT_STAT_KEYWORDS.some((keyword) => statName.includes(keyword))) {
    return '%';
  }

  return undefined;
}
