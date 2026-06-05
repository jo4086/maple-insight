import type { CommonSkillSet, SkillNameFromSkillSet } from '@/skill/types';

export const archerClassSkills = {
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
    active: ['가이디드 애로우', '크리티컬 리인포스'],
    passive: [],
  },
  sixth: {
    active: [],
  },
} as const satisfies CommonSkillSet;

export type ArcherClassSkill = SkillNameFromSkillSet<typeof archerClassSkills>;
