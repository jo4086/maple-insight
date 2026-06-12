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

export type AffiliationKey = (typeof affiliationKeyMap)[Affiliation];

export const affiliationKeys = Object.values(affiliationKeyMap) as AffiliationKey[];

export const affiliations = ['모험가', '시그너스 기사단', '영웅', '레지스탕스', '노바', '초월자', '프렌즈 월드', '레프', '아니마'] as const;
export type Affiliation = (typeof affiliations)[number];

export const classLineages = [...affiliations, '데몬'] as const;

export type ClassLineage = (typeof classLineages)[number];
