import type { CommonSkillSet } from '@/skill/types';

export const friendsWorldClassSkills = {
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
    active: ['이계의 잔상', '이계 여신의 축복'],
    passive: [],
  },
  sixth: {
    active: ['이계의 잔상 VI'],
  },
} as const satisfies CommonSkillSet;
