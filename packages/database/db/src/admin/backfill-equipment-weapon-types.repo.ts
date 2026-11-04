import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

export type BackfillEquipmentWeaponTypesResult = {
  linked: number;
  deferred: number;
};

const classGroupLabels: Readonly<Record<string, string>> = {
  warrior: '전사',
  archer: '궁수',
  mage: '마법사',
  thief: '도적',
  pirate: '해적',
};

export async function backfillEquipmentWeaponTypes(
  version: string,
): Promise<BackfillEquipmentWeaponTypesResult> {
  return prisma.$transaction(async (tx) => {
    const target = await tx.gameDataVersion.findUnique({
      where: { version },
      select: { status: true },
    });
    if (target?.status !== 'ready') {
      throw new Error(`Equipment weapon type backfill requires a ready version: ${version}`);
    }

    const pendingWhere = {
      version,
      category: '무기',
      weaponTypeId: null,
    } satisfies Prisma.EquipmentItemWhereInput;
    const [items, catalog] = await Promise.all([
      tx.equipmentItem.findMany({
        where: {
          ...pendingWhere,
          requiredClassOverride: { equals: Prisma.DbNull },
        },
        select: {
          id: true,
          part: true,
          requiredClass: true,
        },
      }),
      tx.weaponType.findMany({
        where: { category: 'weapon' },
        select: {
          id: true,
          normalizedPart: true,
          availabilityMode: true,
          classGroupKeys: true,
          allowedJobIds: true,
          isDedicated: true,
        },
      }),
    ]);
    const catalogByPart = new Map(catalog.map((row) => [row.normalizedPart, row]));

    let linked = 0;
    for (const item of items) {
      const row = catalogByPart.get(item.part.replace(/\s+/g, ''));
      const classGroupKey = row?.classGroupKeys.length === 1 ? row.classGroupKeys[0] : undefined;
      const requiredClass = classGroupKey === undefined ? undefined : classGroupLabels[classGroupKey];
      if (row === undefined
        || row.availabilityMode !== 'class_groups'
        || row.isDedicated
        || row.allowedJobIds.length !== 0
        || requiredClass === undefined
        || item.requiredClass !== requiredClass) {
        continue;
      }

      const result = await tx.equipmentItem.updateMany({
        where: {
          id: item.id,
          version,
          category: '무기',
          part: item.part,
          weaponTypeId: null,
          requiredClass: { equals: requiredClass },
          requiredClassOverride: { equals: Prisma.DbNull },
        },
        data: { weaponTypeId: row.id },
      });
      if (result.count !== 1) {
        throw new Error(`Equipment weapon type backfill race detected: ${item.id}`);
      }
      linked++;
    }

    const deferred = await tx.equipmentItem.count({ where: pendingWhere });
    return { linked, deferred };
  });
}
