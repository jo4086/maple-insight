import type { StatClassType } from '@maple/game-data';

export type CalculateLevelStatInput = {
  level: number;
  classType: StatClassType;
};

export type CalculateLevelStatResult = {
  level: number;
  classType: StatClassType;
  stat: number;
};

export function calculateLevelStat({ level, classType }: CalculateLevelStatInput): CalculateLevelStatResult {
  return {
    level,
    classType,
    stat: calculateLevelStatValue(level, classType),
  };
}

export function calculateLevelStatValue(level: number, classType: StatClassType): number {
  if (classType === '데몬어벤져') {
    return 90 * level + 554;
  }

  return 5 * level + 18;
}
