import type { Affiliation, ClassGroup as PkgClassGroup } from '@maple/game-data';

export const affiliationCodeMap = {
  모험가: '00',
  '시그너스 기사단': '01',
  영웅: '02',
  레지스탕스: '03',
  노바: '04',
  초월자: '05',
  '프렌즈 월드': '06',
  레프: '07',
  아니마: '08',
} as const satisfies Record<Affiliation, string>;

export type AffiliationCode = (typeof affiliationCodeMap)[keyof typeof affiliationCodeMap];

type ClassGroup = PkgClassGroup | '미전직';

export const classGroupCodeMap = {
  미전직: '0',
  전사: '1',
  마법사: '2',
  궁수: '3',
  도적: '4',
  해적: '5',
} as const satisfies Record<ClassGroup, string>;

export const defaultClassLevelSequence = [1, 2, 3, 4, 'hyper', 5, 6] as const;
export const dualBladeClassLevelSequence = [1, 1.5, 2, 2.5, 3, 4, 'hyper', 5, 6] as const;
