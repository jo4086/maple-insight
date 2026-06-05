import type { LenSkillName } from './skillName';

import type { SkillModifierTable } from '@/skill/types';

export const lenSkillModifier = {} as const satisfies SkillModifierTable<LenSkillName>;
