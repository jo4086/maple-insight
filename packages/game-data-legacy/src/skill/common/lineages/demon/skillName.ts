import type { CommonSkillSet } from '@/skill/types';

export const demonClassSkills = {
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
    active: ['콜 마스테마', '이계 여신의 축복'],
    passive: [],
  },
  sixth: {
    active: ['콜 마스테마 VI'],
  },
} as const satisfies CommonSkillSet;
