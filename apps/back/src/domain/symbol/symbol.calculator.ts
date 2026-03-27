import { arcaneSymbolAreaValueMap, authenticSymbolCoefMap, grandSymbolCoefMap } from './symbol.constants';
import { arcaneSymbolNames, authenticSymbolNames, grandSymbolNames } from './symbol.types';
import type { ArcaneSymbolName, AuthenticSymbolName, GrandSymbolName } from './symbol.types';

const ARC_MAX_LEVEL = 20;

export function calculateArcaneSymbolStepCost(symbolName: ArcaneSymbolName, currentLevel: number): number {
  const areaValue = arcaneSymbolAreaValueMap[symbolName];

  return currentLevel > 19 ? 0 : Math.floor(0.1 * currentLevel ** 3 + areaValue * currentLevel ** 2 + 1.1 * currentLevel + areaValue * 11) * 10000;
}

export function calculateArcaneSymbolMaterialStepCount(symbolName: ArcaneSymbolName, currentLevel: number, currentCount: number) {
  if (!arcaneSymbolNames.includes(symbolName)) {
    throw new Error('Invalid Arcane Symbol');
  }
  if (currentLevel > 19) return 0;

  const stepCount = currentLevel ** 2 + 11;

  return Math.max(0, stepCount - currentCount);
}

export function calculateArcaneSymbolTotalMaterialCount(symbolName: ArcaneSymbolName, currentLevel: number, currentCount: number, targetLevel: number): number {
  if (currentLevel >= ARC_MAX_LEVEL) return 0;
  if (targetLevel <= currentLevel) return 0;

  let total = 0;
  let remainCount = currentCount;

  const finalTarget = Math.min(targetLevel, ARC_MAX_LEVEL);

  for (let level = currentLevel; level < finalTarget; level++) {
    total += calculateArcaneSymbolMaterialStepCount(symbolName, level, remainCount);
    remainCount = 0;
  }

  return total;
}

// NOTE: Authentic symbol 계산 함수
const AUTHENTIC_MAX_LEVEL = 11;

export function calculateAuthenticSymbolStepCost(symbolName: AuthenticSymbolName, currentLevel: number): number {
  if (currentLevel > 10) return 0;
  const authenticValue = authenticSymbolCoefMap[symbolName].autCoef;
  const areaValue = authenticSymbolCoefMap[symbolName].areaCoef;

  return Math.floor(-5.4 * currentLevel ** 3 + authenticValue * currentLevel ** 2 + areaValue * currentLevel) * 100000;
}
export function calculateTotalAuthenticSymbolMeso(symbolName: AuthenticSymbolName, currentLevel: number, targetLevel: number): number {
  if (currentLevel >= AUTHENTIC_MAX_LEVEL) return 0;

  let total = 0;

  // targetLevel이 11을 넘어가도 11까지만 계산
  const finalTarget = Math.min(targetLevel, AUTHENTIC_MAX_LEVEL);

  for (let level = currentLevel; level < finalTarget; level++) {
    total += calculateAuthenticSymbolStepCost(symbolName, level);
  }

  return total;
}

export function calculateAuthenticSymbolMaterialStepCount(symbolName: AuthenticSymbolName, currentLevel: number, currentCount: number) {
  if (!authenticSymbolNames.includes(symbolName)) {
    throw new Error('Invalid Authentic Symbol');
  }
  if (currentLevel > 10) return 0;

  const stepCount = currentLevel * (currentLevel * 9 + 20);

  return Math.max(0, stepCount - currentCount);
}

export function calculateAuthenticSymbolTotalMaterialCount(symbolName: AuthenticSymbolName, currentLevel: number, currentCount: number, targetLevel: number): number {
  if (currentLevel >= AUTHENTIC_MAX_LEVEL) return 0;
  if (targetLevel <= currentLevel) return 0;

  let total = 0;
  let remainCount = currentCount;

  const finalTarget = Math.min(targetLevel, AUTHENTIC_MAX_LEVEL);

  for (let level = currentLevel; level < finalTarget; level++) {
    total += calculateAuthenticSymbolMaterialStepCount(symbolName, level, remainCount);
    remainCount = 0;
  }

  return total;
}

// NOTE: Grand Authentic Symbol 계산 함수
const GRAND_MAX_LEVEL = 11;

export function calculateGrandSymbolStepCost(symbolName: GrandSymbolName, currentLevel: number): number {
  if (currentLevel > 10) return 0;
  const grandValue = grandSymbolCoefMap[symbolName].autCoef;
  const areaValue = grandSymbolCoefMap[symbolName].areaCoef;

  return Math.floor(-5.4 * currentLevel ** 3 + grandValue * currentLevel ** 2 + areaValue * currentLevel) * 100000;
}

export function calculateTotalGrandSymbolMeso(symbolName: GrandSymbolName, currentLevel: number, targetLevel: number): number {
  if (currentLevel >= GRAND_MAX_LEVEL) return 0;

  let total = 0;
  const finalTarget = Math.min(targetLevel, GRAND_MAX_LEVEL);

  for (let level = currentLevel; level < finalTarget; level++) {
    total += calculateGrandSymbolStepCost(symbolName, level);
  }

  return total;
}

export function calculateGrandSymbolMaterialStepCount(symbolName: GrandSymbolName, currentLevel: number, currentCount: number) {
  if (!grandSymbolNames.includes(symbolName)) {
    throw new Error('Invalid Grand Authentic Symbol');
  }
  if (currentLevel > 10) return 0;

  const stepCount = currentLevel * (currentLevel * 9 + 20);

  return Math.max(0, stepCount - currentCount);
}

export function calculateGrandSymbolTotalMaterialCount(symbolName: GrandSymbolName, currentLevel: number, currentCount: number, targetLevel: number): number {
  if (currentLevel >= GRAND_MAX_LEVEL) return 0;
  if (targetLevel <= currentLevel) return 0;

  let total = 0;
  let remainCount = currentCount;

  const finalTarget = Math.min(targetLevel, GRAND_MAX_LEVEL);

  for (let level = currentLevel; level < finalTarget; level++) {
    total += calculateGrandSymbolMaterialStepCount(symbolName, level, remainCount);
    remainCount = 0;
  }

  return total;
}
