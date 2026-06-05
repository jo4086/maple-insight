import type { PotentialOptionGradeRateRow } from '../../types';

export const silverCubeOptionGradeRateTable = [
  { itemGrade: 'rare', line: 1, optionGrade: 'rare', rate: 100 },
  { itemGrade: 'rare', line: 2, optionGrade: 'rare', rate: 16.6667 },
  { itemGrade: 'rare', line: 2, optionGrade: 'normal', rate: 83.3333 },
  { itemGrade: 'rare', line: 3, optionGrade: 'rare', rate: 16.6667 },
  { itemGrade: 'rare', line: 3, optionGrade: 'normal', rate: 83.3333 },

  { itemGrade: 'epic', line: 1, optionGrade: 'epic', rate: 100 },
  { itemGrade: 'epic', line: 2, optionGrade: 'epic', rate: 4.7619 },
  { itemGrade: 'epic', line: 2, optionGrade: 'rare', rate: 95.2381 },
  { itemGrade: 'epic', line: 3, optionGrade: 'epic', rate: 4.7619 },
  { itemGrade: 'epic', line: 3, optionGrade: 'rare', rate: 95.2381 },

  { itemGrade: 'unique', line: 1, optionGrade: 'unique', rate: 100 },
  { itemGrade: 'unique', line: 2, optionGrade: 'unique', rate: 1.1858 },
  { itemGrade: 'unique', line: 2, optionGrade: 'epic', rate: 98.8142 },
  { itemGrade: 'unique', line: 3, optionGrade: 'unique', rate: 1.1858 },
  { itemGrade: 'unique', line: 3, optionGrade: 'epic', rate: 98.8142 },
] as const satisfies readonly PotentialOptionGradeRateRow[];
