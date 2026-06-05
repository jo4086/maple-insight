export const affiliations = ['모험가', '시그너스 기사단', '영웅', '레지스탕스', '노바', '초월자', '프렌즈 월드', '레프', '아니마'] as const;

export type Affiliation = (typeof affiliations)[number];

export const affiliationMetaMap = {
  모험가: { key: 'adventurer', label: '모험가' },
  '시그너스 기사단': { key: 'cygnus', label: '시그너스 기사단' },
  영웅: { key: 'heroes', label: '영웅' },
  레지스탕스: { key: 'resistance', label: '레지스탕스' },
  노바: { key: 'nova', label: '노바' },
  초월자: { key: 'transcendent', label: '초월자' },
  '프렌즈 월드': { key: 'friendsWorld', label: '프렌즈 월드' },
  레프: { key: 'lef', label: '레프' },
  아니마: { key: 'anima', label: '아니마' },
} as const satisfies Record<Affiliation, { key: string; label: Affiliation }>;

export type AffiliationKey = (typeof affiliationMetaMap)[Affiliation]['key'];
