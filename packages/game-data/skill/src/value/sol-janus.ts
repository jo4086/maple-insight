import type { FinalClassNameKey } from '@maple/data-class';

import type { LinearDamagePercent } from '@/types';

type SolJanusAttackKey = '솔 야누스 : 황혼' | '솔 야누스 : 새벽';

export const solJanus = {
  hero: {
    '솔 야누스 : 황혼': {
      base: 677,
      perLevel: 17,
    },
    '솔 야누스 : 새벽': {
      base: 461,
      perLevel: 11,
    },
  },
  paladin: {
    '솔 야누스 : 황혼': {
      base: 1298,
      perLevel: 34,
    },
    '솔 야누스 : 새벽': {
      base: 886,
      perLevel: 22,
    },
  },
  'dark-knight': {
    '솔 야누스 : 황혼': {
      base: 758,
      perLevel: 19,
    },
    '솔 야누스 : 새벽': {
      base: 496,
      perLevel: 13,
    },
  },
  'arch-mage-fire-poison': {
    '솔 야누스 : 황혼': {
      base: 655,
      perLevel: 16,
    },
    '솔 야누스 : 새벽': {
      base: 427,
      perLevel: 11,
    },
  },
  'arch-mage-ice-lightning': {
    '솔 야누스 : 황혼': {
      base: 639,
      perLevel: 17,
    },
    '솔 야누스 : 새벽': {
      base: 436,
      perLevel: 11,
    },
  },
  bishop: {
    '솔 야누스 : 황혼': {
      base: 671,
      perLevel: 18,
    },
    '솔 야누스 : 새벽': {
      base: 447,
      perLevel: 12,
    },
  },
  'bow-master': {
    '솔 야누스 : 황혼': {
      base: 1744,
      perLevel: 44,
    },
    '솔 야누스 : 새벽': {
      base: 1142,
      perLevel: 30,
    },
  },
  marksman: {
    '솔 야누스 : 황혼': {
      base: 1380,
      perLevel: 35,
    },
    '솔 야누스 : 새벽': {
      base: 930,
      perLevel: 23,
    },
  },
  pathfinder: {
    '솔 야누스 : 황혼': {
      base: 1684,
      perLevel: 44,
    },
    '솔 야누스 : 새벽': {
      base: 1133,
      perLevel: 29,
    },
  },
  'night-lord': {
    '솔 야누스 : 황혼': {
      base: 827,
      perLevel: 21,
    },
    '솔 야누스 : 새벽': {
      base: 551,
      perLevel: 14,
    },
  },
  shadower: {
    '솔 야누스 : 황혼': {
      base: 797,
      perLevel: 20,
    },
    '솔 야누스 : 새벽': {
      base: 512,
      perLevel: 14,
    },
  },
  'dual-blader': {
    '솔 야누스 : 황혼': {
      base: 716,
      perLevel: 19,
    },
    '솔 야누스 : 새벽': {
      base: 497,
      perLevel: 12,
    },
  },
  viper: {
    '솔 야누스 : 황혼': {
      base: 1252,
      perLevel: 32,
    },
    '솔 야누스 : 새벽': {
      base: 844,
      perLevel: 21,
    },
  },
  captain: {
    '솔 야누스 : 황혼': {
      base: 1138,
      perLevel: 29,
    },
    '솔 야누스 : 새벽': {
      base: 769,
      perLevel: 19,
    },
  },
  'cannon-master': {
    '솔 야누스 : 황혼': {
      base: 915,
      perLevel: 23,
    },
    '솔 야누스 : 새벽': {
      base: 620,
      perLevel: 16,
    },
  },
  mikhail: {
    '솔 야누스 : 황혼': {
      base: 1214,
      perLevel: 32,
    },
    '솔 야누스 : 새벽': {
      base: 819,
      perLevel: 21,
    },
  },
  'soul-master': {
    '솔 야누스 : 황혼': {
      base: 830,
      perLevel: 22,
    },
    '솔 야누스 : 새벽': {
      base: 574,
      perLevel: 14,
    },
  },
  'flame-wizard': {
    '솔 야누스 : 황혼': {
      base: 957,
      perLevel: 24,
    },
    '솔 야누스 : 새벽': {
      base: 638,
      perLevel: 16,
    },
  },
  'wind-breaker': {
    '솔 야누스 : 황혼': {
      base: 1160,
      perLevel: 30,
    },
    '솔 야누스 : 새벽': {
      base: 773,
      perLevel: 20,
    },
  },
  'night-walker': {
    '솔 야누스 : 황혼': {
      base: 654,
      perLevel: 16,
    },
    '솔 야누스 : 새벽': {
      base: 426,
      perLevel: 11,
    },
  },
  striker: {
    '솔 야누스 : 황혼': {
      base: 585,
      perLevel: 15,
    },
    '솔 야누스 : 새벽': {
      base: 390,
      perLevel: 10,
    },
  },
  aran: {
    '솔 야누스 : 황혼': {
      base: 1226,
      perLevel: 31,
    },
    '솔 야누스 : 새벽': {
      base: 807,
      perLevel: 21,
    },
  },
  luminous: {
    '솔 야누스 : 황혼': {
      base: 1042,
      perLevel: 26,
    },
    '솔 야누스 : 새벽': {
      base: 674,
      perLevel: 18,
    },
  },
  evan: {
    '솔 야누스 : 황혼': {
      base: 1180,
      perLevel: 31,
    },
    '솔 야누스 : 새벽': {
      base: 807,
      perLevel: 20,
    },
  },
  mercedes: {
    '솔 야누스 : 황혼': {
      base: 1108,
      perLevel: 29,
    },
    '솔 야누스 : 새벽': {
      base: 748,
      perLevel: 19,
    },
  },
  phantom: {
    '솔 야누스 : 황혼': {
      base: 724,
      perLevel: 19,
    },
    '솔 야누스 : 새벽': {
      base: 473,
      perLevel: 13,
    },
  },
  eunwol: {
    '솔 야누스 : 황혼': {
      base: 873,
      perLevel: 23,
    },
    '솔 야누스 : 새벽': {
      base: 592,
      perLevel: 15,
    },
  },
  blaster: {
    '솔 야누스 : 황혼': {
      base: 902,
      perLevel: 23,
    },
    '솔 야누스 : 새벽': {
      base: 611,
      perLevel: 15,
    },
  },
  'battle-mage': {
    '솔 야누스 : 황혼': {
      base: 1207,
      perLevel: 31,
    },
    '솔 야누스 : 새벽': {
      base: 794,
      perLevel: 21,
    },
  },
  'wild-hunter': {
    '솔 야누스 : 황혼': {
      base: 1415,
      perLevel: 37,
    },
    '솔 야누스 : 새벽': {
      base: 964,
      perLevel: 24,
    },
  },
  mechanic: {
    '솔 야누스 : 황혼': {
      base: 1238,
      perLevel: 32,
    },
    '솔 야누스 : 새벽': {
      base: 835,
      perLevel: 21,
    },
  },
  xenon: {
    '솔 야누스 : 황혼': {
      base: 635,
      perLevel: 16,
    },
    '솔 야누스 : 새벽': {
      base: 413,
      perLevel: 11,
    },
  },
  'demon-slayer': {
    '솔 야누스 : 황혼': {
      base: 765,
      perLevel: 19,
    },
    '솔 야누스 : 새벽': {
      base: 500,
      perLevel: 13,
    },
  },
  'demon-avenger': {
    '솔 야누스 : 황혼': {
      base: 926,
      perLevel: 24,
    },
    '솔 야누스 : 새벽': {
      base: 617,
      perLevel: 16,
    },
  },
  kaiser: {
    '솔 야누스 : 황혼': {
      base: 1499,
      perLevel: 38,
    },
    '솔 야누스 : 새벽': {
      base: 980,
      perLevel: 26,
    },
  },
  kain: {
    '솔 야누스 : 황혼': {
      base: 999,
      perLevel: 26,
    },
    '솔 야누스 : 새벽': {
      base: 676,
      perLevel: 17,
    },
  },
  cadena: {
    '솔 야누스 : 황혼': {
      base: 1226,
      perLevel: 31,
    },
    '솔 야누스 : 새벽': {
      base: 807,
      perLevel: 21,
    },
  },
  'angelic-buster': {
    '솔 야누스 : 황혼': {
      base: 1149,
      perLevel: 29,
    },
    '솔 야누스 : 새벽': {
      base: 776,
      perLevel: 20,
    },
  },
  zero: {
    '솔 야누스 : 황혼': {
      base: 1245,
      perLevel: 32,
    },
    '솔 야누스 : 새벽': {
      base: 840,
      perLevel: 21,
    },
  },
  kinesis: {
    '솔 야누스 : 황혼': {
      base: 978,
      perLevel: 25,
    },
    '솔 야누스 : 새벽': {
      base: 642,
      perLevel: 17,
    },
  },
  adele: {
    '솔 야누스 : 황혼': {
      base: 1186,
      perLevel: 30,
    },
    '솔 야누스 : 새벽': {
      base: 791,
      perLevel: 20,
    },
  },
  illium: {
    '솔 야누스 : 황혼': {
      base: 1543,
      perLevel: 40,
    },
    '솔 야누스 : 새벽': {
      base: 1019,
      perLevel: 27,
    },
  },
  khali: {
    '솔 야누스 : 황혼': {
      base: 1649,
      perLevel: 43,
    },
    '솔 야누스 : 새벽': {
      base: 1120,
      perLevel: 28,
    },
  },
  ark: {
    '솔 야누스 : 황혼': {
      base: 1500,
      perLevel: 38,
    },
    '솔 야누스 : 새벽': {
      base: 1010,
      perLevel: 26,
    },
  },
  len: {
    '솔 야누스 : 황혼': {
      base: 1705,
      perLevel: 44,
    },
    '솔 야누스 : 새벽': {
      base: 1126,
      perLevel: 29,
    },
  },
  lara: {
    '솔 야누스 : 황혼': {
      base: 1011,
      perLevel: 26,
    },
    '솔 야누스 : 새벽': {
      base: 684,
      perLevel: 17,
    },
  },
  hoyoung: {
    '솔 야누스 : 황혼': {
      base: 989,
      perLevel: 25,
    },
    '솔 야누스 : 새벽': {
      base: 649,
      perLevel: 17,
    },
  },
} as const satisfies Partial<Record<FinalClassNameKey, Record<SolJanusAttackKey, LinearDamagePercent>>>;
