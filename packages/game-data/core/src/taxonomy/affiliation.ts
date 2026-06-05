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

export type Affiliation = keyof typeof affiliationKeyMap;

export type AffiliationKey = (typeof affiliationKeyMap)[Affiliation];

export const affiliations = Object.keys(affiliationKeyMap) as Affiliation[];

export const affiliationKeys = Object.values(affiliationKeyMap) as AffiliationKey[];
