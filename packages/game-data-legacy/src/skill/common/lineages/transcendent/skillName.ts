import type { CommonSkillSet } from '@/skill/types';

export const transcendentClassSkills = {
  special: {
    active: [],
    passive: [],
  },
  zero: {
    active: [],
    passive: [],
  },
  fourth: {
    active: [],
    passive: [],
  },
  fifth: {
    active: ['트랜센던트'],
    passive: [],
  },
  sixth: {
    active: ['트랜센던트 VI'],
  },
} as const satisfies CommonSkillSet;
