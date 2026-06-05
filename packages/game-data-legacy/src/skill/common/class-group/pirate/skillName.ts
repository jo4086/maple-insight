import type { CommonSkillSet, SkillNameFromSkillSet } from '@/skill/types';

export const pirateClassSkills = {
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
    active: ['로디드 다이스', '오버 드라이브', '럭키 다이스'],
    passive: [],
  },
  sixth: {
    active: [],
  },
} as const satisfies CommonSkillSet;

export type PirateClassSkill = SkillNameFromSkillSet<typeof pirateClassSkills>;
