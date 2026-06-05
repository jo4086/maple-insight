import { createWeaponPartMetaBuilder, type WeaponPartMeta } from './builder';

import { oneHandedWeaponTypes, twoHandedWeaponTypes, weaponTypes, type WeaponType } from '@/types';

type WeaponConstantTypeLabel = WeaponType | 'blade';

type WeaponTypeConstantMap = Partial<Record<WeaponConstantTypeLabel, number>>;

const oneHandedWeaponTypeMetaMap = createWeaponPartMetaBuilder(oneHandedWeaponTypes)
  .add('oneHandedSword', {
    label: '한손검',
    handType: 'oneHanded',
    classGroup: '전사',
  })
  .add('oneHandedAxe', {
    label: '한손도끼',
    handType: 'oneHanded',
    classGroup: '전사',
  })
  .add('oneHandedBluntWeapon', {
    label: '한손둔기',
    handType: 'oneHanded',
    classGroup: '전사',
  })
  .add('desperado', {
    label: '데스페라도',
    handType: 'oneHanded',
    classGroup: '전사',
    requiredClass: '데몬어벤져',
  })
  .add('tuner', {
    label: '튜너',
    handType: 'oneHanded',
    classGroup: '전사',
    requiredClass: '아델',
  })
  .add('longSword', {
    label: '장검',
    handType: 'oneHanded',
    classGroup: '전사',
    requiredClass: '렌',
  })
  .add('wand', {
    label: '완드',
    handType: 'oneHanded',
    classGroup: '마법사',
  })
  .add('staff', {
    label: '스태프',
    handType: 'oneHanded',
    classGroup: '마법사',
  })
  .add('shiningRod', {
    label: '샤이닝 로드',
    handType: 'oneHanded',
    classGroup: '마법사',
    requiredClass: '루미너스',
  })
  .add('espLimiter', {
    label: 'ESP 리미터',
    handType: 'oneHanded',
    classGroup: '마법사',
    requiredClass: '키네시스',
  })
  .add('magicGauntlet', {
    label: '매직 건틀렛',
    handType: 'oneHanded',
    classGroup: '마법사',
    requiredClass: '일리움',
  })
  .add('breathShooter', {
    label: '브레스 슈터',
    handType: 'oneHanded',
    classGroup: '궁수',
    requiredClass: '카인',
  })
  .add('dagger', {
    label: '단검',
    handType: 'oneHanded',
    classGroup: '도적',
  })
  .add('cane', {
    label: '케인',
    handType: 'oneHanded',
    classGroup: '도적',
  })
  .add('chain', {
    label: '체인',
    handType: 'oneHanded',
    classGroup: '도적',
    requiredClass: '카데나',
  })
  .add('fan', {
    label: '부채',
    handType: 'oneHanded',
    classGroup: '도적',
    requiredClass: '호영',
  })
  .add('energySword', {
    label: '에너지 소드',
    handType: 'oneHanded',
    classGroup: ['도적', '해적'],
    requiredClass: '제논',
  })
  .add('soulShooter', {
    label: '소울슈터',
    handType: 'oneHanded',
    classGroup: '해적',
    requiredClass: '엔젤릭버스터',
  })
  .doneStrict();

const twoHandedWeaponTypeMetaMap = createWeaponPartMetaBuilder(twoHandedWeaponTypes)
  .add('twoHandedSword', {
    label: '두손검',
    handType: 'twoHanded',
    classGroup: '전사',
  })
  .add('twoHandedAxe', {
    label: '두손도끼',
    handType: 'twoHanded',
    classGroup: '전사',
  })
  .add('twoHandedBluntWeapon', {
    label: '두손둔기',
    handType: 'twoHanded',
    classGroup: '전사',
  })
  .add('spear', {
    label: '창',
    handType: 'twoHanded',
    classGroup: '전사',
  })
  .add('polearm', {
    label: '폴암',
    handType: 'twoHanded',
    classGroup: '전사',
  })
  .add('gauntletRevolver', {
    label: '건틀렛 리볼버',
    handType: 'twoHanded',
    classGroup: '전사',
    requiredClass: '블래스터',
  })
  .add('katana', {
    label: '태도',
    handType: 'twoHanded',
    classGroup: '전사',
    requiredClass: '제로',
  })
  .add('greatSword', {
    label: '대검',
    handType: 'twoHanded',
    classGroup: '전사',
    requiredClass: '제로',
  })
  .add('bow', {
    label: '활',
    handType: 'twoHanded',
    classGroup: '궁수',
  })
  .add('crossbow', {
    label: '석궁',
    handType: 'twoHanded',
    classGroup: '궁수',
  })
  .add('dualBowguns', {
    label: '듀얼 보우건',
    handType: 'twoHanded',
    classGroup: '궁수',
    requiredClass: '메르세데스',
  })
  .add('ancientBow', {
    label: '에인션트 보우',
    handType: 'twoHanded',
    classGroup: '궁수',
    requiredClass: '패스파인더',
  })
  .add('claw', {
    label: '아대',
    handType: 'twoHanded',
    classGroup: '도적',
  })
  .add('chakram', {
    label: '차크람',
    handType: 'twoHanded',
    classGroup: '도적',
    requiredClass: '칼리',
  })
  .add('knuckle', {
    label: '너클',
    handType: 'twoHanded',
    classGroup: '해적',
  })
  .add('gun', {
    label: '건',
    handType: 'twoHanded',
    classGroup: '해적',
  })
  .add('handCannon', {
    label: '핸드캐논',
    handType: 'twoHanded',
    classGroup: '해적',
  })
  .doneStrict();

export const weaponTypeMetaMap = {
  ...oneHandedWeaponTypeMetaMap,
  ...twoHandedWeaponTypeMetaMap,
} as const satisfies Record<WeaponType, WeaponPartMeta>;

export type WeaponTypeLabel = (typeof weaponTypeMetaMap)[WeaponType]['label'];

export const weaponTypeLabelMap = Object.fromEntries(weaponTypes.map((key) => [key, weaponTypeMetaMap[key].label])) as {
  [K in WeaponType]: (typeof weaponTypeMetaMap)[K]['label'];
};

export function resolveWeaponRequiredClass(meta: WeaponPartMeta): WeaponPartMeta['requiredClass'] | WeaponPartMeta['classGroup'] {
  return meta.requiredClass ?? meta.classGroup;
}

export const weaponConstantMap: WeaponTypeConstantMap = {
  oneHandedAxe: 1.2,
  oneHandedBluntWeapon: 1.2,
  staff: 1.2,
  wand: 1.2,
  espLimiter: 1.2,
  magicGauntlet: 1.2,
  shiningRod: 2,

  oneHandedSword: 1.24,

  bow: 1.3,
  dualBowguns: 1.3,
  dagger: 1.3,
  blade: 1.3,
  cane: 1.3,
  desperado: 1.3,
  ancientBow: 1.3,
  chain: 1.3,
  fan: 1.3,
  tuner: 1.3,
  breathShooter: 1.3,
  chakram: 1.3,
  longSword: 1.3,

  energySword: 1.3125,

  twoHandedSword: 1.34,
  twoHandedAxe: 1.34,
  twoHandedBluntWeapon: 1.34,
  katana: 1.34,

  crossbow: 1.35,

  spear: 1.49,
  polearm: 1.49,
  greatSword: 1.49,

  gun: 1.5,
  handCannon: 1.5,

  knuckle: 1.7,
  soulShooter: 1.7,
  gauntletRevolver: 1.7,

  claw: 1.75,
};

export const weaponConstantOverrideMap = {
  히어로: {
    한손검: 1.34,
    한손도끼: 1.34,
    두손검: 1.44,
    두손도끼: 1.44,
  },
  팔라딘: {
    한손둔기: 1.24,
  },
} as const;
