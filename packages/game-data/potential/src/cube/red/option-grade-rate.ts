import type { PotentialOptionGradeRateRow } from '../../types';

export const redCubeOptionGradeRateTable = [
  { itemGrade: 'rare', line: 1, optionGrade: 'rare', rate: 100 },
  { itemGrade: 'rare', line: 2, optionGrade: 'rare', rate: 10 },
  { itemGrade: 'rare', line: 2, optionGrade: 'normal', rate: 90 },
  { itemGrade: 'rare', line: 3, optionGrade: 'rare', rate: 1 },
  { itemGrade: 'rare', line: 3, optionGrade: 'normal', rate: 99 },

  { itemGrade: 'epic', line: 1, optionGrade: 'epic', rate: 100 },
  { itemGrade: 'epic', line: 2, optionGrade: 'epic', rate: 10 },
  { itemGrade: 'epic', line: 2, optionGrade: 'rare', rate: 90 },
  { itemGrade: 'epic', line: 3, optionGrade: 'epic', rate: 1 },
  { itemGrade: 'epic', line: 3, optionGrade: 'rare', rate: 99 },

  { itemGrade: 'unique', line: 1, optionGrade: 'unique', rate: 100 },
  { itemGrade: 'unique', line: 2, optionGrade: 'unique', rate: 10 },
  { itemGrade: 'unique', line: 2, optionGrade: 'epic', rate: 90 },
  { itemGrade: 'unique', line: 3, optionGrade: 'unique', rate: 1 },
  { itemGrade: 'unique', line: 3, optionGrade: 'epic', rate: 99 },

  { itemGrade: 'legendary', line: 1, optionGrade: 'legendary', rate: 100 },
  { itemGrade: 'legendary', line: 2, optionGrade: 'legendary', rate: 10 },
  { itemGrade: 'legendary', line: 2, optionGrade: 'unique', rate: 90 },
  { itemGrade: 'legendary', line: 3, optionGrade: 'legendary', rate: 1 },
  { itemGrade: 'legendary', line: 3, optionGrade: 'unique', rate: 99 },
] as const satisfies readonly PotentialOptionGradeRateRow[];
