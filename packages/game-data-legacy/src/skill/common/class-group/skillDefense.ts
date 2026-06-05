import type { ClassGroupSkillName } from './skillName';

import type { SkillDefenseTable } from '@/skill/types';

export const classGroupSkillDefense = {
  '에테리얼 폼': [
    {
      type: 'invincible',
      durationSec: 3,
    },
  ],
} as const satisfies SkillDefenseTable<ClassGroupSkillName>;
