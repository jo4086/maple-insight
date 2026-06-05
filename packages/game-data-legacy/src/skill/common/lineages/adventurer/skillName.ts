import type { CommonSkillSet, SkillNameFromSkillSet } from '@/skill/types';

export const adventurerClassSkills = {
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
    active: ['메이플월드 여신의 축복'],
    passive: [],
  },
  sixth: {
    active: [],
  },
} as const satisfies CommonSkillSet;

export const adventurerWarriorClassSkills = {
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
    active: ['블리츠 실드'],
    passive: [],
  },
  sixth: {
    active: ['블리츠 실드 VI', '블리츠 버스트'],
    linkedGroups: [['블리츠 실드 VI', '블리츠 버스트']],
  },
} as const satisfies CommonSkillSet;

export const adventurerMageClassSkills = {
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
    active: ['아르카나 오버라이드'],
    passive: [],
  },
  sixth: {
    active: ['아르카나 오버라이드 VI'],
  },
} as const satisfies CommonSkillSet;

export const adventurerArcherClassSkills = {
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
    active: ['이볼브'],
    passive: [],
  },
  sixth: {
    active: ['이볼브 VI'],
  },
} as const satisfies CommonSkillSet;

export const adventurerThiefClassSkills = {
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
    active: ['얼티밋 다크사이트'],
    passive: ['얼티밋 다크사이트 VI'],
  },
  sixth: {
    active: [],
  },
} as const satisfies CommonSkillSet;

export const adventurerPirateClassSkills = {
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
    active: ['파이렛 플래그'],
    passive: [],
  },
  sixth: {
    active: ['파이렛 플래그 VI'],
  },
} as const satisfies CommonSkillSet;

export const adventurerSkills = {
  adventurer: adventurerClassSkills,
  warrior: adventurerWarriorClassSkills,
  mage: adventurerMageClassSkills,
  archer: adventurerArcherClassSkills,
  thief: adventurerThiefClassSkills,
  pirate: adventurerPirateClassSkills,
} as const;

export type AdventurerSkillName = SkillNameFromSkillSet<typeof adventurerSkills>;
