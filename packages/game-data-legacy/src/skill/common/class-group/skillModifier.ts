import type { ClassGroupSkillName } from './skillName';

import type { SkillModifierTable } from '@/skill/types';

export const classGroupSkillModifier = {
  '럭키 다이스': [
    {
      type: 'modifier',
      variant: 'dice1',
      targetSkill: '럭키 다이스',
      targetField: 'cooldownSec',
      operation: 'multiply',
      value: 0.5,
    },
  ],
} as const satisfies SkillModifierTable<ClassGroupSkillName>;
