import { prisma } from '@/lib/prisma';

export async function findEquipmentItemsByNormalizedNames(normalizedNames: readonly string[]) {
  const names = [...new Set(normalizedNames)];

  if (names.length === 0) return [];

  return prisma.equipmentItem.findMany({
    where: {
      normalizedName: { in: names },
    },
    select: {
      name: true,
      normalizedName: true,
      baseName: true,
      setName: true,
      category: true,
      part: true,
      requiredClass: true,
      classGroup: true,
      grantedSkills: true,
      specialRingLevel: true,
      potentialEnabled: true,
      starforceEnabled: true,
      scrollUpgradeEnabled: true,
      addOptionEnabled: true,
    },
  });
}

export async function findAllEquipmentPotentialOptionTexts() {
  return prisma.equipmentPotentialOptionText.findMany({
    select: {
      kind: true,
      level: true,
      part: true,
      grade: true,
      optionText: true,
    },
    orderBy: [{ kind: 'asc' }, { level: 'asc' }, { part: 'asc' }, { grade: 'asc' }, { optionText: 'asc' }],
  });
}
