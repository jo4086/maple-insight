import type { CharacterPropensity } from '@maple/types';

import type { PropensityRaw } from '../types/propensity.raw';

export function toCharacterPropensity(raw: PropensityRaw): CharacterPropensity {
  return raw;
}
