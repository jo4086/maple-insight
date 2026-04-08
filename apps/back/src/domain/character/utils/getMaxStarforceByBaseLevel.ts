import { STARFORCE_ITEM_EXCEPTIONS, STARFORCE_LEVEL_CAPS, type StarforceItemException } from '../constants/starforce.constants';

type StarforceCapInput = {
  name: string;
  baseEquipmentLevel: number;
};

function isMatchingStarforceException(itemName: string, exception: StarforceItemException): boolean {
  if (exception.exactName) {
    return itemName === exception.exactName;
  }

  if (exception.includesAll) {
    return exception.includesAll.every((keyword) => itemName.includes(keyword));
  }

  if (exception.includesAny) {
    return exception.includesAny.some((keyword) => itemName.includes(keyword));
  }

  return false;
}

export function getMaxStarforceByBaseLevel(baseEquipmentLevel: number): number {
  const matchedCap = STARFORCE_LEVEL_CAPS.find(
    ({ minLevel, maxLevel }) => baseEquipmentLevel >= minLevel && baseEquipmentLevel <= maxLevel,
  );

  return matchedCap?.maxStarforce ?? 0;
}

export function getMaxStarforceCap({ name, baseEquipmentLevel }: StarforceCapInput): number {
  const matchedException = STARFORCE_ITEM_EXCEPTIONS.find((exception) => isMatchingStarforceException(name, exception));

  if (matchedException) {
    return matchedException.maxStarforce;
  }

  return getMaxStarforceByBaseLevel(baseEquipmentLevel);
}
