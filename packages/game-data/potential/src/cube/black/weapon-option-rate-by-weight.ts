import { createCubeLineGradeBudgetMap, createCubePotentialRateByWeight } from '../builder';
import { blackCubeOptionGradeRateTable } from './option-grade-rate';
import { blackCubeWeaponOptionWeightMap } from './weapon-option-weight';

export const blackCubeWeaponOptionRateByTopGrade = createCubePotentialRateByWeight({
  optionWeightMap: blackCubeWeaponOptionWeightMap,
  lineGradeBudgetMap: createCubeLineGradeBudgetMap(blackCubeOptionGradeRateTable),
});
