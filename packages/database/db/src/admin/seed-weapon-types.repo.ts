import { Prisma, type WeaponType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { WEAPON_CLASS_GROUP_KEYS } from '@/repositories/weapon-type-availability';

export type WeaponTypeAvailabilityMode = 'common' | 'class_groups' | 'job_ids';

export type WeaponConstantOverride = {
  jobId: string;
  weaponConstant: string;
};

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
      weaponConstantOverrides: WeaponConstantOverride[] | null;
      attackSpeed: number | null;
    }
  | {
      category: 'subWeapon';
      handType: null;
      weaponConstant: null;
      weaponConstantOverrides: null;
      attackSpeed: null;
    }
);

export type SeedWeaponTypesResult = {
  inserted: number;
  skipped: number;
};

const classGroupKeys = new Set<string>(WEAPON_CLASS_GROUP_KEYS);
const canonicalJobIdPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const rowFields = new Set([
  'part',
  'normalizedPart',
  'category',
  'handType',
  'classGroupKeys',
  'availabilityMode',
  'allowedJobIds',
  'isDedicated',
  'weaponConstant',
  'weaponConstantOverrides',
  'attackSpeed',
]);
const overrideFields = new Set(['jobId', 'weaponConstant']);

type NormalizedWeaponTypeSeedRow = Omit<ValidatedWeaponTypeSeedRow, 'weaponConstantOverrides'> & {
  weaponConstantOverrides: WeaponConstantOverride[] | null;
};

function keyOf(row: { category: string; normalizedPart: string }): string {
  return `${row.category}\u0000${row.normalizedPart}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertExactFields(value: Record<string, unknown>, fields: ReadonlySet<string>, subject: string): void {
  const keys = Object.keys(value);
  if (keys.length !== fields.size || keys.some((key) => !fields.has(key))) {
    throw new Error(`Weapon type seed contains malformed ${subject} fields`);
  }
}

function decimal(value: unknown, field: string): Prisma.Decimal {
  if (typeof value !== 'string' && !(value instanceof Prisma.Decimal)) {
    throw new Error(`Weapon type seed contains an invalid ${field}`);
  }

  try {
    const parsed = new Prisma.Decimal(value);
    if (!parsed.isFinite() || !parsed.isPositive() || !parsed.lessThan(10_000) || parsed.decimalPlaces() > 4) {
      throw new Error();
    }
    return parsed;
  } catch {
    throw new Error(`Weapon type seed contains an invalid ${field}`);
  }
}

function assertUniqueNonemptyStrings(value: unknown, field: string, validate?: (item: string) => boolean): asserts value is string[] {
  if (!Array.isArray(value)
    || value.some((item) => typeof item !== 'string' || item.length === 0 || (validate && !validate(item)))
    || new Set(value).size !== value.length) {
    throw new Error(`Weapon type seed contains invalid ${field}`);
  }
}

function normalizeOverrides(value: unknown, field = 'weaponConstantOverrides'): WeaponConstantOverride[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Weapon type seed contains invalid ${field}`);
  }

  const seen = new Set<string>();
  const normalized = value.map((item) => {
    if (!isRecord(item)) throw new Error(`Weapon type seed contains invalid ${field}`);
    assertExactFields(item, overrideFields, 'weaponConstantOverrides');
    if (typeof item.jobId !== 'string' || !canonicalJobIdPattern.test(item.jobId) || seen.has(item.jobId)) {
      throw new Error(`Weapon type seed contains invalid ${field}`);
    }
    seen.add(item.jobId);
    return {
      jobId: item.jobId,
      weaponConstant: decimal(item.weaponConstant, `${field}.weaponConstant`).toString(),
    };
  });

  return normalized.sort((left, right) => left.jobId.localeCompare(right.jobId));
}

function validateRows(rows: unknown): NormalizedWeaponTypeSeedRow[] {
  if (!Array.isArray(rows)) throw new Error('Weapon type seed must be an array');
  const seen = new Set<string>();

  return rows.map((value) => {
    if (!isRecord(value)) throw new Error('Weapon type seed contains an invalid row');
    assertExactFields(value, rowFields, 'row');

    const row = value as Record<keyof ValidatedWeaponTypeSeedRow, unknown>;
    if (typeof row.part !== 'string'
      || typeof row.normalizedPart !== 'string'
      || row.part.length === 0
      || row.normalizedPart !== row.part.replace(/\s+/g, '')) {
      throw new Error('Weapon type seed contains an invalid normalizedPart');
    }
    if (row.category !== 'weapon' && row.category !== 'subWeapon') {
      throw new Error('Weapon type seed contains an invalid category');
    }
    if (typeof row.isDedicated !== 'boolean') {
      throw new Error('Weapon type seed contains an invalid isDedicated');
    }

    assertUniqueNonemptyStrings(row.classGroupKeys, 'classGroupKeys');
    assertUniqueNonemptyStrings(row.allowedJobIds, 'allowedJobIds', (jobId) => canonicalJobIdPattern.test(jobId));
    if (row.classGroupKeys.some((classGroupKey) => !classGroupKeys.has(classGroupKey))) {
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

    let normalized: NormalizedWeaponTypeSeedRow;
    if (row.category === 'weapon') {
      if (row.handType !== 'oneHanded' && row.handType !== 'twoHanded') {
        throw new Error('Weapon type seed contains an invalid handType');
      }
      const weaponConstant = decimal(row.weaponConstant, 'weaponConstant');
      const weaponConstantOverrides = row.weaponConstantOverrides === null
        ? null
        : normalizeOverrides(row.weaponConstantOverrides);
      if (row.attackSpeed !== null
        && (typeof row.attackSpeed !== 'number'
          || !Number.isInteger(row.attackSpeed)
          || row.attackSpeed < 1
          || row.attackSpeed > 8)) {
        throw new Error('Weapon type seed contains an invalid attackSpeed');
      }
      normalized = {
        ...(value as ValidatedWeaponTypeSeedRow),
        weaponConstant,
        weaponConstantOverrides,
      };
    } else {
      if (row.handType !== null
        || row.weaponConstant !== null
        || row.weaponConstantOverrides !== null
        || row.attackSpeed !== null) {
        throw new Error('Weapon type seed contains invalid subWeapon fields');
      }
      normalized = value as NormalizedWeaponTypeSeedRow;
    }

    const key = keyOf(normalized);
    if (seen.has(key)) {
      throw new Error(`Duplicate weapon type seed key: ${normalized.category}/${normalized.normalizedPart}`);
    }
    seen.add(key);
    return normalized;
  });
}

function canonicalDecimal(value: Prisma.Decimal | string | null): string | null {
  return value === null ? null : decimal(value, 'weaponConstant').toString();
}

function canonicalExistingOverrides(value: Prisma.JsonValue | null): WeaponConstantOverride[] | null | undefined {
  if (value === null) return null;
  try {
    return normalizeOverrides(value, 'stored weaponConstantOverrides');
  } catch {
    return undefined;
  }
}

function rowsEqual(existing: WeaponType, input: NormalizedWeaponTypeSeedRow): boolean {
  const existingOverrides = canonicalExistingOverrides(existing.weaponConstantOverrides);
  return existingOverrides !== undefined
    && existing.part === input.part
    && existing.normalizedPart === input.normalizedPart
    && existing.category === input.category
    && existing.handType === input.handType
    && existing.availabilityMode === input.availabilityMode
    && existing.isDedicated === input.isDedicated
    && existing.attackSpeed === input.attackSpeed
    && canonicalDecimal(existing.weaponConstant) === canonicalDecimal(input.weaponConstant)
    && JSON.stringify(existingOverrides) === JSON.stringify(input.weaponConstantOverrides)
    && existing.classGroupKeys.length === input.classGroupKeys.length
    && existing.classGroupKeys.every((value, index) => value === input.classGroupKeys[index])
    && existing.allowedJobIds.length === input.allowedJobIds.length
    && existing.allowedJobIds.every((value, index) => value === input.allowedJobIds[index]);
}

export async function seedWeaponTypesInTransaction(
  tx: Prisma.TransactionClient,
  rows: readonly NormalizedWeaponTypeSeedRow[],
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
    const { weaponConstantOverrides, ...data } = row;
    await tx.weaponType.create({
      data: weaponConstantOverrides === null
        ? data
        : { ...data, weaponConstantOverrides },
    });
    inserted++;
  }

  return { inserted, skipped: rows.length - inserted };
}

export async function seedWeaponTypes(rows: unknown): Promise<SeedWeaponTypesResult> {
  const validatedRows = validateRows(rows);
  return prisma.$transaction((tx) => seedWeaponTypesInTransaction(tx, validatedRows));
}
