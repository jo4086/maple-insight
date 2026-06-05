import type { ClassGroup, ClassName } from '@/class';

export type RawJobClassName = ClassName | readonly ClassName[];
export type RawJobCategory =
  | {
      kind: 'fifthSkillCore';
      scope: 'all';
      desc: string;
    }
  | {
      kind: 'fifthSkillCore';
      scope: 'classGroup';
      classGroup: ClassGroup;
      desc: string;
    }
  | {
      kind: 'sixthCore';
      scope: 'all';
      desc: string;
    }
  | {
      kind: 'sixthSpecialEnhancementCore';
      scope: 'all';
      desc: string;
    }
  | {
      kind: 'hexaStat';
      scope: 'all';
      desc: string;
    };

export const adventurerJobNameMap = {
  '000': '초보자',

  '100': '검사',
  '110': '파이터',
  '111': '크루세이더',
  '112': '히어로',
  '114': '히어로',
  '120': '페이지',
  '121': '나이트',
  '122': '팔라딘',
  '124': '팔라딘',
  '130': '스피어맨',
  '131': '버서커',
  '132': '다크나이트',
  '134': '다크나이트',

  '200': '메지션',
  '210': '위자드(불,독)',
  '211': '메이지(불,독)',
  '212': '아크메이지(불,독)',
  '214': '아크메이지(불,독)',
  '220': '위자드(썬,콜)',
  '221': '메이지(썬,콜)',
  '222': '아크메이지(썬,콜)',
  '224': '아크메이지(썬,콜)',
  '230': '클레릭',
  '231': '프리스트',
  '232': '비숍',
  '234': '비숍',

  '300': '아처',
  '301': '아처',
  '310': '헌터',
  '311': '레인저',
  '312': '보우마스터',
  '314': '보우마스터',
  '320': '사수',
  '321': '저격수',
  '322': '신궁',
  '324': '신궁',
  '330': '에이션트 아처',
  '331': '체이서',
  '332': '패스파인더',
  '334': '패스파인더',

  '400': '로그',
  '410': '어쌔신',
  '411': '허밋',
  '412': '나이트로드',
  '414': '나이트로드',
  '420': '시프',
  '421': '시프마스터',
  '422': '섀도어',
  '424': '섀도어',
  '430': '세미듀어러',
  '431': '듀어러',
  '432': '듀얼마스터',
  '433': '슬래셔',
  '434': '듀얼블레이더',
  '436': '듀얼블레이더',

  '500': '해적',
  '501': '해적',
  '510': '인파이터',
  '511': '버커니어',
  '512': '바이퍼',
  '514': '바이퍼',
  '520': '건슬링거',
  '521': '발키리',
  '522': '캡틴',
  '524': '캡틴',
  '530': '캐논슈터',
  '531': '캐논블래스터',
  '532': '캐논마스터',
  '534': '캐논마스터',
} as const satisfies Record<string, ClassName>;

export const cygnusJobNameMap = {
  '1000': '노블레스',

  '1100': '소울마스터',
  '1110': '소울마스터',
  '1111': '소울마스터',
  '1112': '소울마스터',
  '1114': '소울마스터',

  '1200': '플레임위자드',
  '1210': '플레임위자드',
  '1211': '플레임위자드',
  '1212': '플레임위자드',
  '1214': '플레임위자드',

  '1300': '윈드브레이커',
  '1310': '윈드브레이커',
  '1311': '윈드브레이커',
  '1312': '윈드브레이커',
  '1314': '윈드브레이커',

  '1400': '나이트워커',
  '1410': '나이트워커',
  '1411': '나이트워커',
  '1412': '나이트워커',
  '1414': '나이트워커',

  '1500': '스트라이커',
  '1510': '스트라이커',
  '1511': '스트라이커',
  '1512': '스트라이커',
  '1514': '스트라이커',
} as const satisfies Record<string, ClassName>;

export const heroesJobNameMap = {
  '2000': '아란',
  '2001': '에반',
  '2002': '메르세데스',
  '2003': '팬텀',
  '2004': '루미너스',
  '2005': '은월',

  '2100': '아란',
  '2110': '아란',
  '2111': '아란',
  '2112': '아란',
  '2114': '아란',

  '2200': '에반',
  '2211': '에반',
  '2214': '에반',
  '2217': '에반',
  '2220': '에반',

  '2300': '메르세데스',
  '2310': '메르세데스',
  '2311': '메르세데스',
  '2312': '메르세데스',
  '2314': '메르세데스',

  '2400': '팬텀',
  '2410': '팬텀',
  '2411': '팬텀',
  '2412': '팬텀',
  '2414': '팬텀',

  '2500': '은월',
  '2510': '은월',
  '2511': '은월',
  '2512': '은월',
  '2514': '은월',

  '2700': '루미너스',
  '2710': '루미너스',
  '2711': '루미너스',
  '2712': '루미너스',
  '2714': '루미너스',
} as const satisfies Record<string, ClassName>;

export const resistanceJobNameMap = {
  '3000': '시티즌',
  '3001': ['데몬슬레이어', '데몬어벤져'],
  '3002': '제논',

  '3100': '데몬슬레이어',
  '3110': '데몬슬레이어',
  '3111': '데몬슬레이어',
  '3112': '데몬슬레이어',
  '3114': '데몬슬레이어',

  '3101': '데몬어벤져',
  '3120': '데몬어벤져',
  '3121': '데몬어벤져',
  '3122': '데몬어벤져',
  '3124': '데몬어벤져',

  '3200': '배틀메이지',
  '3210': '배틀메이지',
  '3211': '배틀메이지',
  '3212': '배틀메이지',
  '3214': '배틀메이지',

  '3300': '와일드헌터',
  '3310': '와일드헌터',
  '3311': '와일드헌터',
  '3312': '와일드헌터',
  '3314': '와일드헌터',

  '3500': '메카닉',
  '3510': '메카닉',
  '3511': '메카닉',
  '3512': '메카닉',
  '3514': '메카닉',

  '3600': '제논',
  '3610': '제논',
  '3611': '제논',
  '3612': '제논',
  '3614': '제논',

  '3700': '블래스터',
  '3710': '블래스터',
  '3711': '블래스터',
  '3712': '블래스터',
  '3714': '블래스터',
} as const satisfies Record<string, RawJobClassName>;

export const mihileJobNameMap = {
  '5000': '미하일',
  '5100': '미하일',
  '5110': '미하일',
  '5111': '미하일',
  '5112': '미하일',
  '5114': '미하일',
} as const satisfies Record<string, RawJobClassName>;

export const novaJobNameMap = {
  '6000': '카이저',
  '6001': '엔젤릭버스터',
  '6002': '카데나',
  '6003': '카인',

  '6100': '카이저',
  '6110': '카이저',
  '6111': '카이저',
  '6112': '카이저',
  '6114': '카이저',

  '6300': '카인',
  '6310': '카인',
  '6311': '카인',
  '6312': '카인',
  '6314': '카인',

  '6400': '카데나',
  '6410': '카데나',
  '6411': '카데나',
  '6412': '카데나',
  '6414': '카데나',

  '6500': '엔젤릭버스터',
  '6510': '엔젤릭버스터',
  '6511': '엔젤릭버스터',
  '6512': '엔젤릭버스터',
  '6514': '엔젤릭버스터',
} as const satisfies Record<string, RawJobClassName>;

export const transcendentJobNameMap = {
  '10000': '제로',
  '10100': '제로',
  '10110': '제로',
  '10111': '제로',
  '10112': '제로',
  '10114': '제로',
} as const satisfies Record<string, RawJobClassName>;

export const friendsWorldJobNameMap = {
  '14000': '키네시스',
  '14200': '키네시스',
  '14210': '키네시스',
  '14211': '키네시스',
  '14212': '키네시스',
  '14214': '키네시스',
} as const satisfies Record<string, RawJobClassName>;

export const lefJobNameMap = {
  '15000': '일리움',
  '15001': '아크',
  '15002': '아델',
  '15003': '칼리',

  '15100': '아델',
  '15110': '아델',
  '15111': '아델',
  '15112': '아델',
  '15114': '아델',

  '15200': '일리움',
  '15210': '일리움',
  '15211': '일리움',
  '15212': '일리움',
  '15214': '일리움',

  '15400': '칼리',
  '15410': '칼리',
  '15411': '칼리',
  '15412': '칼리',
  '15414': '칼리',

  '15500': '아크',
  '15510': '아크',
  '15511': '아크',
  '15512': '아크',
  '15514': '아크',
} as const satisfies Record<string, RawJobClassName>;

export const animaJobNameMap = {
  '16000': '호영',
  '16001': '라라',
  '16002': '렌',

  '16100': '렌',
  '16110': '렌',
  '16111': '렌',
  '16112': '렌',
  '16114': '렌',

  '16200': '라라',
  '16210': '라라',
  '16211': '라라',
  '16212': '라라',
  '16214': '라라',

  '16400': '호영',
  '16410': '호영',
  '16411': '호영',
  '16412': '호영',
  '16414': '호영',
} as const satisfies Record<string, RawJobClassName>;

export const rawJobCategoryMap = {
  '40000': {
    kind: 'fifthSkillCore',
    scope: 'all',
    desc: '공용 5차 스킬 코어, 소속군 5차 스킬 코어, 전직업 강화 코어',
  },
  '40001': {
    kind: 'fifthSkillCore',
    scope: 'classGroup',
    classGroup: '전사',
    desc: '전사 공용 5차 스킬 코어와 전사 직업 전용 5차 스킬 코어',
  },
  '40002': {
    kind: 'fifthSkillCore',
    scope: 'classGroup',
    classGroup: '마법사',
    desc: '마법사 공용 5차 스킬 코어와 마법사 직업 전용 5차 스킬 코어',
  },
  '40003': {
    kind: 'fifthSkillCore',
    scope: 'classGroup',
    classGroup: '궁수',
    desc: '궁수 공용 5차 스킬 코어와 궁수 직업 전용 5차 스킬 코어',
  },
  '40004': {
    kind: 'fifthSkillCore',
    scope: 'classGroup',
    classGroup: '도적',
    desc: '도적 공용 5차 스킬 코어와 도적 직업 전용 5차 스킬 코어',
  },
  '40005': {
    kind: 'fifthSkillCore',
    scope: 'classGroup',
    classGroup: '해적',
    desc: '해적 공용 5차 스킬 코어와 해적 직업 전용 5차 스킬 코어',
  },
  '50000': {
    kind: 'sixthCore',
    scope: 'all',
    desc: '6차 공용 코어와 전직업 6차 강화 코어',
  },
  '50006': {
    kind: 'sixthSpecialEnhancementCore',
    scope: 'all',
    desc: '전직업 6차 강화 코어 중 단순 최종 데미지 증가가 아닌 특수 규칙 코어',
  },
  '50007': {
    kind: 'hexaStat',
    scope: 'all',
    desc: '헥사스탯',
  },
} as const satisfies Record<string, RawJobCategory>;

export const rawJobNameMap = {
  ...adventurerJobNameMap,
  ...cygnusJobNameMap,
  ...heroesJobNameMap,
  ...resistanceJobNameMap,
  ...mihileJobNameMap,
  ...novaJobNameMap,
  ...transcendentJobNameMap,
  ...friendsWorldJobNameMap,
  ...lefJobNameMap,
  ...animaJobNameMap,
} as const satisfies Record<string, RawJobClassName>;

export type AdventurerJobId = keyof typeof adventurerJobNameMap;
export type CygnusJobId = keyof typeof cygnusJobNameMap;
export type HeroesJobId = keyof typeof heroesJobNameMap;
export type ResistanceJobId = keyof typeof resistanceJobNameMap;
export type MihileJobId = keyof typeof mihileJobNameMap;
export type NovaJobId = keyof typeof novaJobNameMap;
export type TranscendentJobId = keyof typeof transcendentJobNameMap;
export type FriendsWorldJobId = keyof typeof friendsWorldJobNameMap;
export type LefJobId = keyof typeof lefJobNameMap;
export type AnimaJobId = keyof typeof animaJobNameMap;
export type RawJobId = keyof typeof rawJobNameMap;
export type RawJobCategoryId = keyof typeof rawJobCategoryMap;

function isClassNameArray(className: RawJobClassName): className is readonly ClassName[] {
  return Array.isArray(className);
}

export function getAdventurerClassNameByJobId(jobId: string): ClassName | undefined {
  return adventurerJobNameMap[jobId as AdventurerJobId];
}

export function getClassNameByJobId(jobId: string): RawJobClassName | undefined {
  return rawJobNameMap[jobId as RawJobId];
}

export function getClassNamesByJobId(jobId: string): readonly ClassName[] {
  const className = getClassNameByJobId(jobId);

  if (!className) {
    return [];
  }

  return isClassNameArray(className) ? className : [className];
}

export function getRawJobCategoryByJobId(jobId: string): RawJobCategory | undefined {
  return rawJobCategoryMap[jobId as RawJobCategoryId];
}
