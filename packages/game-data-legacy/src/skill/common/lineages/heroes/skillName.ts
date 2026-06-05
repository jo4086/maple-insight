import type { CommonSkillSet } from '@/skill/types';

export const heroesClassSkills = {
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
    active: ['프리드의 가호', '메이플월드 여신의 축복'],
    passive: [],
  },
  sixth: {
    active: ['프리드의 가호 VI'],
  },
} as const satisfies CommonSkillSet;
