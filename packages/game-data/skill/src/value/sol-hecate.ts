import type { FinalClassNameKey } from '@maple/data-class';

import type { LinearDamagePercent } from '@/types';

type SolHecateAttackKey = '솔 에르다 입자';
type SolHecateStyxAttackKey = '발현' | '죽음의 씨앗' | '생명의 수확';
type SolHecatePhlegethonAttackKey = '명계의 격류' | '만개';

export const solHecate = {
  hero: {
    '솔 에르다 입자': {
      base: 103,
      perLevel: 8,
    },
  },
  paladin: {
    '솔 에르다 입자': {
      base: 195,
      perLevel: 12,
    },
  },
  'dark-knight': {
    '솔 에르다 입자': {
      base: 172,
      perLevel: 11,
    },
  },
  'arch-mage-fire-poison': {
    '솔 에르다 입자': {
      base: 125,
      perLevel: 9,
    },
  },
  'arch-mage-ice-lightning': {
    '솔 에르다 입자': {
      base: 176,
      perLevel: 11,
    },
  },
  bishop: {
    '솔 에르다 입자': {
      base: 126,
      perLevel: 8,
    },
  },
  'bow-master': {
    '솔 에르다 입자': {
      base: 256,
      perLevel: 18,
    },
  },
  marksman: {
    '솔 에르다 입자': {
      base: 303,
      perLevel: 18,
    },
  },
  pathfinder: {
    '솔 에르다 입자': {
      base: 374,
      perLevel: 26,
    },
  },
  'night-lord': {
    '솔 에르다 입자': {
      base: 255,
      perLevel: 18,
    },
  },
  shadower: {
    '솔 에르다 입자': {
      base: 258,
      perLevel: 18,
    },
  },
  'dual-blader': {
    '솔 에르다 입자': {
      base: 225,
      perLevel: 15,
    },
  },
  viper: {
    '솔 에르다 입자': {
      base: 195,
      perLevel: 14,
    },
  },
  captain: {
    '솔 에르다 입자': {
      base: 228,
      perLevel: 15,
    },
  },
  'cannon-master': {
    '솔 에르다 입자': {
      base: 605,
      perLevel: 40,
    },
  },
  mikhail: {
    '솔 에르다 입자': {
      base: 148,
      perLevel: 10,
    },
  },
  'soul-master': {
    '솔 에르다 입자': {
      base: 309,
      perLevel: 20,
    },
  },
  'flame-wizard': {
    '솔 에르다 입자': {
      base: 255,
      perLevel: 17,
    },
  },
  'wind-breaker': {
    '솔 에르다 입자': {
      base: 294,
      perLevel: 20,
    },
  },
  'night-walker': {
    '솔 에르다 입자': {
      base: 234,
      perLevel: 17,
    },
  },
  striker: {
    '솔 에르다 입자': {
      base: 209,
      perLevel: 14,
    },
  },
  aran: {
    '솔 에르다 입자': {
      base: 356,
      perLevel: 24,
    },
  },
  luminous: {
    '솔 에르다 입자': {
      base: 277,
      perLevel: 17,
    },
  },
  evan: {
    '솔 에르다 입자': {
      base: 241,
      perLevel: 17,
    },
  },
  mercedes: {
    '솔 에르다 입자': {
      base: 265,
      perLevel: 17,
    },
  },
  phantom: {
    '솔 에르다 입자': {
      base: 163,
      perLevel: 11,
    },
  },
  eunwol: {
    '솔 에르다 입자': {
      base: 180,
      perLevel: 13,
    },
  },
  blaster: {
    '솔 에르다 입자': {
      base: 204,
      perLevel: 13,
    },
  },
  'battle-mage': {
    '솔 에르다 입자': {
      base: 249,
      perLevel: 17,
    },
  },
  'wild-hunter': {
    '솔 에르다 입자': {
      base: 286,
      perLevel: 18,
    },
  },
  mechanic: {
    '솔 에르다 입자': {
      base: 313,
      perLevel: 20,
    },
  },
  xenon: {
    '솔 에르다 입자': {
      base: 196,
      perLevel: 14,
    },
  },
  'demon-slayer': {
    '솔 에르다 입자': {
      base: 366,
      perLevel: 23,
    },
  },
  'demon-avenger': {
    '솔 에르다 입자': {
      base: 255,
      perLevel: 17,
    },
  },
  kaiser: {
    '솔 에르다 입자': {
      base: 265,
      perLevel: 17,
    },
  },
  kain: {
    '솔 에르다 입자': {
      base: 230,
      perLevel: 14,
    },
  },
  cadena: {
    '솔 에르다 입자': {
      base: 210,
      perLevel: 14,
    },
  },
  'angelic-buster': {
    '솔 에르다 입자': {
      base: 267,
      perLevel: 15,
    },
  },
  zero: {
    '솔 에르다 입자': {
      base: 300,
      perLevel: 20,
    },
  },
  kinesis: {
    '솔 에르다 입자': {
      base: 188,
      perLevel: 13,
    },
  },
  adele: {
    '솔 에르다 입자': {
      base: 285,
      perLevel: 19,
    },
  },
  illium: {
    '솔 에르다 입자': {
      base: 405,
      perLevel: 27,
    },
  },
  khali: {
    '솔 에르다 입자': {
      base: 421,
      perLevel: 28,
    },
  },
  ark: {
    '솔 에르다 입자': {
      base: 267,
      perLevel: 19,
    },
  },
  len: {
    '솔 에르다 입자': {
      base: 330,
      perLevel: 23,
    },
  },
  lara: {
    '솔 에르다 입자': {
      base: 280,
      perLevel: 20,
    },
  },
  hoyoung: {
    '솔 에르다 입자': {
      base: 219,
      perLevel: 14,
    },
  },
} as const satisfies Partial<Record<FinalClassNameKey, Record<SolHecateAttackKey, LinearDamagePercent>>>;

export const solHecateStyx = {
  hero: {
    '발현': {
      base: 157,
      perLevel: 11,
    },
    '죽음의 씨앗': {
      base: 152,
      perLevel: 11,
    },
    '생명의 수확': {
      base: 190,
      perLevel: 12,
    },
  },
  paladin: {
    '발현': {
      base: 302,
      perLevel: 21,
    },
    '죽음의 씨앗': {
      base: 315,
      perLevel: 21,
    },
    '생명의 수확': {
      base: 350,
      perLevel: 24,
    },
  },
  'dark-knight': {
    '발현': {
      base: 356,
      perLevel: 24,
    },
    '죽음의 씨앗': {
      base: 334,
      perLevel: 22,
    },
    '생명의 수확': {
      base: 379,
      perLevel: 26,
    },
  },
  'arch-mage-fire-poison': {
    '발현': {
      base: 255,
      perLevel: 17,
    },
    '죽음의 씨앗': {
      base: 257,
      perLevel: 17,
    },
    '생명의 수확': {
      base: 304,
      perLevel: 20,
    },
  },
  'arch-mage-ice-lightning': {
    '발현': {
      base: 366,
      perLevel: 25,
    },
    '죽음의 씨앗': {
      base: 300,
      perLevel: 20,
    },
    '생명의 수확': {
      base: 354,
      perLevel: 23,
    },
  },
  bishop: {
    '발현': {
      base: 198,
      perLevel: 14,
    },
    '죽음의 씨앗': {
      base: 242,
      perLevel: 15,
    },
    '생명의 수확': {
      base: 290,
      perLevel: 19,
    },
  },
  'bow-master': {
    '발현': {
      base: 505,
      perLevel: 33,
    },
    '죽음의 씨앗': {
      base: 511,
      perLevel: 35,
    },
    '생명의 수확': {
      base: 622,
      perLevel: 40,
    },
  },
  marksman: {
    '발현': {
      base: 492,
      perLevel: 32,
    },
    '죽음의 씨앗': {
      base: 513,
      perLevel: 32,
    },
    '생명의 수확': {
      base: 576,
      perLevel: 37,
    },
  },
  pathfinder: {
    '발현': {
      base: 644,
      perLevel: 44,
    },
    '죽음의 씨앗': {
      base: 641,
      perLevel: 44,
    },
    '생명의 수확': {
      base: 731,
      perLevel: 50,
    },
  },
  'night-lord': {
    '발현': {
      base: 483,
      perLevel: 32,
    },
    '죽음의 씨앗': {
      base: 420,
      perLevel: 29,
    },
    '생명의 수확': {
      base: 511,
      perLevel: 35,
    },
  },
  shadower: {
    '발현': {
      base: 668,
      perLevel: 46,
    },
    '죽음의 씨앗': {
      base: 384,
      perLevel: 25,
    },
    '생명의 수확': {
      base: 453,
      perLevel: 29,
    },
  },
  'dual-blader': {
    '발현': {
      base: 420,
      perLevel: 28,
    },
    '죽음의 씨앗': {
      base: 345,
      perLevel: 23,
    },
    '생명의 수확': {
      base: 405,
      perLevel: 27,
    },
  },
  viper: {
    '발현': {
      base: 450,
      perLevel: 30,
    },
    '죽음의 씨앗': {
      base: 390,
      perLevel: 26,
    },
    '생명의 수확': {
      base: 525,
      perLevel: 35,
    },
  },
  captain: {
    '발현': {
      base: 511,
      perLevel: 34,
    },
    '죽음의 씨앗': {
      base: 491,
      perLevel: 32,
    },
    '생명의 수확': {
      base: 557,
      perLevel: 36,
    },
  },
  'cannon-master': {
    '발현': {
      base: 991,
      perLevel: 67,
    },
    '죽음의 씨앗': {
      base: 1154,
      perLevel: 77,
    },
    '생명의 수확': {
      base: 1024,
      perLevel: 68,
    },
  },
  mikhail: {
    '발현': {
      base: 260,
      perLevel: 16,
    },
    '죽음의 씨앗': {
      base: 252,
      perLevel: 16,
    },
    '생명의 수확': {
      base: 267,
      perLevel: 19,
    },
  },
  'soul-master': {
    '발현': {
      base: 588,
      perLevel: 39,
    },
    '죽음의 씨앗': {
      base: 580,
      perLevel: 38,
    },
    '생명의 수확': {
      base: 577,
      perLevel: 38,
    },
  },
  'flame-wizard': {
    '발현': {
      base: 555,
      perLevel: 37,
    },
    '죽음의 씨앗': {
      base: 555,
      perLevel: 37,
    },
    '생명의 수확': {
      base: 615,
      perLevel: 41,
    },
  },
  'wind-breaker': {
    '발현': {
      base: 518,
      perLevel: 35,
    },
    '죽음의 씨앗': {
      base: 517,
      perLevel: 35,
    },
    '생명의 수확': {
      base: 603,
      perLevel: 40,
    },
  },
  'night-walker': {
    '발현': {
      base: 406,
      perLevel: 26,
    },
    '죽음의 씨앗': {
      base: 412,
      perLevel: 26,
    },
    '생명의 수확': {
      base: 457,
      perLevel: 30,
    },
  },
  striker: {
    '발현': {
      base: 469,
      perLevel: 32,
    },
    '죽음의 씨앗': {
      base: 395,
      perLevel: 27,
    },
    '생명의 수확': {
      base: 466,
      perLevel: 31,
    },
  },
  aran: {
    '발현': {
      base: 796,
      perLevel: 54,
    },
    '죽음의 씨앗': {
      base: 813,
      perLevel: 53,
    },
    '생명의 수확': {
      base: 926,
      perLevel: 61,
    },
  },
  luminous: {
    '발현': {
      base: 473,
      perLevel: 31,
    },
    '죽음의 씨앗': {
      base: 461,
      perLevel: 31,
    },
    '생명의 수확': {
      base: 535,
      perLevel: 35,
    },
  },
  evan: {
    '발현': {
      base: 487,
      perLevel: 33,
    },
    '죽음의 씨앗': {
      base: 541,
      perLevel: 35,
    },
    '생명의 수확': {
      base: 615,
      perLevel: 42,
    },
  },
  mercedes: {
    '발현': {
      base: 465,
      perLevel: 31,
    },
    '죽음의 씨앗': {
      base: 463,
      perLevel: 31,
    },
    '생명의 수확': {
      base: 530,
      perLevel: 35,
    },
  },
  phantom: {
    '발현': {
      base: 284,
      perLevel: 20,
    },
    '죽음의 씨앗': {
      base: 278,
      perLevel: 20,
    },
    '생명의 수확': {
      base: 330,
      perLevel: 22,
    },
  },
  eunwol: {
    '발현': {
      base: 359,
      perLevel: 24,
    },
    '죽음의 씨앗': {
      base: 354,
      perLevel: 23,
    },
    '생명의 수확': {
      base: 413,
      perLevel: 27,
    },
  },
  blaster: {
    '발현': {
      base: 475,
      perLevel: 33,
    },
    '죽음의 씨앗': {
      base: 475,
      perLevel: 33,
    },
    '생명의 수확': {
      base: 555,
      perLevel: 37,
    },
  },
  'battle-mage': {
    '발현': {
      base: 590,
      perLevel: 39,
    },
    '죽음의 씨앗': {
      base: 578,
      perLevel: 39,
    },
    '생명의 수확': {
      base: 642,
      perLevel: 44,
    },
  },
  'wild-hunter': {
    '발현': {
      base: 471,
      perLevel: 32,
    },
    '죽음의 씨앗': {
      base: 480,
      perLevel: 31,
    },
    '생명의 수확': {
      base: 526,
      perLevel: 36,
    },
  },
  mechanic: {
    '발현': {
      base: 643,
      perLevel: 44,
    },
    '죽음의 씨앗': {
      base: 674,
      perLevel: 44,
    },
    '생명의 수확': {
      base: 768,
      perLevel: 52,
    },
  },
  xenon: {
    '발현': {
      base: 431,
      perLevel: 29,
    },
    '죽음의 씨앗': {
      base: 346,
      perLevel: 24,
    },
    '생명의 수확': {
      base: 411,
      perLevel: 27,
    },
  },
  'demon-slayer': {
    '발현': {
      base: 768,
      perLevel: 50,
    },
    '죽음의 씨앗': {
      base: 727,
      perLevel: 47,
    },
    '생명의 수확': {
      base: 762,
      perLevel: 50,
    },
  },
  'demon-avenger': {
    '발현': {
      base: 570,
      perLevel: 38,
    },
    '죽음의 씨앗': {
      base: 465,
      perLevel: 31,
    },
    '생명의 수확': {
      base: 525,
      perLevel: 35,
    },
  },
  kaiser: {
    '발현': {
      base: 720,
      perLevel: 47,
    },
    '죽음의 씨앗': {
      base: 554,
      perLevel: 37,
    },
    '생명의 수확': {
      base: 623,
      perLevel: 43,
    },
  },
  kain: {
    '발현': {
      base: 374,
      perLevel: 25,
    },
    '죽음의 씨앗': {
      base: 370,
      perLevel: 25,
    },
    '생명의 수확': {
      base: 441,
      perLevel: 28,
    },
  },
  cadena: {
    '발현': {
      base: 273,
      perLevel: 17,
    },
    '죽음의 씨앗': {
      base: 268,
      perLevel: 17,
    },
    '생명의 수확': {
      base: 292,
      perLevel: 20,
    },
  },
  'angelic-buster': {
    '발현': {
      base: 398,
      perLevel: 26,
    },
    '죽음의 씨앗': {
      base: 408,
      perLevel: 26,
    },
    '생명의 수확': {
      base: 460,
      perLevel: 30,
    },
  },
  zero: {
    '발현': {
      base: 558,
      perLevel: 37,
    },
    '죽음의 씨앗': {
      base: 568,
      perLevel: 39,
    },
    '생명의 수확': {
      base: 685,
      perLevel: 46,
    },
  },
  kinesis: {
    '발현': {
      base: 361,
      perLevel: 24,
    },
    '죽음의 씨앗': {
      base: 360,
      perLevel: 24,
    },
    '생명의 수확': {
      base: 422,
      perLevel: 27,
    },
  },
  adele: {
    '발현': {
      base: 510,
      perLevel: 34,
    },
    '죽음의 씨앗': {
      base: 486,
      perLevel: 34,
    },
    '생명의 수확': {
      base: 583,
      perLevel: 38,
    },
  },
  illium: {
    '발현': {
      base: 585,
      perLevel: 39,
    },
    '죽음의 씨앗': {
      base: 600,
      perLevel: 40,
    },
    '생명의 수확': {
      base: 675,
      perLevel: 45,
    },
  },
  khali: {
    '발현': {
      base: 501,
      perLevel: 33,
    },
    '죽음의 씨앗': {
      base: 495,
      perLevel: 32,
    },
    '생명의 수확': {
      base: 549,
      perLevel: 37,
    },
  },
  ark: {
    '발현': {
      base: 565,
      perLevel: 39,
    },
    '죽음의 씨앗': {
      base: 587,
      perLevel: 39,
    },
    '생명의 수확': {
      base: 662,
      perLevel: 45,
    },
  },
  len: {
    '발현': {
      base: 736,
      perLevel: 49,
    },
    '죽음의 씨앗': {
      base: 787,
      perLevel: 51,
    },
    '생명의 수확': {
      base: 880,
      perLevel: 60,
    },
  },
  lara: {
    '발현': {
      base: 667,
      perLevel: 43,
    },
    '죽음의 씨앗': {
      base: 494,
      perLevel: 32,
    },
    '생명의 수확': {
      base: 590,
      perLevel: 39,
    },
  },
  hoyoung: {
    '발현': {
      base: 354,
      perLevel: 23,
    },
    '죽음의 씨앗': {
      base: 349,
      perLevel: 23,
    },
    '생명의 수확': {
      base: 406,
      perLevel: 26,
    },
  },
} as const satisfies Partial<Record<FinalClassNameKey, Record<SolHecateStyxAttackKey, LinearDamagePercent>>>;

export const solHecatePhlegethon = {
  hero: {
    '명계의 격류': {
      base: 300,
      perLevel: 0,
    },
    '만개': {
      base: 240,
      perLevel: 0,
    },
  },
  paladin: {
    '명계의 격류': {
      base: 603,
      perLevel: 0,
    },
    '만개': {
      base: 472,
      perLevel: 0,
    },
  },
  'dark-knight': {
    '명계의 격류': {
      base: 690,
      perLevel: 0,
    },
    '만개': {
      base: 540,
      perLevel: 0,
    },
  },
  'arch-mage-fire-poison': {
    '명계의 격류': {
      base: 455,
      perLevel: 0,
    },
    '만개': {
      base: 341,
      perLevel: 0,
    },
  },
  'arch-mage-ice-lightning': {
    '명계의 격류': {
      base: 540,
      perLevel: 0,
    },
    '만개': {
      base: 420,
      perLevel: 0,
    },
  },
  bishop: {
    '명계의 격류': {
      base: 259,
      perLevel: 0,
    },
    '만개': {
      base: 203,
      perLevel: 0,
    },
  },
  'bow-master': {
    '명계의 격류': {
      base: 815,
      perLevel: 0,
    },
    '만개': {
      base: 674,
      perLevel: 0,
    },
  },
  marksman: {
    '명계의 격류': {
      base: 793,
      perLevel: 0,
    },
    '만개': {
      base: 629,
      perLevel: 0,
    },
  },
  pathfinder: {
    '명계의 격류': {
      base: 1102,
      perLevel: 0,
    },
    '만개': {
      base: 877,
      perLevel: 0,
    },
  },
  'night-lord': {
    '명계의 격류': {
      base: 909,
      perLevel: 0,
    },
    '만개': {
      base: 713,
      perLevel: 0,
    },
  },
  shadower: {
    '명계의 격류': {
      base: 787,
      perLevel: 0,
    },
    '만개': {
      base: 630,
      perLevel: 0,
    },
  },
  'dual-blader': {
    '명계의 격류': {
      base: 540,
      perLevel: 0,
    },
    '만개': {
      base: 520,
      perLevel: 0,
    },
  },
  viper: {
    '명계의 격류': {
      base: 693,
      perLevel: 0,
    },
    '만개': {
      base: 619,
      perLevel: 0,
    },
  },
  captain: {
    '명계의 격류': {
      base: 1025,
      perLevel: 0,
    },
    '만개': {
      base: 775,
      perLevel: 0,
    },
  },
  'cannon-master': {
    '명계의 격류': {
      base: 1446,
      perLevel: 0,
    },
    '만개': {
      base: 1732,
      perLevel: 0,
    },
  },
  mikhail: {
    '명계의 격류': {
      base: 443,
      perLevel: 0,
    },
    '만개': {
      base: 356,
      perLevel: 0,
    },
  },
  'soul-master': {
    '명계의 격류': {
      base: 1067,
      perLevel: 0,
    },
    '만개': {
      base: 851,
      perLevel: 0,
    },
  },
  'flame-wizard': {
    '명계의 격류': {
      base: 825,
      perLevel: 0,
    },
    '만개': {
      base: 1018,
      perLevel: 0,
    },
  },
  'wind-breaker': {
    '명계의 격류': {
      base: 882,
      perLevel: 0,
    },
    '만개': {
      base: 711,
      perLevel: 0,
    },
  },
  'night-walker': {
    '명계의 격류': {
      base: 673,
      perLevel: 0,
    },
    '만개': {
      base: 535,
      perLevel: 0,
    },
  },
  striker: {
    '명계의 격류': {
      base: 876,
      perLevel: 0,
    },
    '만개': {
      base: 698,
      perLevel: 0,
    },
  },
  aran: {
    '명계의 격류': {
      base: 1267,
      perLevel: 0,
    },
    '만개': {
      base: 1021,
      perLevel: 0,
    },
  },
  luminous: {
    '명계의 격류': {
      base: 925,
      perLevel: 0,
    },
    '만개': {
      base: 738,
      perLevel: 0,
    },
  },
  evan: {
    '명계의 격류': {
      base: 1068,
      perLevel: 0,
    },
    '만개': {
      base: 825,
      perLevel: 0,
    },
  },
  mercedes: {
    '명계의 격류': {
      base: 660,
      perLevel: 0,
    },
    '만개': {
      base: 573,
      perLevel: 0,
    },
  },
  phantom: {
    '명계의 격류': {
      base: 585,
      perLevel: 0,
    },
    '만개': {
      base: 440,
      perLevel: 0,
    },
  },
  eunwol: {
    '명계의 격류': {
      base: 631,
      perLevel: 0,
    },
    '만개': {
      base: 504,
      perLevel: 0,
    },
  },
  blaster: {
    '명계의 격류': {
      base: 1169,
      perLevel: 0,
    },
    '만개': {
      base: 962,
      perLevel: 0,
    },
  },
  'battle-mage': {
    '명계의 격류': {
      base: 1492,
      perLevel: 0,
    },
    '만개': {
      base: 1221,
      perLevel: 0,
    },
  },
  'wild-hunter': {
    '명계의 격류': {
      base: 787,
      perLevel: 0,
    },
    '만개': {
      base: 627,
      perLevel: 0,
    },
  },
  mechanic: {
    '명계의 격류': {
      base: 1264,
      perLevel: 0,
    },
    '만개': {
      base: 1010,
      perLevel: 0,
    },
  },
  xenon: {
    '명계의 격류': {
      base: 933,
      perLevel: 0,
    },
    '만개': {
      base: 739,
      perLevel: 0,
    },
  },
  'demon-slayer': {
    '명계의 격류': {
      base: 1249,
      perLevel: 0,
    },
    '만개': {
      base: 1001,
      perLevel: 0,
    },
  },
  'demon-avenger': {
    '명계의 격류': {
      base: 835,
      perLevel: 0,
    },
    '만개': {
      base: 665,
      perLevel: 0,
    },
  },
  kaiser: {
    '명계의 격류': {
      base: 1143,
      perLevel: 0,
    },
    '만개': {
      base: 831,
      perLevel: 0,
    },
  },
  kain: {
    '명계의 격류': {
      base: 613,
      perLevel: 0,
    },
    '만개': {
      base: 489,
      perLevel: 0,
    },
  },
  cadena: {
    '명계의 격류': {
      base: 400,
      perLevel: 0,
    },
    '만개': {
      base: 323,
      perLevel: 0,
    },
  },
  'angelic-buster': {
    '명계의 격류': {
      base: 692,
      perLevel: 0,
    },
    '만개': {
      base: 555,
      perLevel: 0,
    },
  },
  zero: {
    '명계의 격류': {
      base: 927,
      perLevel: 0,
    },
    '만개': {
      base: 794,
      perLevel: 0,
    },
  },
  kinesis: {
    '명계의 격류': {
      base: 688,
      perLevel: 0,
    },
    '만개': {
      base: 549,
      perLevel: 0,
    },
  },
  adele: {
    '명계의 격류': {
      base: 891,
      perLevel: 0,
    },
    '만개': {
      base: 712,
      perLevel: 0,
    },
  },
  illium: {
    '명계의 격류': {
      base: 910,
      perLevel: 0,
    },
    '만개': {
      base: 710,
      perLevel: 0,
    },
  },
  khali: {
    '명계의 격류': {
      base: 902,
      perLevel: 0,
    },
    '만개': {
      base: 725,
      perLevel: 0,
    },
  },
  ark: {
    '명계의 격류': {
      base: 949,
      perLevel: 0,
    },
    '만개': {
      base: 764,
      perLevel: 0,
    },
  },
  len: {
    '명계의 격류': {
      base: 1431,
      perLevel: 0,
    },
    '만개': {
      base: 1142,
      perLevel: 0,
    },
  },
  lara: {
    '명계의 격류': {
      base: 935,
      perLevel: 0,
    },
    '만개': {
      base: 755,
      perLevel: 0,
    },
  },
  hoyoung: {
    '명계의 격류': {
      base: 650,
      perLevel: 0,
    },
    '만개': {
      base: 516,
      perLevel: 0,
    },
  },
} as const satisfies Partial<Record<FinalClassNameKey, Record<SolHecatePhlegethonAttackKey, LinearDamagePercent>>>;
