import type { AllClassName } from './class-group-map';

export const finalClassNames = [
  /* 모험가 */
  /* 모험가 전사  */
  '히어로',
  '팔라딘',
  '다크나이트',
  /* 모험가 마법사 */
  '아크메이지(불,독)',
  '아크메이지(썬,콜)',
  '비숍',
  /* 모험가 궁수 */
  '보우마스터',
  '신궁',
  '패스파인더',
  /* 모험가 도적 */
  '나이트로드',
  '섀도어',
  '듀얼블레이더',
  /* 모험가 해적 */
  '바이퍼',
  '캡틴',
  '캐논마스터',
  /* 시그너스 기사단 */
  '소울마스터',
  '플레임위자드',
  '윈드브레이커',
  '나이트워커',
  '스트라이커',
  '미하일',
  /* 영웅 */
  '아란',
  '에반',
  '메르세데스',
  '팬텀',
  '은월',
  '루미너스',
  /* 레지스탕스 & 데몬 */
  '데몬슬레이어',
  '데몬어벤져',
  '배틀메이지',
  '와일드헌터',
  '메카닉',
  '제논',
  '블래스터',
  /* 노바 */
  '카이저',
  '카인',
  '카데나',
  '엔젤릭버스터',
  /* 초월자 */
  '제로',
  /* 프렌즈월드 */
  '키네시스',
  /* 레프 */
  '아델',
  '일리움',
  '칼리',
  '아크',
  /* 아니마  */
  '렌',
  '라라',
  '호영',
] as const satisfies readonly AllClassName[];

export type FinalClassName = (typeof finalClassNames)[number];

export const adventurerClassNames = [
  '검사',
  '스피어맨',
  '버서커',
  '다크나이트',
  '파이터',
  '크루세이더',
  '히어로',
  '페이지',
  '나이트',
  '팔라딘',
  '아처',
  '헌터',
  '레인저',
  '보우마스터',
  '사수',
  '저격수',
  '신궁',
  '에이션트 아처',
  '체이서',
  '패스파인더',
  '메지션',
  '위자드(불,독)',
  '메이지(불,독)',
  '아크메이지(불,독)',
  '위자드(썬,콜)',
  '메이지(썬,콜)',
  '아크메이지(썬,콜)',
  '클레릭',
  '프리스트',
  '비숍',
  '로그',
  '어쌔신',
  '허밋',
  '나이트로드',
  '시프',
  '시프마스터',
  '섀도어',
  '세미듀어러',
  '듀어러',
  '듀얼마스터',
  '슬래셔',
  '듀얼블레이더',
  '해적',
  '인파이터',
  '버커니어',
  '바이퍼',
  '건슬링거',
  '발키리',
  '캡틴',
  '캐논슈터',
  '캐논블래스터',
  '캐논마스터',
] as const;

export const cygnusClassNames = ['미하일', '소울마스터', '플레임위자드', '윈드브레이커', '나이트워커', '스트라이커'] as const;

export const heroesClassNames = ['아란', '에반', '루미너스', '메르세데스', '팬텀', '은월'] as const;

export const resistanceClassNames = ['블래스터', '데몬어벤져', '데몬슬레이어', '배틀메이지', '와일드헌터', '제논', '메카닉'] as const;

export const demonClassNames = ['데몬어벤져', '데몬슬레이어'] as const;

export const resistanceSkillClassNames = ['블래스터', '배틀메이지', '와일드헌터', '제논', '메카닉'] as const;

export const novaClassNames = ['카이저', '카인', '카데나', '엔젤릭버스터'] as const;

export const transcendentClassNames = ['제로'] as const;

export const friendsWorldClassNames = ['키네시스'] as const;

export const lefClassNames = ['아델', '일리움', '칼리', '아크'] as const;

export const animaClassNames = ['렌', '라라', '호영'] as const;

/** 모험가 직업군 */
export type AdventurerClassName = (typeof adventurerClassNames)[number];
/** 시그너스 직업군 */
export type CygnusClassName = (typeof cygnusClassNames)[number];
/** 영웅 직업군 */
export type HeroesClassName = (typeof heroesClassNames)[number];
/** 레지스탕스 직업군 **/
export type ResistanceClassName = (typeof resistanceClassNames)[number];
/** 데몬 직업군 */
export type DemonClassName = (typeof demonClassNames)[number];
/** 스킬 공용 규칙에서 데몬을 제외한 레지스탕스 직업군 */
export type ResistanceSkillClassName = (typeof resistanceSkillClassNames)[number];
/** 노바 직업군 */
export type NovaClassName = (typeof novaClassNames)[number];
/** 초월자 직업군 */
export type TranscendentClassName = (typeof transcendentClassNames)[number];
/** 프렌즈월드 직업군 */
export type FriendsWorldClassName = (typeof friendsWorldClassNames)[number];
/** 레프 직업군 */
export type LefClassName = (typeof lefClassNames)[number];
/** 아니마 직업군 */
export type AnimaClassName = (typeof animaClassNames)[number];
