import type { CommonSkillSet } from '@/skill/types';

export const novaClassSkills = {
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
    active: ['판테온', '그란디스 여신의 축복'],
    passive: [],
  },
  sixth: {
    active: ['판테온 VI'],
  },
} as const satisfies CommonSkillSet;
