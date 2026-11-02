import { Prisma, type WeaponType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

export type WeaponTypeAvailabilityMode = 'common' | 'class_groups' | 'job_ids';

type WeaponTypeSeedRowBase = {
  part: string;
  normalizedPart: string;
  classGroupKeys: string[];
  availabilityMode: WeaponTypeAvailabilityMode;
  allowedJobIds: string[];
  isDedicated: boolean;
};

export type ValidatedWeaponTypeSeedRow = WeaponTypeSeedRowBase & (
  | {
      category: 'weapon';
      handType: 'oneHanded' | 'twoHanded';
      weaponConstant: Prisma.Decimal | string;
      heroWeaponConstant: Prisma.Decimal | string | null;
      attackSpeed: number | null;
    }
  | {
      category: 'subWeapon';
      handType: null;
      weaponConstant: null;
      heroWeaponConstant: null;
      attackSpeed: null;
    }
);

export type SeedWeaponTypesResult = {
  inserted: number;
  skipped: number;
};

const classGroupKeys = new Set(['warrior', 'archer', 'mage', 'thief', 'pirate']);
const heroWeaponConstantParts = new Set(['한손검', '두손검', '한손도끼', '두손도끼']);

function keyOf(row: { category: string; normalizedPart: string }): string {
  return `${row.category}\u0000${row.normalizedPart}`;
}

function decimal(value: Prisma.Decimal | string): Prisma.Decimal {
  try {
    return new Prisma.Decimal(value);
  } catch {
    throw new Error('Weapon type seed contains an invalid decimal');
  }
}

function assertUniqueNonemptyStrings(values: readonly string[], field: string): void {
  if (values.some((value) => value.length === 0) || new Set(values).size !== values.length) {
    throw new Error(`Weapon type seed contains invalid ${field}`);
  }
}

function validateRows(rows: readonly ValidatedWeaponTypeSeedRow[]): void {
  const seen = new Set<string>();

  for (const row of rows) {
    if (row.part.length === 0 || row.normalizedPart !== row.part.replace(/\s+/g, '')) {
      throw new Error('Weapon type seed contains an invalid normalizedPart');
    }
    if (row.category !== 'weapon' && row.category !== 'subWeapon') {
      throw new Error('Weapon type seed contains an invalid category');
    }

    assertUniqueNonemptyStrings(row.classGroupKeys, 'classGroupKeys');
    assertUniqueNonemptyStrings(row.allowedJobIds, 'allowedJobIds');
    if (row.classGroupKeys.some((key) => !classGroupKeys.has(key))) {
      throw new Error('Weapon type seed contains an invalid classGroupKeys value');
    }

    const validAvailability = row.availabilityMode === 'common'
      ? row.classGroupKeys.length === 0 && row.allowedJobIds.length === 0 && !row.isDedicated
      : row.availabilityMode === 'class_groups'
        ? row.classGroupKeys.length > 0 && row.allowedJobIds.length === 0 && !row.isDedicated
        : row.availabilityMode === 'job_ids'
          && row.classGroupKeys.length === 0
          && row.allowedJobIds.length > 0
          && (!row.isDedicated || row.allowedJobIds.length === 1);
    if (!validAvailability) {
      throw new Error('Weapon type seed contains an invalid availability configuration');
    }

    if (row.category === 'weapon') {
      if (row.handType !== 'oneHanded' && row.handType !== 'twoHanded') {
        throw new Error('Weapon type seed contains an invalid handType');
      }
      const weaponConstant = decimal(row.weaponConstant);
      if (!weaponConstant.isFinite() || !weaponConstant.isPositive()) {
        throw new Error('Weapon type seed contains a non-positive weaponConstant');
      }
      if (row.heroWeaponConstant !== null) {
        const heroConstant = decimal(row.heroWeaponConstant);
        if (!heroConstant.isFinite() || !heroConstant.isPositive() || !heroWeaponConstantParts.has(row.part)) {
          throw new Error('Weapon type seed contains an invalid heroWeaponConstant');
        }
      }
      if (row.attackSpeed !== null && (!Number.isInteger(row.attackSpeed) || row.attackSpeed < 1 || row.attackSpeed > 8)) {
        throw new Error('Weapon type seed contains an invalid attackSpeed');
      }
    } else if (row.handType !== null || row.weaponConstant !== null || row.heroWeaponConstant !== null || row.attackSpeed !== null) {
      throw new Error('Weapon type seed contains invalid subWeapon fields');
    }

    const key = keyOf(row);
    if (seen.has(key)) {
      throw new Error(`Duplicate weapon type seed key: ${row.category}/${row.normalizedPart}`);
    }
    seen.add(key);
  }
}

function canonicalDecimal(value: Prisma.Decimal | string | null): string | null {
  return value === null ? null : decimal(value).toString();
}

function rowsEqual(existing: WeaponType, input: ValidatedWeaponTypeSeedRow): boolean {
  return existing.part === input.part
    && existing.normalizedPart === input.normalizedPart
    && existing.category === input.category
    && existing.handType === input.handType
    && existing.availabilityMode === input.availabilityMode
    && existing.isDedicated === input.isDedicated
    && existing.attackSpeed === input.attackSpeed
    && canonicalDecimal(existing.weaponConstant) === canonicalDecimal(input.weaponConstant)
    && canonicalDecimal(existing.heroWeaponConstant) === canonicalDecimal(input.heroWeaponConstant)
    && existing.classGroupKeys.length === input.classGroupKeys.length
    && existing.classGroupKeys.every((value, index) => value === input.classGroupKeys[index])
    && existing.allowedJobIds.length === input.allowedJobIds.length
    && existing.allowedJobIds.every((value, index) => value === input.allowedJobIds[index]);
}

export async function seedWeaponTypesInTransaction(
  tx: Prisma.TransactionClient,
  rows: readonly ValidatedWeaponTypeSeedRow[],
): Promise<SeedWeaponTypesResult> {
  const existingRows = rows.length === 0
    ? []
    : await tx.weaponType.findMany({
        where: {
          OR: rows.map(({ category, normalizedPart }) => ({ category, normalizedPart })),
        },
      });
  const existingByKey = new Map(existingRows.map((row) => [keyOf(row), row]));

  for (const row of rows) {
    const existing = existingByKey.get(keyOf(row));
    if (existing && !rowsEqual(existing, row)) {
      throw new Error(`Weapon type seed conflict: ${row.category}/${row.normalizedPart}`);
    }
  }

  let inserted = 0;
  for (const row of rows) {
    if (existingByKey.has(keyOf(row))) continue;
    await tx.weaponType.create({ data: row });
    inserted++;
  }

  return { inserted, skipped: rows.length - inserted };
}

export async function seedWeaponTypes(rows: readonly ValidatedWeaponTypeSeedRow[]): Promise<SeedWeaponTypesResult> {
  validateRows(rows);
  return prisma.$transaction((tx) => seedWeaponTypesInTransaction(tx, rows));
}
