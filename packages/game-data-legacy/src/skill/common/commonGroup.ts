import type { CommonSkillGroup } from '../types';

export type CommonSkillGroupCombination = {
  required: readonly CommonSkillGroup[];
  resolved: CommonSkillGroup;
};

export const commonSkillGroupCombinations = [
  { required: ['adventurer', 'warrior'], resolved: 'adventurerWarrior' },
  { required: ['adventurer', 'mage'], resolved: 'adventurerMage' },
  { required: ['adventurer', 'archer'], resolved: 'adventurerArcher' },
  { required: ['adventurer', 'thief'], resolved: 'adventurerThief' },
  { required: ['adventurer', 'pirate'], resolved: 'adventurerPirate' },
] as const satisfies readonly CommonSkillGroupCombination[];
