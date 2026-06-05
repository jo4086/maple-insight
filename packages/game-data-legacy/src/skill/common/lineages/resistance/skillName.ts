import type { CommonSkillSet } from '@/skill/types';

export const resistanceClassSkills = {
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
    active: ['레지스탕스 라인 인팬트리', '메이플월드 여신의 축복'],
    passive: [],
  },
  sixth: {
    active: ['레지스탕스 라인 인팬트리 VI'],
  },
} as const satisfies CommonSkillSet;
