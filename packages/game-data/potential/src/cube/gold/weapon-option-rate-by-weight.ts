import { createCubeLineGradeBudgetMap, createCubePotentialRateByWeight } from '../builder';
import { goldCubeOptionGradeRateTable } from './option-grade-rate';
import { goldCubeWeaponOptionWeightMap } from './weapon-option-weight';

export const goldCubeWeaponOptionRateByTopGrade = createCubePotentialRateByWeight({
  optionWeightMap: goldCubeWeaponOptionWeightMap,
  lineGradeBudgetMap: createCubeLineGradeBudgetMap(goldCubeOptionGradeRateTable),
});
