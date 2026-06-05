import type { CommonSkillSet, SkillNameFromSkillSet } from '@/skill/types';

export const warriorClassSkills = {
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
    active: ['오라 웨폰', '바디 오브 스틸'],
    passive: [],
  },
  sixth: {
    active: [],
  },
} as const satisfies CommonSkillSet;

export type WarriorClassSkill = SkillNameFromSkillSet<typeof warriorClassSkills>;
