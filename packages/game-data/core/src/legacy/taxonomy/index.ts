import { affiliationKeyMap } from './affiliation';

export * from './className';
export * from './affiliation';
export * from './affiliationClass';
export * from './mapper';

export const classGroupKeyMap = {
  전사: 'warrior',
  궁수: 'archer',
  마법사: 'mage',
  도적: 'thief',
  해적: 'pirate',
} as const;

export type ClassGroup = keyof typeof classGroupKeyMap;
export type ClassGroupKey = (typeof classGroupKeyMap)[ClassGroup];
export const classGroups = Object.keys(classGroupKeyMap) as ClassGroup[];
export const classGroupKeys = Object.values(classGroupKeyMap) as ClassGroupKey[];

export const lineageKeyMap = {
  ...affiliationKeyMap,
  데몬: 'demon',
} as const;

export type Lineage = keyof typeof lineageKeyMap;
export type LineageKey = (typeof lineageKeyMap)[Lineage];
export const lineages = Object.keys(lineageKeyMap) as Lineage[];
export const lineageKeys = Object.values(lineageKeyMap) as LineageKey[];
