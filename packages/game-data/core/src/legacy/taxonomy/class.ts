export const classGroups = ['전사', '궁수', '마법사', '도적', '해적'] as const;
export type ClassGroup = (typeof classGroups)[number];

export const warriorClassNames = [
  '검사',
  '파이터',
  '크루세이더',
  '히어로',
  '페이지',
  '나이트',
  '팔라딘',
  '스피어맨',
  '버서커',
  '다크나이트',
  '소울마스터',
  '미하일',
  '아란',
  '블래스터',
  '데몬슬레이어',
  '데몬어벤져',
  '카이저',
  '제로',
  '아델',
  '렌',
] as const;

export const mageClassNames = [
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
  '플레임위자드',
  '에반',
  '루미너스',
  '배틀메이지',
  '키네시스',
  '일리움',
  '라라',
] as const;

export const archerClassNames = [
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
  '윈드브레이커',
  '메르세데스',
  '와일드헌터',
  '카인',
] as const;

export const thiefClassNames = [
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
  '나이트워커',
  '팬텀',
  '제논',
  '카데나',
  '칼리',
  '호영',
] as const;

export const pirateClassNames = [
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
  '스트라이커',
  '은월',
  '제논',
  '메카닉',
  '엔젤릭버스터',
  '아크',
] as const;

export const classNames = [
  '초보자',
  '노블레스',
  '시티즌',

  '검사',
  '파이터',
  '크루세이더',
  '히어로',
  '페이지',
  '나이트',
  '팔라딘',
  '스피어맨',
  '버서커',
  '다크나이트',
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
  '소울마스터',
  '미하일',
  '윈드브레이커',
  '플레임위자드',
  '나이트워커',
  '스트라이커',
  '아란',
  '메르세데스',
  '에반',
  '루미너스',
  '팬텀',
  '은월',
  '블래스터',
  '와일드헌터',
  '배틀메이지',
  '제논',
  '메카닉',
  '데몬슬레이어',
  '데몬어벤져',
  '카이저',
  '카인',
  '카데나',
  '엔젤릭버스터',
  '제로',
  '키네시스',
  '아델',
  '일리움',
  '칼리',
  '아크',
  '렌',
  '라라',
  '호영',
] as const;

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

export const finalClassNames = [
  '히어로',
  '팔라딘',
  '다크나이트',

  '아크메이지(불,독)',
  '아크메이지(썬,콜)',
  '비숍',

  '보우마스터',
  '신궁',
  '패스파인더',

  '나이트로드',
  '섀도어',
  '듀얼블레이더',

  '바이퍼',
  '캡틴',
  '캐논마스터',

  '소울마스터',
  '플레임위자드',
  '윈드브레이커',
  '나이트워커',
  '스트라이커',
  '미하일',

  '아란',
  '에반',
  '메르세데스',
  '팬텀',
  '은월',
  '루미너스',

  '데몬슬레이어',
  '데몬어벤져',
  '배틀메이지',
  '와일드헌터',
  '메카닉',
  '제논',
  '블래스터',

  '카이저',
  '카인',
  '카데나',
  '엔젤릭버스터',

  '제로',
  '키네시스',

  '아델',
  '일리움',
  '칼리',
  '아크',

  '렌',
  '라라',
  '호영',
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

export const specialStatClassNames = ['시프', '시프마스터', '섀도어', '세미듀어러', '듀어러', '듀얼마스터', '슬래셔', '듀얼블레이더', '카데나', '제논', '데몬어벤져'] as const;

export type FinalClassName = (typeof finalClassNames)[number];

/** 전사 직업군 */
export type WarriorClassName = (typeof warriorClassNames)[number];
/** 마법사 직업군 */
export type MageClassName = (typeof mageClassNames)[number];
/** 궁수 직업군 */
export type ArcherClassName = (typeof archerClassNames)[number];
/** 도적 직업군 */
export type ThiefClassName = (typeof thiefClassNames)[number];
/** 해적 직업군 */
export type PirateClassName = (typeof pirateClassNames)[number];
/** 전체 직업 */
export type ClassName = (typeof classNames)[number];

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

/** 특수스탯 직업군 */
export type SpecialStatClassName = (typeof specialStatClassNames)[number];
