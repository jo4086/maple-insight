export * from './cube';
export * from './option';

export const cubeTypes = ['black', 'red', 'silver', 'gold'] as const;
export type CubeType = (typeof cubeTypes)[number];

export const potentialGrades = ['normal', 'rare', 'epic', 'unique', 'legendary'] as const;
export type PotentialGrade = (typeof potentialGrades)[number];
