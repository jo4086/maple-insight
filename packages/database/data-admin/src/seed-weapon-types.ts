import 'dotenv/config';

import { classGroupKeyMap, finalClassNameKeyMap, type ClassGroup, type FinalClassName } from '@maple/data-core';
import { weaponConstantOverrideMap, weaponTypeMetaMap, weaponTypes, type WeaponType } from '@maple/data-equipment';
import { disconnectDb } from '@maple/db';
import { seedWeaponTypes, type ValidatedWeaponTypeSeedRow } from '@maple/db/admin';

const heroWeaponConstantOverrides: Readonly<Partial<Record<string, number>>> = weaponConstantOverrideMap.히어로;

type SkippedWeaponType = {
  weaponType: WeaponType;
  reason: string;
};

function isClassGroupArray(value: ClassGroup | readonly ClassGroup[]): value is readonly ClassGroup[] {
  return Array.isArray(value);
}

function mapClassGroupKeys(classGroup: ClassGroup | readonly ClassGroup[]): string[] {
  const groups = isClassGroupArray(classGroup) ? classGroup : [classGroup];
  return groups.map((group) => classGroupKeyMap[group]);
}

function isFinalClassName(value: string): value is FinalClassName {
  return Object.hasOwn(finalClassNameKeyMap, value);
}

export function createWeaponTypeSeedInput(): { rows: ValidatedWeaponTypeSeedRow[]; skipped: SkippedWeaponType[] } {
  const rows: ValidatedWeaponTypeSeedRow[] = [];
  const skipped: SkippedWeaponType[] = [];

  for (const weaponType of weaponTypes) {
    const meta = weaponTypeMetaMap[weaponType];
    const requiredClass = meta.requiredClass;

    if (!Number.isFinite(meta.weaponConstant) || meta.weaponConstant <= 0) {
      skipped.push({ weaponType, reason: 'invalid base weapon constant' });
      continue;
    }

    if (requiredClass !== null && (typeof requiredClass !== 'string' || !isFinalClassName(requiredClass))) {
      skipped.push({ weaponType, reason: 'required class has no canonical final-class identifier' });
      continue;
    }

    if (requiredClass === null && meta.classGroup === null) {
      skipped.push({ weaponType, reason: 'class group is not defined' });
      continue;
    }

    const isDedicated = requiredClass !== null;
    const classGroupKeys = meta.classGroup === null ? [] : mapClassGroupKeys(meta.classGroup);
    rows.push({
      part: meta.label,
      normalizedPart: meta.label.replace(/\s+/g, ''),
      category: 'weapon',
      handType: meta.handType,
      classGroupKeys: isDedicated ? [] : classGroupKeys,
      availabilityMode: isDedicated ? 'job_ids' : 'class_groups',
      allowedJobIds: isDedicated ? [finalClassNameKeyMap[requiredClass]] : [],
      isDedicated,
      weaponConstant: meta.weaponConstant.toString(),
      heroWeaponConstant: heroWeaponConstantOverrides[meta.label]?.toString() ?? null,
      attackSpeed: null,
    });
  }

  return { rows, skipped };
}

async function main(): Promise<void> {
  const { rows, skipped } = createWeaponTypeSeedInput();
  const result = await seedWeaponTypes(rows);

  console.log('Seeded weapon types:', result);
  if (skipped.length > 0) console.warn('Skipped weapon types:', skipped);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDb();
  });
