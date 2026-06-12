import {
  adventurerClassNames,
  animaClassNames,
  cygnusClassNames,
  demonClassNames,
  finalClassNames,
  friendsWorldClassNames,
  heroesClassNames,
  lefClassNames,
  novaClassNames,
  resistanceClassNames,
  resistanceSkillClassNames,
  transcendentClassNames,
} from '../class';

export const generatorKeys = [
  // 제너레이터가 생성할 키 목록
  'final',
  'adventurer',
  'cygnus',
  'heroes',
  'resistance',
  'demon',
  'resistanceSkill',
  'nova',
  'transcendent',
  'friendsWorld',
  'lef',
  'anima',
] as const;

export type GeneratorKey = (typeof generatorKeys)[number];

export const generatorClassNames = {
  final: finalClassNames,
  adventurer: adventurerClassNames,
  cygnus: cygnusClassNames,
  heroes: heroesClassNames,
  resistance: resistanceClassNames,
  demon: demonClassNames,
  friendsWorld: friendsWorldClassNames,
  nova: novaClassNames,
  transcendent: transcendentClassNames,
  lef: lefClassNames,
  anima: animaClassNames,
  resistanceSkill: resistanceSkillClassNames,
} as const satisfies Record<GeneratorKey, readonly string[]>;
