import { createCubeLineGradeBudgetMap, createCubePotentialRateByWeight } from '../builder';
import { silverCubeOptionGradeRateTable } from './option-grade-rate';
import { silverCubeWeaponOptionWeightMap } from './weapon-option-weight';

export const silverCubeWeaponOptionRateByTopGrade = createCubePotentialRateByWeight({
  optionWeightMap: silverCubeWeaponOptionWeightMap,
  lineGradeBudgetMap: createCubeLineGradeBudgetMap(silverCubeOptionGradeRateTable),
});
