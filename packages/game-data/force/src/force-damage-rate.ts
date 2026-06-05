export type ForceType = 'arcane-force' | 'authentic-force';

export type RatioDamageRateRange = {
  minRatioPercent: number;
  maxRatioPercent: number | null;
  damageRatePercent: number;
};

export type DeltaDamageRateRange = {
  minDelta: number | null;
  maxDelta: number | null;
  damageRatePercent: number;
};

export const arcaneForceDamageRateTable = [
  { minRatioPercent: 0, maxRatioPercent: 9, damageRatePercent: 10 },
  { minRatioPercent: 10, maxRatioPercent: 29, damageRatePercent: 30 },
  { minRatioPercent: 30, maxRatioPercent: 49, damageRatePercent: 60 },
  { minRatioPercent: 50, maxRatioPercent: 69, damageRatePercent: 70 },
  { minRatioPercent: 70, maxRatioPercent: 99, damageRatePercent: 80 },
  { minRatioPercent: 100, maxRatioPercent: 109, damageRatePercent: 100 },
  { minRatioPercent: 110, maxRatioPercent: 129, damageRatePercent: 110 },
  { minRatioPercent: 130, maxRatioPercent: 149, damageRatePercent: 130 },
  { minRatioPercent: 150, maxRatioPercent: null, damageRatePercent: 150 },
] as const satisfies readonly RatioDamageRateRange[];

export const authenticForceDamageRateRule = {
  minDelta: -95,
  neutralDelta: 0,
  maxDelta: 50,
  minDamageRatePercent: 5,
  neutralDamageRatePercent: 100,
  maxDamageRatePercent: 125,
  negativeStepDelta: 10,
  negativeStepDamageRatePercent: 10,
  positiveStepDelta: 10,
  positiveStepDamageRatePercent: 5,
} as const;
