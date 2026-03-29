import type { CharacterPopularity } from '../types/popularity';
import type { PopularityRaw } from '../types/popularity.raw';

export function toCharacterPopularity(raw: PopularityRaw): CharacterPopularity {
  return raw;
}
