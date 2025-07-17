export const affiliationMap = {
  모험가: 'adventurer',
  시그너스: 'cygnus',
  레지스탕스: 'resistance',
  영웅: 'heroes',
  노바: 'nova',
  레프: 'lef',
  아니마: 'anima',
  초월자: 'overload',
  프렌즈: 'friends',
} as const;
export type AffiliationKo = keyof typeof affiliationMap;
export type AffiliationEn = (typeof affiliationMap)[AffiliationKo];
