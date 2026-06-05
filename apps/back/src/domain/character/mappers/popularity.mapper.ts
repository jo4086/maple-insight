import type { PopularityRaw } from '@maple/api-character';
import type { CharacterPopularity } from '@maple/contracts';

export function toCharacterPopularity(raw: PopularityRaw): CharacterPopularity {
  return {
    date: raw.date,
    popularity: raw.popularity ?? 0,
  };
}
