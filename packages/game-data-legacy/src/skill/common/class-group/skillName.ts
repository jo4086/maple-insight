import { archerClassSkills } from './archer';
import { mageClassSkills } from './mage';
import { pirateClassSkills } from './pirate';
import { thiefClassSkills } from './thief';
import { warriorClassSkills } from './warrior';

import { SkillNameFromSkillSet } from '@/skill/types';

export const classGroupSkills = {
  warrior: warriorClassSkills,
  mage: mageClassSkills,
  archer: archerClassSkills,
  thief: thiefClassSkills,
  pirate: pirateClassSkills,
} as const;

export type ClassGroupSkillName = SkillNameFromSkillSet<typeof classGroupSkills>;
