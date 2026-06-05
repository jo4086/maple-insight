import type { PotentialOptionGradeRateRow } from '../../types';

export const blackCubeOptionGradeRateTable = [
  { itemGrade: 'rare', line: 1, optionGrade: 'rare', rate: 100 },
  { itemGrade: 'rare', line: 2, optionGrade: 'rare', rate: 20 },
  { itemGrade: 'rare', line: 2, optionGrade: 'normal', rate: 80 },
  { itemGrade: 'rare', line: 3, optionGrade: 'rare', rate: 5 },
  { itemGrade: 'rare', line: 3, optionGrade: 'normal', rate: 95 },

  { itemGrade: 'epic', line: 1, optionGrade: 'epic', rate: 100 },
  { itemGrade: 'epic', line: 2, optionGrade: 'epic', rate: 20 },
  { itemGrade: 'epic', line: 2, optionGrade: 'rare', rate: 80 },
  { itemGrade: 'epic', line: 3, optionGrade: 'epic', rate: 5 },
  { itemGrade: 'epic', line: 3, optionGrade: 'rare', rate: 95 },

  { itemGrade: 'unique', line: 1, optionGrade: 'unique', rate: 100 },
  { itemGrade: 'unique', line: 2, optionGrade: 'unique', rate: 20 },
  { itemGrade: 'unique', line: 2, optionGrade: 'epic', rate: 80 },
  { itemGrade: 'unique', line: 3, optionGrade: 'unique', rate: 5 },
  { itemGrade: 'unique', line: 3, optionGrade: 'epic', rate: 95 },

  { itemGrade: 'legendary', line: 1, optionGrade: 'legendary', rate: 100 },
  { itemGrade: 'legendary', line: 2, optionGrade: 'legendary', rate: 20 },
  { itemGrade: 'legendary', line: 2, optionGrade: 'unique', rate: 80 },
  { itemGrade: 'legendary', line: 3, optionGrade: 'legendary', rate: 5 },
  { itemGrade: 'legendary', line: 3, optionGrade: 'unique', rate: 95 },
] as const satisfies readonly PotentialOptionGradeRateRow[];
