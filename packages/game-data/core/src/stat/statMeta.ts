import { ClassGroup } from '@/taxonomy';

export const specialStatClassNames = ['시프', '시프마스터', '섀도어', '세미듀어러', '듀어러', '듀얼마스터', '슬래셔', '듀얼블레이더', '카데나', '제논', '데몬어벤져'] as const;
export type SpecialStatClassName = (typeof specialStatClassNames)[number];

export type Stat = 'STR' | 'DEX' | 'INT' | 'LUK' | 'HP';

export type ClassGroupStatMeta = {
  [key in ClassGroup]: {
    mainStat: Stat;
    subStat: Stat;
  };
};

export type SpecialStatClassMeta = {
  [key in SpecialStatClassName]: {
    mainStat: Stat[];
    subStat: Stat[];
  };
};

export const classGroupStatMetaMap: ClassGroupStatMeta = {
  전사: { mainStat: 'STR', subStat: 'DEX' },
  궁수: { mainStat: 'DEX', subStat: 'STR' },
  마법사: { mainStat: 'INT', subStat: 'LUK' },
  도적: { mainStat: 'LUK', subStat: 'DEX' },
  해적: { mainStat: 'STR', subStat: 'DEX' },
};

export const specialStatClassMetaMap: SpecialStatClassMeta = {
  제논: {
    mainStat: ['STR', 'DEX', 'LUK'],
    subStat: [],
  },
  데몬어벤져: {
    mainStat: ['HP'],
    subStat: [],
  },
  시프: {
    mainStat: ['LUK'],
    subStat: ['DEX', 'STR'],
  },
  시프마스터: {
    mainStat: ['LUK'],
    subStat: ['DEX', 'STR'],
  },
  섀도어: {
    mainStat: ['LUK'],
    subStat: ['DEX', 'STR'],
  },
  세미듀어러: {
    mainStat: ['LUK'],
    subStat: ['DEX', 'STR'],
  },
  듀어러: {
    mainStat: ['LUK'],
    subStat: ['DEX', 'STR'],
  },
  듀얼마스터: {
    mainStat: ['LUK'],
    subStat: ['DEX', 'STR'],
  },
  슬래셔: {
    mainStat: ['LUK'],
    subStat: ['DEX', 'STR'],
  },
  듀얼블레이더: {
    mainStat: ['LUK'],
    subStat: ['DEX', 'STR'],
  },
  카데나: {
    mainStat: ['LUK'],
    subStat: ['DEX', 'STR'],
  },
};
