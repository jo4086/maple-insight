export type CommonSkillGroup =
  | 'all'
  | 'adventurer'
  | 'adventurerWarrior'
  | 'adventurerMage'
  | 'adventurerArcher'
  | 'adventurerThief'
  | 'adventurerPirate'
  | 'cygnus'
  | 'resistance'
  | 'demon'
  | 'heroes'
  | 'transcendent'
  | 'friendsWorld'
  | 'nova'
  | 'lef'
  | 'anima'
  | 'warrior'
  | 'mage'
  | 'archer'
  | 'thief'
  | 'pirate';

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
