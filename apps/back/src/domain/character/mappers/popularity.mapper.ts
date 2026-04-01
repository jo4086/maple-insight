import type { CharacterPopularity } from '@maple/types';

import type { PopularityRaw } from '../types/popularity.raw';

export function toCharacterPopularity(raw: PopularityRaw): CharacterPopularity {
  return raw;
}
