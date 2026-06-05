import type { FinalClassNameKey } from '@maple/data-class';

import type { LinearDamagePercent } from '@/types';

type SpiderInMirrorAttackKey = '공간 붕괴' | '거울 속의 거미';

export const spiderInMirror = {
  hero: {
    '공간 붕괴': {
      base: 450,
      perLevel: 18,
    },
    '거울 속의 거미': {
      base: 175,
      perLevel: 7,
    },
  },
  paladin: {
    '공간 붕괴': {
      base: 752,
      perLevel: 31,
    },
    '거울 속의 거미': {
      base: 295,
      perLevel: 12,
    },
  },
  'dark-knight': {
    '공간 붕괴': {
      base: 628,
      perLevel: 25,
    },
    '거울 속의 거미': {
      base: 236,
      perLevel: 10,
    },
  },
  'arch-mage-fire-poison': {
    '공간 붕괴': {
      base: 450,
      perLevel: 18,
    },
    '거울 속의 거미': {
      base: 175,
      perLevel: 7,
    },
  },
  'arch-mage-ice-lightning': {
    '공간 붕괴': {
      base: 540,
      perLevel: 21,
    },
    '거울 속의 거미': {
      base: 215,
      perLevel: 8,
    },
  },
  bishop: {
    '공간 붕괴': {
      base: 450,
      perLevel: 18,
    },
    '거울 속의 거미': {
      base: 175,
      perLevel: 7,
    },
  },
  'bow-master': {
    '공간 붕괴': {
      base: 891,
      perLevel: 36,
    },
    '거울 속의 거미': {
      base: 347,
      perLevel: 14,
    },
  },
  marksman: {
    '공간 붕괴': {
      base: 815,
      perLevel: 33,
    },
    '거울 속의 거미': {
      base: 317,
      perLevel: 13,
    },
  },
  pathfinder: {
    '공간 붕괴': {
      base: 1148,
      perLevel: 46,
    },
    '거울 속의 거미': {
      base: 446,
      perLevel: 18,
    },
  },
  'night-lord': {
    '공간 붕괴': {
      base: 909,
      perLevel: 37,
    },
    '거울 속의 거미': {
      base: 365,
      perLevel: 14,
    },
  },
  shadower: {
    '공간 붕괴': {
      base: 949,
      perLevel: 37,
    },
    '거울 속의 거미': {
      base: 351,
      perLevel: 15,
    },
  },
  'dual-blader': {
    '공간 붕괴': {
      base: 724,
      perLevel: 30,
    },
    '거울 속의 거미': {
      base: 302,
      perLevel: 11,
    },
  },
  viper: {
    '공간 붕괴': {
      base: 726,
      perLevel: 28,
    },
    '거울 속의 거미': {
      base: 279,
      perLevel: 11,
    },
  },
  captain: {
    '공간 붕괴': {
      base: 914,
      perLevel: 36,
    },
    '거울 속의 거미': {
      base: 355,
      perLevel: 14,
    },
  },
  'cannon-master': {
    '공간 붕괴': {
      base: 948,
      perLevel: 38,
    },
    '거울 속의 거미': {
      base: 362,
      perLevel: 15,
    },
  },
  mikhail: {
    '공간 붕괴': {
      base: 527,
      perLevel: 21,
    },
    '거울 속의 거미': {
      base: 210,
      perLevel: 8,
    },
  },
  'soul-master': {
    '공간 붕괴': {
      base: 1071,
      perLevel: 43,
    },
    '거울 속의 거미': {
      base: 408,
      perLevel: 17,
    },
  },
  'flame-wizard': {
    '공간 붕괴': {
      base: 984,
      perLevel: 39,
    },
    '거울 속의 거미': {
      base: 388,
      perLevel: 15,
    },
  },
  'wind-breaker': {
    '공간 붕괴': {
      base: 1017,
      perLevel: 40,
    },
    '거울 속의 거미': {
      base: 381,
      perLevel: 16,
    },
  },
  'night-walker': {
    '공간 붕괴': {
      base: 821,
      perLevel: 34,
    },
    '거울 속의 거미': {
      base: 327,
      perLevel: 13,
    },
  },
  striker: {
    '공간 붕괴': {
      base: 711,
      perLevel: 28,
    },
    '거울 속의 거미': {
      base: 273,
      perLevel: 11,
    },
  },
  aran: {
    '공간 붕괴': {
      base: 1175,
      perLevel: 48,
    },
    '거울 속의 거미': {
      base: 477,
      perLevel: 18,
    },
  },
  luminous: {
    '공간 붕괴': {
      base: 983,
      perLevel: 40,
    },
    '거울 속의 거미': {
      base: 399,
      perLevel: 15,
    },
  },
  evan: {
    '공간 붕괴': {
      base: 917,
      perLevel: 37,
    },
    '거울 속의 거미': {
      base: 368,
      perLevel: 14,
    },
  },
  mercedes: {
    '공간 붕괴': {
      base: 859,
      perLevel: 35,
    },
    '거울 속의 거미': {
      base: 352,
      perLevel: 13,
    },
  },
  phantom: {
    '공간 붕괴': {
      base: 587,
      perLevel: 23,
    },
    '거울 속의 거미': {
      base: 227,
      perLevel: 9,
    },
  },
  eunwol: {
    '공간 붕괴': {
      base: 707,
      perLevel: 28,
    },
    '거울 속의 거미': {
      base: 272,
      perLevel: 11,
    },
  },
  blaster: {
    '공간 붕괴': {
      base: 800,
      perLevel: 33,
    },
    '거울 속의 거미': {
      base: 306,
      perLevel: 13,
    },
  },
  'battle-mage': {
    '공간 붕괴': {
      base: 1114,
      perLevel: 45,
    },
    '거울 속의 거미': {
      base: 448,
      perLevel: 17,
    },
  },
  'wild-hunter': {
    '공간 붕괴': {
      base: 816,
      perLevel: 33,
    },
    '거울 속의 거미': {
      base: 312,
      perLevel: 13,
    },
  },
  mechanic: {
    '공간 붕괴': {
      base: 1234,
      perLevel: 49,
    },
    '거울 속의 거미': {
      base: 481,
      perLevel: 19,
    },
  },
  xenon: {
    '공간 붕괴': {
      base: 758,
      perLevel: 30,
    },
    '거울 속의 거미': {
      base: 285,
      perLevel: 12,
    },
  },
  'demon-slayer': {
    '공간 붕괴': {
      base: 1216,
      perLevel: 49,
    },
    '거울 속의 거미': {
      base: 475,
      perLevel: 19,
    },
  },
  'demon-avenger': {
    '공간 붕괴': {
      base: 864,
      perLevel: 34,
    },
    '거울 속의 거미': {
      base: 343,
      perLevel: 13,
    },
  },
  kaiser: {
    '공간 붕괴': {
      base: 1073,
      perLevel: 44,
    },
    '거울 속의 거미': {
      base: 421,
      perLevel: 17,
    },
  },
  kain: {
    '공간 붕괴': {
      base: 745,
      perLevel: 29,
    },
    '거울 속의 거미': {
      base: 298,
      perLevel: 11,
    },
  },
  cadena: {
    '공간 붕괴': {
      base: 656,
      perLevel: 27,
    },
    '거울 속의 거미': {
      base: 270,
      perLevel: 10,
    },
  },
  'angelic-buster': {
    '공간 붕괴': {
      base: 787,
      perLevel: 32,
    },
    '거울 속의 거미': {
      base: 319,
      perLevel: 12,
    },
  },
  zero: {
    '공간 붕괴': {
      base: 874,
      perLevel: 36,
    },
    '거울 속의 거미': {
      base: 340,
      perLevel: 14,
    },
  },
  kinesis: {
    '공간 붕괴': {
      base: 546,
      perLevel: 21,
    },
    '거울 속의 거미': {
      base: 293,
      perLevel: 12,
    },
  },
  adele: {
    '공간 붕괴': {
      base: 977,
      perLevel: 40,
    },
    '거울 속의 거미': {
      base: 396,
      perLevel: 15,
    },
  },
  illium: {
    '공간 붕괴': {
      base: 1056,
      perLevel: 43,
    },
    '거울 속의 거미': {
      base: 402,
      perLevel: 17,
    },
  },
  khali: {
    '공간 붕괴': {
      base: 997,
      perLevel: 40,
    },
    '거울 속의 거미': {
      base: 375,
      perLevel: 16,
    },
  },
  ark: {
    '공간 붕괴': {
      base: 951,
      perLevel: 39,
    },
    '거울 속의 거미': {
      base: 375,
      perLevel: 15,
    },
  },
  len: {
    '공간 붕괴': {
      base: 1273,
      perLevel: 50,
    },
    '거울 속의 거미': {
      base: 478,
      perLevel: 20,
    },
  },
  lara: {
    '공간 붕괴': {
      base: 996,
      perLevel: 40,
    },
    '거울 속의 거미': {
      base: 374,
      perLevel: 16,
    },
  },
  hoyoung: {
    '공간 붕괴': {
      base: 802,
      perLevel: 31,
    },
    '거울 속의 거미': {
      base: 313,
      perLevel: 12,
    },
  },
} as const satisfies Partial<Record<FinalClassNameKey, Record<SpiderInMirrorAttackKey, LinearDamagePercent>>>;
