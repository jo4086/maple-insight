export type InternalClassType = '전사' | '궁수' | '마법사' | '도적' | '해적' | '공용' | '제논';

export type AffiliationLabelMap = {
  adventurer: '모험가';
  cygnusKnights: '시그너스 기사단';
  heroes: '영웅';
  demon: '데몬';
  resistance: '레지스탕스';
  nova: '노바';
  overlord: '초월자';
  friendsWorld: '프렌즈 월드';
  lef: '레프';
  anima: '아니마';
};

export type AffiliationKey = keyof AffiliationLabelMap;
export type Affiliation = AffiliationLabelMap[AffiliationKey];

type ClassGroup = {
  [K in AffiliationKey]: {
    label: AffiliationLabelMap[K];
    classes: readonly string[];
  };
};

export const warriorClassGroups: ClassGroup = {
  adventurer: {
    label: '모험가',
    classes: ['검사', '스피어맨', '버서커', '다크나이트', '파이터', '크루세이더', '히어로', '페이지', '나이트', '팔라딘'],
  },
  cygnusKnights: {
    label: '시그너스 기사단',
    classes: ['소울마스터', '미하일'],
  },
  heroes: {
    label: '영웅',
    classes: ['아란'],
  },
  demon: {
    label: '데몬',
    classes: ['데몬슬레이어', '데몬어벤져'],
  },
  resistance: {
    label: '레지스탕스',
    classes: ['블래스터'],
  },
  nova: {
    label: '노바',
    classes: ['카이저'],
  },
  overlord: {
    label: '초월자',
    classes: ['제로'],
  },
  friendsWorld: {
    label: '프렌즈 월드',
    classes: [],
  },
  lef: {
    label: '레프',
    classes: ['아델'],
  },
  anima: {
    label: '아니마',
    classes: ['렌'],
  },
} as const;

export const archerClassGroups: ClassGroup = {
  adventurer: {
    label: '모험가',
    classes: ['아처', '헌터', '레인저', '보우마스터', '사수', '저격수', '신궁', '에이션트 아처', '체이서', '패스파인더'],
  },
  cygnusKnights: {
    label: '시그너스 기사단',
    classes: ['윈드브레이커'],
  },
  heroes: {
    label: '영웅',
    classes: ['메르세데스'],
  },
  demon: {
    label: '데몬',
    classes: [],
  },
  resistance: {
    label: '레지스탕스',
    classes: ['와일드헌터'],
  },
  nova: {
    label: '노바',
    classes: ['카인'],
  },
  overlord: {
    label: '초월자',
    classes: [],
  },
  friendsWorld: {
    label: '프렌즈 월드',
    classes: [],
  },
  lef: {
    label: '레프',
    classes: [],
  },
  anima: {
    label: '아니마',
    classes: [],
  },
} as const;

export const mageClassGroups: ClassGroup = {
  adventurer: {
    label: '모험가',
    classes: ['메이션', '위자드(불,독)', '메이지(불,독)', '아크메이지(불,독)', '위자드(썬,콜)', '메이지(썬,콜)', '아크메이지(썬,콜)', '클레릭', '프리스트', '비숍'],
  },
  cygnusKnights: {
    label: '시그너스 기사단',
    classes: ['플레임위자드'],
  },
  heroes: {
    label: '영웅',
    classes: ['에반', '루미너스'],
  },
  demon: {
    label: '데몬',
    classes: [],
  },
  resistance: {
    label: '레지스탕스',
    classes: ['배틀메이지'],
  },
  nova: {
    label: '노바',
    classes: [],
  },
  overlord: {
    label: '초월자',
    classes: [],
  },
  friendsWorld: {
    label: '프렌즈 월드',
    classes: ['키네시스'],
  },
  lef: {
    label: '레프',
    classes: ['일리움'],
  },
  anima: {
    label: '아니마',
    classes: ['라라'],
  },
} as const;

export const thiefClassGroups: ClassGroup = {
  adventurer: {
    label: '모험가',
    classes: ['로그', '어쌔신', '허밋', '나이트로드', '시프', '시프마스터', '섀도어', '세미듀어러', '듀어러', '듀얼마스터', '슬래셔', '듀얼블레이더'],
  },
  cygnusKnights: {
    label: '시그너스 기사단',
    classes: ['나이트워커'],
  },
  heroes: {
    label: '영웅',
    classes: ['팬텀'],
  },
  demon: {
    label: '데몬',
    classes: [],
  },
  resistance: {
    label: '레지스탕스',
    classes: ['제논'],
  },
  nova: {
    label: '노바',
    classes: ['카데나'],
  },
  overlord: {
    label: '초월자',
    classes: [],
  },
  friendsWorld: {
    label: '프렌즈 월드',
    classes: [],
  },
  lef: {
    label: '레프',
    classes: ['칼리'],
  },
  anima: {
    label: '아니마',
    classes: ['호영'],
  },
} as const;

export const pirateClassGroups: ClassGroup = {
  adventurer: {
    label: '모험가',
    classes: ['해적', '인파이터', '버커니어', '바이퍼', '건슬링거', '발키리', '캡틴', '캐논슈터', '캐논블래스터', '캐논마스터'],
  },
  cygnusKnights: {
    label: '시그너스 기사단',
    classes: ['스트라이커'],
  },
  heroes: {
    label: '영웅',
    classes: ['은월'],
  },
  demon: {
    label: '데몬',
    classes: [],
  },
  resistance: {
    label: '레지스탕스',
    classes: ['메카닉', '제논'],
  },
  nova: {
    label: '노바',
    classes: ['엔젤릭버스터'],
  },
  overlord: {
    label: '초월자',
    classes: [],
  },
  friendsWorld: {
    label: '프렌즈 월드',
    classes: [],
  },
  lef: {
    label: '레프',
    classes: ['아크'],
  },
  anima: {
    label: '아니마',
    classes: [],
  },
} as const;

export const classGroups = {
  warrior: {
    classType: '전사',
    affiliations: warriorClassGroups,
  },
  mage: {
    classType: '마법사',
    affiliations: mageClassGroups,
  },
  archer: {
    classType: '궁수',
    affiliations: archerClassGroups,
  },
  thief: {
    classType: '도적',
    affiliations: thiefClassGroups,
  },
  pirate: {
    classType: '해적',
    affiliations: pirateClassGroups,
  },
} as const;
