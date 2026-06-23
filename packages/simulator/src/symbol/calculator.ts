import {
  arcaneSymbolRegionConstantMap,
  arcaneSymbolNames,
  authenticSymbolRegionConstantMap,
  authenticSymbolNames,
  grandSymbolRegionConstantMap,
  grandSymbolNames,
  symbolDailyGrowthGainMap,
  symbolMaxLevelMap,
  type ArcaneSymbolName,
  type AuthenticSymbolName,
  type GrandSymbolName,
  type SymbolName,
} from '@maple/data-symbol';

const ARCANE_MESO_UNIT = 10000;
const AUTHENTIC_MESO_UNIT = 100000;
const FLOATING_POINT_FLOOR_EPSILON = 1e-9;

export type SymbolStatClassType = null | '제논' | '데몬어벤져';

export type CalculateSymbolMesoInput = {
  symbolName: SymbolName;
  currentLevel: number;
  targetLevel?: number;
};

export type CalculateSymbolMesoResult = {
  symbolName: SymbolName;
  currentLevel: number;
  targetLevel: number;
  totalMeso: number;
};

export type CalculateSymbolGrowthInput = {
  symbolName: SymbolName;
  currentLevel: number;
  currentGrowth: number;
  targetLevel?: number;
};

export type CalculateSymbolGrowthResult = {
  symbolName: SymbolName;
  currentLevel: number;
  targetLevel: number;
  currentGrowth: number;
  totalRequiredGrowth: number;
  totalRequiredMeso: number;
  consumedGrowth: number;
  remainingGrowth: number;
  surplusGrowth: number;
};

export type CalculateSymbolDailyQuestDaysInput = CalculateSymbolGrowthInput;

export type CalculateSymbolDailyQuestDaysResult = CalculateSymbolGrowthResult & {
  dailyGrowthGain: number;
  remainingDays: number;
};

export type CalculateSymbolStatInput = {
  symbolName: SymbolName;
  currentLevel: number;
  classType?: SymbolStatClassType;
};

export type SymbolForceType = 'arcane-force' | 'authentic-force';

export type CalculateSymbolStatResult = {
  symbolName: SymbolName;
  currentLevel: number;
  classType: SymbolStatClassType;
  stat: number | null;
  forceType: SymbolForceType;
  force: number;
};

export function calculateSymbolMeso({ symbolName, currentLevel, targetLevel = getSymbolMaxLevel(symbolName) }: CalculateSymbolMesoInput): CalculateSymbolMesoResult {
  let totalMeso = 0;

  for (let level = currentLevel; level < targetLevel; level++) {
    totalMeso += calculateSymbolStepMeso(symbolName, level);
  }

  return {
    symbolName,
    currentLevel,
    targetLevel,
    totalMeso,
  };
}

export function calculateSymbolStat({ symbolName, currentLevel, classType = null }: CalculateSymbolStatInput): CalculateSymbolStatResult {
  if (isArcaneSymbolName(symbolName)) {
    return {
      symbolName,
      currentLevel,
      classType,
      stat: calculateArcaneSymbolStat(currentLevel, classType),
      forceType: 'arcane-force',
      force: 10 * (currentLevel + 2),
    };
  }

  if (isAuthenticSymbolName(symbolName)) {
    return {
      symbolName,
      currentLevel,
      classType,
      stat: calculateAuthenticSymbolStat(currentLevel, classType),
      forceType: 'authentic-force',
      force: 10 * currentLevel,
    };
  }

  if (isGrandSymbolName(symbolName)) {
    calculateGrandSymbolSpecialStat(currentLevel);

    return {
      symbolName,
      currentLevel,
      classType,
      stat: null,
      forceType: 'authentic-force',
      force: 10 * currentLevel,
    };
  }

  return assertNever(symbolName);
}

export function calculateSymbolDailyQuestDays(input: CalculateSymbolDailyQuestDaysInput): CalculateSymbolDailyQuestDaysResult {
  const growthRequirement = calculateSymbolGrowthRequirement(input);
  const dailyGrowthGain = symbolDailyGrowthGainMap[input.symbolName];
  const remainingDays = Math.ceil(growthRequirement.remainingGrowth / dailyGrowthGain);

  return {
    ...growthRequirement,
    dailyGrowthGain,
    remainingDays,
  };
}

export function calculateSymbolGrowthRequirement({
  symbolName,
  currentLevel,
  currentGrowth,
  targetLevel = getSymbolMaxLevel(symbolName),
}: CalculateSymbolGrowthInput): CalculateSymbolGrowthResult {
  let totalRequiredGrowth = 0;
  let totalRequiredMeso = 0;

  for (let level = currentLevel; level < targetLevel; level++) {
    totalRequiredGrowth += calculateRequiredSymbolGrowth(symbolName, level);
    totalRequiredMeso += calculateSymbolStepMeso(symbolName, level);
  }

  const consumedGrowth = Math.min(currentGrowth, totalRequiredGrowth);
  const remainingGrowth = totalRequiredGrowth - consumedGrowth;
  const surplusGrowth = currentGrowth - consumedGrowth;

  return {
    symbolName,
    currentLevel,
    targetLevel,
    currentGrowth,
    totalRequiredGrowth,
    totalRequiredMeso,
    consumedGrowth,
    remainingGrowth,
    surplusGrowth,
  };
}

export function calculateSymbolStepMeso(symbolName: SymbolName, currentLevel: number): number {
  if (isArcaneSymbolName(symbolName)) {
    return calculateArcaneSymbolStepMeso(symbolName, currentLevel);
  }

  if (isAuthenticSymbolName(symbolName)) {
    return calculateAuthenticSymbolStepMeso(symbolName, currentLevel);
  }

  if (isGrandSymbolName(symbolName)) {
    return calculateGrandSymbolStepMeso(symbolName, currentLevel);
  }

  return assertNever(symbolName);
}

export function getSymbolMaxLevel(symbolName: SymbolName): number {
  return symbolMaxLevelMap[symbolName];
}

export function calculateRequiredSymbolGrowth(symbolName: SymbolName, currentLevel: number): number {
  if (isArcaneSymbolName(symbolName)) {
    return calculateRequiredArcaneSymbolGrowth(currentLevel);
  }

  if (isAuthenticSymbolName(symbolName)) {
    return calculateRequiredAuthenticSymbolGrowth(currentLevel);
  }

  if (isGrandSymbolName(symbolName)) {
    return calculateRequiredGrandSymbolGrowth(currentLevel);
  }

  return assertNever(symbolName);
}

function calculateArcaneSymbolStepMeso(symbolName: ArcaneSymbolName, currentLevel: number): number {
  const regionConstant = arcaneSymbolRegionConstantMap[symbolName];
  const requiredGrowth = calculateRequiredArcaneSymbolGrowth(currentLevel);
  const mesoCoefficient = regionConstant + 3 + currentLevel * 0.05;

  return floorMesoBase(requiredGrowth * 2 * mesoCoefficient) * ARCANE_MESO_UNIT;
}

function calculateAuthenticSymbolStepMeso(symbolName: AuthenticSymbolName, currentLevel: number): number {
  const regionConstant = authenticSymbolRegionConstantMap[symbolName];
  const requiredGrowth = calculateRequiredAuthenticSymbolGrowth(currentLevel);
  const mesoCoefficient = regionConstant + 6 - (currentLevel - 1) / 3;

  return floorMesoBase(requiredGrowth * 1.8 * mesoCoefficient) * AUTHENTIC_MESO_UNIT;
}

function calculateGrandSymbolStepMeso(symbolName: GrandSymbolName, currentLevel: number): number {
  const regionConstant = grandSymbolRegionConstantMap[symbolName];
  const requiredGrowth = calculateRequiredGrandSymbolGrowth(currentLevel);
  const mesoCoefficient = 5 * regionConstant + 22 - (3 * currentLevel - 1) / 9;

  return floorMesoBase(requiredGrowth * 1.8 * mesoCoefficient) * AUTHENTIC_MESO_UNIT;
}

function floorMesoBase(value: number): number {
  return Math.floor(value + FLOATING_POINT_FLOOR_EPSILON);
}

function calculateArcaneSymbolStat(currentLevel: number, classType: SymbolStatClassType): number {
  const levelFactor = currentLevel + 2;

  return getSymbolStatMultiplier(classType) * levelFactor;
}

function calculateAuthenticSymbolStat(currentLevel: number, classType: SymbolStatClassType): number {
  const levelFactor = 2 * currentLevel + 3;

  return getSymbolStatMultiplier(classType) * levelFactor;
}

function calculateGrandSymbolSpecialStat(currentLevel: number) {
  return {
    expGainPercent: 4 * currentLevel + 6,
    mesoGainPercent: currentLevel + 4,
    itemDropRatePercent: currentLevel + 4,
  };
}

function getSymbolStatMultiplier(classType: SymbolStatClassType): number {
  if (classType === '제논') {
    return 48;
  }

  if (classType === '데몬어벤져') {
    return 2100;
  }

  return 100;
}

function calculateRequiredArcaneSymbolGrowth(currentLevel: number): number {
  return currentLevel ** 2 + 11;
}

function calculateRequiredAuthenticSymbolGrowth(currentLevel: number): number {
  return 9 * currentLevel ** 2 + 20 * currentLevel;
}

function calculateRequiredGrandSymbolGrowth(currentLevel: number): number {
  return 9 * currentLevel ** 2 + 20 * currentLevel;
}

function isArcaneSymbolName(symbolName: SymbolName): symbolName is ArcaneSymbolName {
  return arcaneSymbolNames.includes(symbolName as ArcaneSymbolName);
}

function isAuthenticSymbolName(symbolName: SymbolName): symbolName is AuthenticSymbolName {
  return authenticSymbolNames.includes(symbolName as AuthenticSymbolName);
}

function isGrandSymbolName(symbolName: SymbolName): symbolName is GrandSymbolName {
  return grandSymbolNames.includes(symbolName as GrandSymbolName);
}

function assertNever(value: never): never {
  throw new Error(`Unsupported symbol name: ${value}`);
}
