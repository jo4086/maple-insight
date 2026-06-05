import type { FinalClassNameKey } from '@maple/data-class';

import type { LinearDamagePercent } from '@/types';

type ErdaShowerAttackKey = '에르다 샤워' | '에르다 파운틴';

export const erdaShower = {
  hero: {
    '에르다 샤워': {
      base: 522,
      perLevel: 17,
    },
    '에르다 파운틴': {
      base: 522,
      perLevel: 17,
    },
  },
  paladin: {
    '에르다 샤워': {
      base: 996,
      perLevel: 34,
    },
    '에르다 파운틴': {
      base: 996,
      perLevel: 34,
    },
  },
  'dark-knight': {
    '에르다 샤워': {
      base: 585,
      perLevel: 19,
    },
    '에르다 파운틴': {
      base: 585,
      perLevel: 19,
    },
  },
  'arch-mage-fire-poison': {
    '에르다 샤워': {
      base: 507,
      perLevel: 16,
    },
    '에르다 파운틴': {
      base: 507,
      perLevel: 16,
    },
  },
  'arch-mage-ice-lightning': {
    '에르다 샤워': {
      base: 489,
      perLevel: 17,
    },
    '에르다 파운틴': {
      base: 489,
      perLevel: 17,
    },
  },
  bishop: {
    '에르다 샤워': {
      base: 513,
      perLevel: 18,
    },
    '에르다 파운틴': {
      base: 513,
      perLevel: 18,
    },
  },
  'bow-master': {
    '에르다 샤워': {
      base: 1344,
      perLevel: 44,
    },
    '에르다 파운틴': {
      base: 1344,
      perLevel: 44,
    },
  },
  marksman: {
    '에르다 샤워': {
      base: 1063,
      perLevel: 35,
    },
    '에르다 파운틴': {
      base: 1063,
      perLevel: 35,
    },
  },
  pathfinder: {
    '에르다 샤워': {
      base: 1292,
      perLevel: 44,
    },
    '에르다 파운틴': {
      base: 1292,
      perLevel: 44,
    },
  },
  'night-lord': {
    '에르다 샤워': {
      base: 637,
      perLevel: 21,
    },
    '에르다 파운틴': {
      base: 637,
      perLevel: 21,
    },
  },
  shadower: {
    '에르다 샤워': {
      base: 615,
      perLevel: 20,
    },
    '에르다 파운틴': {
      base: 615,
      perLevel: 20,
    },
  },
  'dual-blader': {
    '에르다 샤워': {
      base: 548,
      perLevel: 19,
    },
    '에르다 파운틴': {
      base: 548,
      perLevel: 19,
    },
  },
  viper: {
    '에르다 샤워': {
      base: 963,
      perLevel: 32,
    },
    '에르다 파운틴': {
      base: 963,
      perLevel: 32,
    },
  },
  captain: {
    '에르다 샤워': {
      base: 876,
      perLevel: 29,
    },
    '에르다 파운틴': {
      base: 876,
      perLevel: 29,
    },
  },
  'cannon-master': {
    '에르다 샤워': {
      base: 706,
      perLevel: 23,
    },
    '에르다 파운틴': {
      base: 706,
      perLevel: 23,
    },
  },
  mikhail: {
    '에르다 샤워': {
      base: 930,
      perLevel: 32,
    },
    '에르다 파운틴': {
      base: 930,
      perLevel: 32,
    },
  },
  'soul-master': {
    '에르다 샤워': {
      base: 636,
      perLevel: 22,
    },
    '에르다 파운틴': {
      base: 636,
      perLevel: 22,
    },
  },
  'flame-wizard': {
    '에르다 샤워': {
      base: 738,
      perLevel: 24,
    },
    '에르다 파운틴': {
      base: 738,
      perLevel: 24,
    },
  },
  'wind-breaker': {
    '에르다 샤워': {
      base: 891,
      perLevel: 30,
    },
    '에르다 파운틴': {
      base: 891,
      perLevel: 30,
    },
  },
  'night-walker': {
    '에르다 샤워': {
      base: 506,
      perLevel: 16,
    },
    '에르다 파운틴': {
      base: 506,
      perLevel: 16,
    },
  },
  striker: {
    '에르다 샤워': {
      base: 450,
      perLevel: 15,
    },
    '에르다 파운틴': {
      base: 450,
      perLevel: 15,
    },
  },
  aran: {
    '에르다 샤워': {
      base: 945,
      perLevel: 31,
    },
    '에르다 파운틴': {
      base: 945,
      perLevel: 31,
    },
  },
  luminous: {
    '에르다 샤워': {
      base: 804,
      perLevel: 26,
    },
    '에르다 파운틴': {
      base: 804,
      perLevel: 26,
    },
  },
  evan: {
    '에르다 샤워': {
      base: 905,
      perLevel: 31,
    },
    '에르다 파운틴': {
      base: 905,
      perLevel: 31,
    },
  },
  mercedes: {
    '에르다 샤워': {
      base: 850,
      perLevel: 29,
    },
    '에르다 파운틴': {
      base: 850,
      perLevel: 29,
    },
  },
  phantom: {
    '에르다 샤워': {
      base: 555,
      perLevel: 19,
    },
    '에르다 파운틴': {
      base: 555,
      perLevel: 19,
    },
  },
  eunwol: {
    '에르다 샤워': {
      base: 669,
      perLevel: 23,
    },
    '에르다 파운틴': {
      base: 669,
      perLevel: 23,
    },
  },
  blaster: {
    '에르다 샤워': {
      base: 694,
      perLevel: 23,
    },
    '에르다 파운틴': {
      base: 694,
      perLevel: 23,
    },
  },
  'battle-mage': {
    '에르다 샤워': {
      base: 928,
      perLevel: 31,
    },
    '에르다 파운틴': {
      base: 928,
      perLevel: 31,
    },
  },
  'wild-hunter': {
    '에르다 샤워': {
      base: 1086,
      perLevel: 37,
    },
    '에르다 파운틴': {
      base: 1086,
      perLevel: 37,
    },
  },
  mechanic: {
    '에르다 샤워': {
      base: 951,
      perLevel: 32,
    },
    '에르다 파운틴': {
      base: 951,
      perLevel: 32,
    },
  },
  xenon: {
    '에르다 샤워': {
      base: 490,
      perLevel: 16,
    },
    '에르다 파운틴': {
      base: 490,
      perLevel: 16,
    },
  },
  'demon-slayer': {
    '에르다 샤워': {
      base: 591,
      perLevel: 19,
    },
    '에르다 파운틴': {
      base: 591,
      perLevel: 19,
    },
  },
  'demon-avenger': {
    '에르다 샤워': {
      base: 711,
      perLevel: 24,
    },
    '에르다 파운틴': {
      base: 711,
      perLevel: 24,
    },
  },
  kaiser: {
    '에르다 샤워': {
      base: 1155,
      perLevel: 38,
    },
    '에르다 파운틴': {
      base: 1155,
      perLevel: 38,
    },
  },
  kain: {
    '에르다 샤워': {
      base: 767,
      perLevel: 26,
    },
    '에르다 파운틴': {
      base: 767,
      perLevel: 26,
    },
  },
  cadena: {
    '에르다 샤워': {
      base: 945,
      perLevel: 31,
    },
    '에르다 파운틴': {
      base: 945,
      perLevel: 31,
    },
  },
  'angelic-buster': {
    '에르다 샤워': {
      base: 886,
      perLevel: 29,
    },
    '에르다 파운틴': {
      base: 886,
      perLevel: 29,
    },
  },
  zero: {
    '에르다 샤워': {
      base: 957,
      perLevel: 32,
    },
    '에르다 파운틴': {
      base: 957,
      perLevel: 32,
    },
  },
  kinesis: {
    '에르다 샤워': {
      base: 754,
      perLevel: 25,
    },
    '에르다 파운틴': {
      base: 754,
      perLevel: 25,
    },
  },
  adele: {
    '에르다 샤워': {
      base: 914,
      perLevel: 30,
    },
    '에르다 파운틴': {
      base: 914,
      perLevel: 30,
    },
  },
  illium: {
    '에르다 샤워': {
      base: 1185,
      perLevel: 40,
    },
    '에르다 파운틴': {
      base: 1185,
      perLevel: 40,
    },
  },
  khali: {
    '에르다 샤워': {
      base: 1266,
      perLevel: 43,
    },
    '에르다 파운틴': {
      base: 1266,
      perLevel: 43,
    },
  },
  ark: {
    '에르다 샤워': {
      base: 1156,
      perLevel: 38,
    },
    '에르다 파운틴': {
      base: 1156,
      perLevel: 38,
    },
  },
  len: {
    '에르다 샤워': {
      base: 1314,
      perLevel: 44,
    },
    '에르다 파운틴': {
      base: 1314,
      perLevel: 44,
    },
  },
  lara: {
    '에르다 샤워': {
      base: 777,
      perLevel: 26,
    },
    '에르다 파운틴': {
      base: 777,
      perLevel: 26,
    },
  },
  hoyoung: {
    '에르다 샤워': {
      base: 762,
      perLevel: 25,
    },
    '에르다 파운틴': {
      base: 762,
      perLevel: 25,
    },
  },
} as const satisfies Partial<Record<FinalClassNameKey, Record<ErdaShowerAttackKey, LinearDamagePercent>>>;
