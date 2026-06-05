import { createCubeLineGradeBudgetMap, createCubePotentialRateByWeight } from '../builder';
import { redCubeOptionGradeRateTable } from './option-grade-rate';
import { redCubeWeaponOptionWeightMap } from './weapon-option-weight';

export const redCubeWeaponOptionRateByTopGrade = createCubePotentialRateByWeight({
  optionWeightMap: redCubeWeaponOptionWeightMap,
  lineGradeBudgetMap: createCubeLineGradeBudgetMap(redCubeOptionGradeRateTable),
});
