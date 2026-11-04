import { resolveEffectiveEquipmentAvailability, type WeaponTypeAvailability } from './weapon-type-availability';

import { Prisma } from '@/generated/prisma';
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

type EquipmentAvailabilityRow = {
  name: string;
  normalizedName: string;
  requiredClass: unknown;
  requiredClassOverride: unknown | null;
  weaponTypeId: bigint | null;
  availabilityMode: string | null;
  classGroupKeys: string[] | null;
  allowedJobIds: string[] | null;
};

function weaponTypeAvailability(row: EquipmentAvailabilityRow): WeaponTypeAvailability | null {
  if (row.weaponTypeId === null) return null;
  if (row.availabilityMode !== 'common' && row.availabilityMode !== 'class_groups' && row.availabilityMode !== 'job_ids') {
    throw new Error(`Invalid weapon type availability mode: ${row.availabilityMode}`);
  }
  return {
    availabilityMode: row.availabilityMode,
    classGroupKeys: row.classGroupKeys ?? [],
    allowedJobIds: row.allowedJobIds ?? [],
  };
}

export async function findEquipmentAvailabilityByNormalizedNames(normalizedNames: readonly string[], version?: string) {
  const names = [...new Set(normalizedNames)];
  if (names.length === 0) return [];

  const dataVersion = await prisma.gameDataVersion.findFirst({
    where: { status: 'ready', ...(version ? { version } : {}) },
    orderBy: [{ major: 'desc' }, { minor: 'desc' }, { patch: 'desc' }],
    select: { version: true },
  });
  if (!dataVersion) return [];

  const rows = await prisma.$queryRaw<EquipmentAvailabilityRow[]>(Prisma.sql`
    SELECT
      item."name",
      item."normalized_name" AS "normalizedName",
      item."required_class" AS "requiredClass",
      item."required_class_override" AS "requiredClassOverride",
      item."weapon_type_id" AS "weaponTypeId",
      type."availability_mode" AS "availabilityMode",
      type."class_group_keys" AS "classGroupKeys",
      type."allowed_job_ids" AS "allowedJobIds"
    FROM "equipment"."equipment_items" item
    LEFT JOIN "equipment"."weapon_types" type ON type."id" = item."weapon_type_id"
    WHERE item."version" = ${dataVersion.version}
      AND item."normalized_name" IN (${Prisma.join(names)})
  `);

  return rows.map((row) => ({
    name: row.name,
    normalizedName: row.normalizedName,
    effectiveAvailability: resolveEffectiveEquipmentAvailability({
      weaponType: weaponTypeAvailability(row),
      requiredClassOverride: row.requiredClassOverride,
      legacyRequiredClass: row.requiredClass,
    }),
  }));
}

export { resolveEffectiveEquipmentAvailability } from './weapon-type-availability';
export type { EffectiveEquipmentAvailability, WeaponTypeAvailability } from './weapon-type-availability';

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
