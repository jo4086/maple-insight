import type { RarityGrade } from '@maple/types';

export const RARITY_GRADES = ['레어', '에픽', '유니크', '레전드리'] as const;

export function toRarityGrade(value: string): RarityGrade {
  return RARITY_GRADES.includes(value as RarityGrade) ? (value as RarityGrade) : '레어';
}
