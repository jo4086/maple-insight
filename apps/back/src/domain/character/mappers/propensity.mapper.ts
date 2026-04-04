import type { CharacterPropensity } from '@maple/types';

import type { PropensityRaw } from '../types/propensity.raw';

export function toCharacterPropensity(raw: PropensityRaw): CharacterPropensity {
  return {
    date: raw.date,
    charismaLevel: raw.charismaLevel ?? 0,
    sensibilityLevel: raw.sensibilityLevel ?? 0,
    insightLevel: raw.insightLevel ?? 0,
    willingnessLevel: raw.willingnessLevel ?? 0,
    handicraftLevel: raw.handicraftLevel ?? 0,
    charmLevel: raw.charmLevel ?? 0,
  };
}
