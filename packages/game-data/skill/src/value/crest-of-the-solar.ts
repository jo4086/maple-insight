import type { FinalClassNameKey } from '@maple/data-class';

import type { LinearDamagePercent } from '@/types';

type CrestOfTheSolarAttackKey = '미트라의 불꽃' | '불꽃의 문양 2인' | '불꽃의 문양 1인';

/**
 * 크레스트 오브 더 솔라
 * */
export const crestOfTheSolar = {
  hero: {
    '미트라의 불꽃': {
      base: 750,
      perLevel: 30,
    },
    '불꽃의 문양 2인': {
      base: 200,
      perLevel: 8,
    },
    '불꽃의 문양 1인': {
      base: 275,
      perLevel: 11,
    },
  },
  paladin: {
    '미트라의 불꽃': {
      base: 1274,
      perLevel: 51,
    },
    '불꽃의 문양 2인': {
      base: 328,
      perLevel: 14,
    },
    '불꽃의 문양 1인': {
      base: 458,
      perLevel: 19,
    },
  },
  'dark-knight': {
    '미트라의 불꽃': {
      base: 1037,
      perLevel: 42,
    },
    '불꽃의 문양 2인': {
      base: 283,
      perLevel: 11,
    },
    '불꽃의 문양 1인': {
      base: 392,
      perLevel: 15,
    },
  },
  'arch-mage-fire-poison': {
    '미트라의 불꽃': {
      base: 750,
      perLevel: 30,
    },
    '불꽃의 문양 2인': {
      base: 200,
      perLevel: 8,
    },
    '불꽃의 문양 1인': {
      base: 275,
      perLevel: 11,
    },
  },
  'arch-mage-ice-lightning': {
    '미트라의 불꽃': {
      base: 899,
      perLevel: 35,
    },
    '불꽃의 문양 2인': {
      base: 250,
      perLevel: 9,
    },
    '불꽃의 문양 1인': {
      base: 325,
      perLevel: 13,
    },
  },
  bishop: {
    '미트라의 불꽃': {
      base: 750,
      perLevel: 30,
    },
    '불꽃의 문양 2인': {
      base: 200,
      perLevel: 8,
    },
    '불꽃의 문양 1인': {
      base: 275,
      perLevel: 11,
    },
  },
  'bow-master': {
    '미트라의 불꽃': {
      base: 1485,
      perLevel: 59,
    },
    '불꽃의 문양 2인': {
      base: 396,
      perLevel: 16,
    },
    '불꽃의 문양 1인': {
      base: 545,
      perLevel: 22,
    },
  },
  marksman: {
    '미트라의 불꽃': {
      base: 1358,
      perLevel: 54,
    },
    '불꽃의 문양 2인': {
      base: 362,
      perLevel: 14,
    },
    '불꽃의 문양 1인': {
      base: 498,
      perLevel: 20,
    },
  },
  pathfinder: {
    '미트라의 불꽃': {
      base: 1913,
      perLevel: 77,
    },
    '불꽃의 문양 2인': {
      base: 510,
      perLevel: 20,
    },
    '불꽃의 문양 1인': {
      base: 701,
      perLevel: 28,
    },
  },
  'night-lord': {
    '미트라의 불꽃': {
      base: 1535,
      perLevel: 61,
    },
    '불꽃의 문양 2인': {
      base: 417,
      perLevel: 16,
    },
    '불꽃의 문양 1인': {
      base: 574,
      perLevel: 22,
    },
  },
  shadower: {
    '미트라의 불꽃': {
      base: 1572,
      perLevel: 62,
    },
    '불꽃의 문양 2인': {
      base: 405,
      perLevel: 17,
    },
    '불꽃의 문양 1인': {
      base: 568,
      perLevel: 23,
    },
  },
  'dual-blader': {
    '미트라의 불꽃': {
      base: 1237,
      perLevel: 49,
    },
    '불꽃의 문양 2인': {
      base: 332,
      perLevel: 13,
    },
    '불꽃의 문양 1인': {
      base: 452,
      perLevel: 18,
    },
  },
  viper: {
    '미트라의 불꽃': {
      base: 1200,
      perLevel: 47,
    },
    '불꽃의 문양 2인': {
      base: 306,
      perLevel: 13,
    },
    '불꽃의 문양 1인': {
      base: 447,
      perLevel: 17,
    },
  },
  captain: {
    '미트라의 불꽃': {
      base: 1523,
      perLevel: 60,
    },
    '불꽃의 문양 2인': {
      base: 406,
      perLevel: 16,
    },
    '불꽃의 문양 1인': {
      base: 558,
      perLevel: 22,
    },
  },
  'cannon-master': {
    '미트라의 불꽃': {
      base: 1590,
      perLevel: 63,
    },
    '불꽃의 문양 2인': {
      base: 418,
      perLevel: 17,
    },
    '불꽃의 문양 1인': {
      base: 586,
      perLevel: 23,
    },
  },
  mikhail: {
    '미트라의 불꽃': {
      base: 879,
      perLevel: 35,
    },
    '불꽃의 문양 2인': {
      base: 317,
      perLevel: 13,
    },
    '불꽃의 문양 1인': {
      base: 244,
      perLevel: 9,
    },
  },
  'soul-master': {
    '미트라의 불꽃': {
      base: 1804,
      perLevel: 71,
    },
    '불꽃의 문양 2인': {
      base: 662,
      perLevel: 26,
    },
    '불꽃의 문양 1인': {
      base: 479,
      perLevel: 19,
    },
  },
  'flame-wizard': {
    '미트라의 불꽃': {
      base: 1640,
      perLevel: 65,
    },
    '불꽃의 문양 2인': {
      base: 596,
      perLevel: 24,
    },
    '불꽃의 문양 1인': {
      base: 447,
      perLevel: 17,
    },
  },
  'wind-breaker': {
    '미트라의 불꽃': {
      base: 1688,
      perLevel: 67,
    },
    '불꽃의 문양 2인': {
      base: 606,
      perLevel: 25,
    },
    '불꽃의 문양 1인': {
      base: 446,
      perLevel: 18,
    },
  },
  'night-walker': {
    '미트라의 불꽃': {
      base: 1389,
      perLevel: 56,
    },
    '불꽃의 문양 2인': {
      base: 494,
      perLevel: 21,
    },
    '불꽃의 문양 1인': {
      base: 369,
      perLevel: 15,
    },
  },
  striker: {
    '미트라의 불꽃': {
      base: 1175,
      perLevel: 47,
    },
    '불꽃의 문양 2인': {
      base: 438,
      perLevel: 17,
    },
    '불꽃의 문양 1인': {
      base: 300,
      perLevel: 13,
    },
  },
  aran: {
    '미트라의 불꽃': {
      base: 1989,
      perLevel: 79,
    },
    '불꽃의 문양 2인': {
      base: 532,
      perLevel: 21,
    },
    '불꽃의 문양 1인': {
      base: 728,
      perLevel: 29,
    },
  },
  luminous: {
    '미트라의 불꽃': {
      base: 1659,
      perLevel: 66,
    },
    '불꽃의 문양 2인': {
      base: 430,
      perLevel: 18,
    },
    '불꽃의 문양 1인': {
      base: 614,
      perLevel: 24,
    },
  },
  evan: {
    '미트라의 불꽃': {
      base: 1549,
      perLevel: 61,
    },
    '불꽃의 문양 2인': {
      base: 421,
      perLevel: 16,
    },
    '불꽃의 문양 1인': {
      base: 549,
      perLevel: 23,
    },
  },
  mercedes: {
    '미트라의 불꽃': {
      base: 1441,
      perLevel: 58,
    },
    '불꽃의 문양 2인': {
      base: 398,
      perLevel: 15,
    },
    '불꽃의 문양 1인': {
      base: 536,
      perLevel: 21,
    },
  },
  phantom: {
    '미트라의 불꽃': {
      base: 958,
      perLevel: 39,
    },
    '불꽃의 문양 2인': {
      base: 267,
      perLevel: 10,
    },
    '불꽃의 문양 1인': {
      base: 360,
      perLevel: 14,
    },
  },
  eunwol: {
    '미트라의 불꽃': {
      base: 1169,
      perLevel: 47,
    },
    '불꽃의 문양 2인': {
      base: 298,
      perLevel: 13,
    },
    '불꽃의 문양 1인': {
      base: 435,
      perLevel: 17,
    },
  },
  blaster: {
    '미트라의 불꽃': {
      base: 1363,
      perLevel: 54,
    },
    '불꽃의 문양 2인': {
      base: 376,
      perLevel: 14,
    },
    '불꽃의 문양 1인': {
      base: 494,
      perLevel: 20,
    },
  },
  'battle-mage': {
    '미트라의 불꽃': {
      base: 1856,
      perLevel: 75,
    },
    '불꽃의 문양 2인': {
      base: 495,
      perLevel: 20,
    },
    '불꽃의 문양 1인': {
      base: 696,
      perLevel: 27,
    },
  },
  'wild-hunter': {
    '미트라의 불꽃': {
      base: 1360,
      perLevel: 55,
    },
    '불꽃의 문양 2인': {
      base: 353,
      perLevel: 15,
    },
    '불꽃의 문양 1인': {
      base: 504,
      perLevel: 20,
    },
  },
  mechanic: {
    '미트라의 불꽃': {
      base: 2046,
      perLevel: 82,
    },
    '불꽃의 문양 2인': {
      base: 542,
      perLevel: 22,
    },
    '불꽃의 문양 1인': {
      base: 752,
      perLevel: 30,
    },
  },
  xenon: {
    '미트라의 불꽃': {
      base: 1263,
      perLevel: 50,
    },
    '불꽃의 문양 2인': {
      base: 347,
      perLevel: 13,
    },
    '불꽃의 문양 1인': {
      base: 473,
      perLevel: 18,
    },
  },
  'demon-slayer': {
    '미트라의 불꽃': {
      base: 2047,
      perLevel: 81,
    },
    '불꽃의 문양 2인': {
      base: 534,
      perLevel: 22,
    },
    '불꽃의 문양 1인': {
      base: 742,
      perLevel: 30,
    },
  },
  'demon-avenger': {
    '미트라의 불꽃': {
      base: 1430,
      perLevel: 57,
    },
    '불꽃의 문양 2인': {
      base: 387,
      perLevel: 15,
    },
    '불꽃의 문양 1인': {
      base: 521,
      perLevel: 21,
    },
  },
  kaiser: {
    '미트라의 불꽃': {
      base: 1799,
      perLevel: 73,
    },
    '불꽃의 문양 2인': {
      base: 494,
      perLevel: 19,
    },
    '불꽃의 문양 1인': {
      base: 653,
      perLevel: 27,
    },
  },
  kain: {
    '미트라의 불꽃': {
      base: 1222,
      perLevel: 49,
    },
    '불꽃의 문양 2인': {
      base: 328,
      perLevel: 13,
    },
    '불꽃의 문양 1인': {
      base: 447,
      perLevel: 18,
    },
  },
  cadena: {
    '미트라의 불꽃': {
      base: 1123,
      perLevel: 44,
    },
    '불꽃의 문양 2인': {
      base: 291,
      perLevel: 12,
    },
    '불꽃의 문양 1인': {
      base: 416,
      perLevel: 16,
    },
  },
  'angelic-buster': {
    '미트라의 불꽃': {
      base: 1322,
      perLevel: 53,
    },
    '불꽃의 문양 2인': {
      base: 356,
      perLevel: 14,
    },
    '불꽃의 문양 1인': {
      base: 498,
      perLevel: 19,
    },
  },
  zero: {
    '미트라의 불꽃': {
      base: 1487,
      perLevel: 59,
    },
    '불꽃의 문양 2인': {
      base: 389,
      perLevel: 16,
    },
    '불꽃의 문양 1인': {
      base: 534,
      perLevel: 22,
    },
  },
  kinesis: {
    '미트라의 불꽃': {
      base: 962,
      perLevel: 39,
    },
    '불꽃의 문양 2인': {
      base: 335,
      perLevel: 13,
    },
    '불꽃의 문양 1인': {
      base: 458,
      perLevel: 18,
    },
  },
  adele: {
    '미트라의 불꽃': {
      base: 1648,
      perLevel: 66,
    },
    '불꽃의 문양 2인': {
      base: 427,
      perLevel: 18,
    },
    '불꽃의 문양 1인': {
      base: 610,
      perLevel: 24,
    },
  },
  illium: {
    '미트라의 불꽃': {
      base: 1780,
      perLevel: 71,
    },
    '불꽃의 문양 2인': {
      base: 473,
      perLevel: 19,
    },
    '불꽃의 문양 1인': {
      base: 654,
      perLevel: 26,
    },
  },
  khali: {
    '미트라의 불꽃': {
      base: 1652,
      perLevel: 67,
    },
    '불꽃의 문양 2인': {
      base: 437,
      perLevel: 18,
    },
    '불꽃의 문양 1인': {
      base: 623,
      perLevel: 24,
    },
  },
  ark: {
    '미트라의 불꽃': {
      base: 1615,
      perLevel: 64,
    },
    '불꽃의 문양 2인': {
      base: 433,
      perLevel: 17,
    },
    '불꽃의 문양 1인': {
      base: 576,
      perLevel: 24,
    },
  },
  len: {
    '미트라의 불꽃': {
      base: 2101,
      perLevel: 84,
    },
    '불꽃의 문양 2인': {
      base: 572,
      perLevel: 22,
    },
    '불꽃의 문양 1인': {
      base: 764,
      perLevel: 31,
    },
  },
  lara: {
    '미트라의 불꽃': {
      base: 1651,
      perLevel: 67,
    },
    '불꽃의 문양 2인': {
      base: 436,
      perLevel: 18,
    },
    '불꽃의 문양 1인': {
      base: 622,
      perLevel: 24,
    },
  },
  hoyoung: {
    '미트라의 불꽃': {
      base: 1326,
      perLevel: 52,
    },
    '불꽃의 문양 2인': {
      base: 350,
      perLevel: 14,
    },
    '불꽃의 문양 1인': {
      base: 488,
      perLevel: 19,
    },
  },
} as const satisfies Partial<Record<FinalClassNameKey, Record<CrestOfTheSolarAttackKey, LinearDamagePercent>>>;
