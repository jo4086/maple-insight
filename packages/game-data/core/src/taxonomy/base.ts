export const affiliationKeyMap = {
  모험가: 'adventurer',
  '시그너스 기사단': 'cygnus',
  영웅: 'heroes',
  레지스탕스: 'resistance',
  노바: 'nova',
  초월자: 'transcendent',
  '프렌즈 월드': 'friendsWorld',
  레프: 'lef',
  아니마: 'anima',
} as const;

export const lineageKeyMap = {
  ...affiliationKeyMap,
  데몬: 'demon',
} as const;

export const classGroupKeyMap = {
  전사: 'warrior',
  궁수: 'archer',
  마법사: 'mage',
  도적: 'thief',
  해적: 'pirate',
} as const;

export type Affiliation = (typeof affiliations)[number];
export type AffiliationKey = (typeof affiliationKeyMap)[Affiliation];
export const affiliations = ['모험가', '시그너스 기사단', '영웅', '레지스탕스', '노바', '초월자', '프렌즈 월드', '레프', '아니마'] as const;
export const affiliationKeys = Object.values(affiliationKeyMap) as AffiliationKey[];

export type Lineage = keyof typeof lineageKeyMap;
export type LineageKey = (typeof lineageKeyMap)[Lineage];
export const lineages = Object.keys(lineageKeyMap) as Lineage[];
export const lineageKeys = Object.values(lineageKeyMap) as LineageKey[];

export type ClassGroup = keyof typeof classGroupKeyMap;
export type ClassGroupKey = (typeof classGroupKeyMap)[ClassGroup];
export const classGroups = Object.keys(classGroupKeyMap) as ClassGroup[];
export const classGroupKeys = Object.values(classGroupKeyMap) as ClassGroupKey[];
