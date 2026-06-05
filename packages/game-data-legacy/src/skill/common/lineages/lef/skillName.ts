import type { CommonSkillSet } from '@/skill/types';

export const lefClassSkills = {
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
    active: ['매직 서킷 풀드라이브', '그란디스 여신의 축복'],
    passive: [],
  },
  sixth: {
    active: ['매직 서킷 풀드라이브 VI'],
  },
} as const satisfies CommonSkillSet;
