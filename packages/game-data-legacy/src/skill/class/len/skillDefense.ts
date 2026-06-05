import type { LenSkillName } from './skillName';

import type { SkillDefenseTable } from '@/skill/types';

export const lenSkillDefense = {
  강체: [
    {
      type: 'damageReduction',
      amount: {
        type: 'linear',
        base: 0,
        perLevel: 2,
      },
      appliesToMaxHpRateDamage: true,
    },
  ],
} as const satisfies SkillDefenseTable<LenSkillName>;
