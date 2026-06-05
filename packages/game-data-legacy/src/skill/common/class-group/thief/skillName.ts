import type { CommonSkillSet, SkillNameFromSkillSet } from '@/skill/types';

export const thiefClassSkills = {
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
    active: ['베놈 버스트', '레디 투 다이'],
    passive: [],
  },
  sixth: {
    active: [],
  },
} as const satisfies CommonSkillSet;

export type ThiefClassSkill = SkillNameFromSkillSet<typeof thiefClassSkills>;
