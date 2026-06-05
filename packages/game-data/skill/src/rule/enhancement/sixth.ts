export const sixthDefaultEnhancementDamageFormula: { base: number; perLevel: number; milestones: { level: number; value: number }[] } = {
  base: 10,
  perLevel: 1,
  milestones: [
    { level: 10, value: 5 },
    { level: 20, value: 5 },
    { level: 30, value: 10 },
  ],
} as const;
