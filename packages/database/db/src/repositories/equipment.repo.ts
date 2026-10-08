import { prisma } from '@/lib/prisma';

export async function findEquipmentItemsByNormalizedNames(normalizedNames: readonly string[], version?: string) {
  const names = [...new Set(normalizedNames)];

  if (names.length === 0) return [];

  const dataVersion = await prisma.gameDataVersion.findFirst({
    where: {
      status: 'ready',
      ...(version ? { version } : {}),
    },
    orderBy: [{ major: 'desc' }, { minor: 'desc' }, { patch: 'desc' }],
    select: { version: true },
  });

  if (!dataVersion) return [];

  return prisma.equipmentItem.findMany({
    where: {
      version: dataVersion.version,
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
