import { WeaponConstantType } from './types';

type WeaponTypeConstantMap = Partial<Record<WeaponConstantType, number>>;

export const weaponConstantMap: WeaponTypeConstantMap = {
  한손도끼: 1.2,
  한손둔기: 1.2,
  스태프: 1.2,
  완드: 1.2,
  'ESP 리미터': 1.2,
  '매직 건틀렛': 1.2,
  '샤이닝 로드': 2,

  한손검: 1.24,

  활: 1.3,
  '듀얼 보우건': 1.3,
  단검: 1.3,
  블레이드: 1.3,
  케인: 1.3,
  데스페라도: 1.3,
  '에인션트 보우': 1.3,
  체인: 1.3,
  부채: 1.3,
  튜너: 1.3,
  '브레스 슈터': 1.3,
  차크람: 1.3,
  장검: 1.3,

  '에너지 소드': 1.3125,

  두손검: 1.34,
  두손도끼: 1.34,
  두손둔기: 1.34,
  태도: 1.34,

  석궁: 1.35,

  창: 1.49,
  폴암: 1.49,
  대검: 1.49,

  건: 1.5,
  핸드캐논: 1.5,

  너클: 1.7,
  소울슈터: 1.7,
  '건틀렛 리볼버': 1.7,

  아대: 1.75,
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
