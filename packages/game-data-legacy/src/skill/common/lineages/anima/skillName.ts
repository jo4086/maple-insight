import type { CommonSkillSet } from '@/skill/types';

export const animaClassSkills = {
  special: {
    active: [],
    passive: [],
  },
  zero: {
    active: ['정령친화', '형상변이'],
    passive: [],
  },
  fourth: {
    active: [],
    passive: [],
  },
  fifth: {
    active: ['그란디스 여신의 축복', '화중군자'],
    passive: [],
  },
  sixth: {
    active: ['화중군자 VI'],
  },
} as const satisfies CommonSkillSet;
