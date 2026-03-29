import type { CharacterPropensity } from '../types/propensity';
import type { PropensityRaw } from '../types/propensity.raw';

export function toCharacterPropensity(raw: PropensityRaw): CharacterPropensity {
  return raw;
}
