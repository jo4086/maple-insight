import type { CommonSkillSet, SkillNameFromSkillSet } from '@/skill/types';

export const mageClassSkills = {
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
    active: ['오버로드 마나', '에테리얼 폼'],
    passive: [],
  },
  sixth: {
    active: [],
  },
} as const satisfies CommonSkillSet;

export type MageClassSkill = SkillNameFromSkillSet<typeof mageClassSkills>;
