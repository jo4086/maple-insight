import type { PotentialOptionGradeRateRow } from '../../types';

export const goldCubeOptionGradeRateTable = [
  { itemGrade: 'rare', line: 1, optionGrade: 'rare', rate: 100 },
  { itemGrade: 'rare', line: 2, optionGrade: 'rare', rate: 16.6667 },
  { itemGrade: 'rare', line: 2, optionGrade: 'normal', rate: 83.3333 },
  { itemGrade: 'rare', line: 3, optionGrade: 'rare', rate: 16.6667 },
  { itemGrade: 'rare', line: 3, optionGrade: 'normal', rate: 83.3333 },

  { itemGrade: 'epic', line: 1, optionGrade: 'epic', rate: 100 },
  { itemGrade: 'epic', line: 2, optionGrade: 'epic', rate: 7.9994 },
  { itemGrade: 'epic', line: 2, optionGrade: 'rare', rate: 92.000552 },
  { itemGrade: 'epic', line: 3, optionGrade: 'epic', rate: 7.9994 },
  { itemGrade: 'epic', line: 3, optionGrade: 'rare', rate: 92.000552 },

  { itemGrade: 'unique', line: 1, optionGrade: 'unique', rate: 100 },
  { itemGrade: 'unique', line: 2, optionGrade: 'unique', rate: 1.6959 },
  { itemGrade: 'unique', line: 2, optionGrade: 'epic', rate: 98.3041 },
  { itemGrade: 'unique', line: 3, optionGrade: 'unique', rate: 1.6959 },
  { itemGrade: 'unique', line: 3, optionGrade: 'epic', rate: 98.3041 },

  { itemGrade: 'legendary', line: 1, optionGrade: 'legendary', rate: 100 },
  { itemGrade: 'legendary', line: 2, optionGrade: 'legendary', rate: 0.1996 },
  { itemGrade: 'legendary', line: 2, optionGrade: 'unique', rate: 99.8004 },
  { itemGrade: 'legendary', line: 3, optionGrade: 'legendary', rate: 0.1996 },
  { itemGrade: 'legendary', line: 3, optionGrade: 'unique', rate: 99.8004 },
] as const satisfies readonly PotentialOptionGradeRateRow[];
