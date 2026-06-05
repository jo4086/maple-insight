export const potentialGrades = ['rare', 'epic', 'unique', 'legendary'] as const;
export type PotentialGrade = (typeof potentialGrades)[number];

export const abilityGrades = ['rare', 'epic', 'unique', 'legendary'] as const;
export type AbilityGrade = (typeof abilityGrades)[number];

export const equipmentAddOptionGrades = ['7', '6', '5', '4', '3', '2', '1'] as const;
export type EquipmentAddOptionGrade = (typeof equipmentAddOptionGrades)[number];

export type RarityGrade = 'normal' | 'rare' | 'epic' | 'unique' | 'legendary';

export const gradeLabels = {
  normal: '노말',
  rare: '레어',
  epic: '에픽',
  unique: '유니크',
  legendary: '레전더리',
} as const satisfies Record<RarityGrade, string>;
