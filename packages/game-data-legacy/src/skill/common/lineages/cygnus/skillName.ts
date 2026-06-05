import type { CommonSkillSet } from '@/skill/types';

export const cygnusClassSkills = {
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
    active: ['시그너스 팔랑크스', '여제 시그너스의 축복', '초월자 시그너스의 축복'],
    linkedGroups: [['여제 시그너스의 축복', '초월자 시그너스의 축복']],
    passive: [],
  },
  sixth: {
    active: ['시그너스 팔랑크스 VI'],
  },
} as const satisfies CommonSkillSet;
