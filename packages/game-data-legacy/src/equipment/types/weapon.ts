export type MainWeaponHandType = '한손' | '두손';

export const oneHandedWeaponTypes = [
  '샤이닝 로드',
  '소울슈터',
  '데스페라도',
  '에너지 소드',
  '한손검',
  '한손도끼',
  '한손둔기',
  '단검',
  '케인',
  '완드',
  '스태프',
  'ESP 리미터',
  '체인',
  '매직 건틀렛',
  '부채',
  '튜너',
  '브레스 슈터',
  '장검',
] as const;

export const twoHandedWeaponTypes = [
  '두손검',
  '두손도끼',
  '두손둔기',
  '창',
  '폴암',
  '활',
  '석궁',
  '아대',
  '너클',
  '태도',
  '대검',
  '건',
  '듀얼 보우건',
  '핸드캐논',
  '건틀렛 리볼버',
  '에인션트 보우',
  '차크람',
] as const;

export const subWeaponTypes = [
  '메달',
  '로자리오',
  '방패',
  '쇠사슬',
  '마도서',
  '화살깃',
  '활골무',
  '렐릭',
  '부적',
  '단검용 검집',
  '블레이드',
  '리스트밴드',
  '조준기',
  '화약통',
  '보석',
  '무게추',
  '문서',
  '오브',
  '마법화살',
  '카드',
  '여우구슬',
  '마법구슬',
  '화살촉',
  '컨트롤러',
  '매그넘',
  '노바의 정수',
  '소울링',
  '체스피스',
  '장약',
  '무기 전송장치',
  '매직 윙',
  '패스',
  '선추',
  '브레이슬릿',
  '포스실드',
  '소울실드',
  '웨폰벨트',
  '노리개',
  '헥스시커',
  '여의보주',
] as const;

export type OneHandedWeaponType = (typeof oneHandedWeaponTypes)[number];
export type TwoHandedWeaponType = (typeof twoHandedWeaponTypes)[number];
export type MainWeaponType = OneHandedWeaponType | TwoHandedWeaponType;

export type SubWeaponType = (typeof subWeaponTypes)[number];

export type WeaponConstantType = MainWeaponType | Extract<SubWeaponType, '블레이드'>;
