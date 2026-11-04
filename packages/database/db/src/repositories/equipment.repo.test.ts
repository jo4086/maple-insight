import assert from 'node:assert/strict';
import { test } from 'node:test';

import { findEquipmentAvailabilityByNormalizedNames } from './equipment.repo';

import { prisma } from '@/lib/prisma';

test('default lookup selects ready 1.2.419 when 1.2.424 is deleted and maps availability', async () => {
  const originalFindFirst = prisma.gameDataVersion.findFirst;
  const originalQueryRaw = prisma.$queryRaw;
  let lookup: unknown;
  let query: unknown;

  prisma.gameDataVersion.findFirst = (async (input: unknown) => {
    lookup = input;
    return { version: '1.2.419' };
  }) as typeof originalFindFirst;
  prisma.$queryRaw = (async (input: unknown) => {
    query = input;
    return [
      {
        name: 'Inherited',
        normalizedName: 'inherited',
        requiredClass: '전사',
        requiredClassOverride: null,
        weaponTypeId: 1n,
        availabilityMode: 'class_groups',
        classGroupKeys: ['warrior'],
        allowedJobIds: [],
      },
      {
        name: 'Overridden',
        normalizedName: 'overridden',
        requiredClass: '전사',
        requiredClassOverride: ['히어로', '팔라딘'],
        weaponTypeId: 2n,
        availabilityMode: 'class_groups',
        classGroupKeys: ['warrior'],
        allowedJobIds: [],
      },
      {
        name: 'Legacy',
        normalizedName: 'legacy',
        requiredClass: ['전사', '궁수'],
        requiredClassOverride: null,
        weaponTypeId: null,
        availabilityMode: null,
        classGroupKeys: null,
        allowedJobIds: null,
      },
    ];
  }) as typeof originalQueryRaw;

  try {
    assert.deepEqual(await findEquipmentAvailabilityByNormalizedNames([
      'inherited', 'overridden', 'legacy', 'inherited',
    ]), [
      {
        name: 'Inherited',
        normalizedName: 'inherited',
        effectiveAvailability: {
          source: 'weapon_type', mode: 'class_groups', classGroupKeys: ['warrior'], allowedJobIds: [],
        },
      },
      {
        name: 'Overridden',
        normalizedName: 'overridden',
        effectiveAvailability: { source: 'item_override', requiredClass: ['히어로', '팔라딘'] },
      },
      {
        name: 'Legacy',
        normalizedName: 'legacy',
        effectiveAvailability: { source: 'legacy', requiredClass: ['전사', '궁수'] },
      },
    ]);
    assert.deepEqual(lookup, {
      where: { status: 'ready' },
      orderBy: [{ major: 'desc' }, { minor: 'desc' }, { patch: 'desc' }],
      select: { version: true },
    });
    assert.equal((query as { values: unknown[] }).values[0], '1.2.419');
  } finally {
    prisma.gameDataVersion.findFirst = originalFindFirst;
    prisma.$queryRaw = originalQueryRaw;
  }
});

test('explicit deleted version returns no rows without querying equipment', async () => {
  const originalFindFirst = prisma.gameDataVersion.findFirst;
  const originalQueryRaw = prisma.$queryRaw;
  let lookup: unknown;
  let equipmentQueries = 0;

  prisma.gameDataVersion.findFirst = (async (input: unknown) => {
    lookup = input;
    return null;
  }) as typeof originalFindFirst;
  prisma.$queryRaw = (async () => {
    equipmentQueries++;
    return [];
  }) as typeof originalQueryRaw;

  try {
    assert.deepEqual(await findEquipmentAvailabilityByNormalizedNames(['legacy'], '1.2.424'), []);
    assert.deepEqual(lookup, {
      where: { status: 'ready', version: '1.2.424' },
      orderBy: [{ major: 'desc' }, { minor: 'desc' }, { patch: 'desc' }],
      select: { version: true },
    });
    assert.equal(equipmentQueries, 0);
  } finally {
    prisma.gameDataVersion.findFirst = originalFindFirst;
    prisma.$queryRaw = originalQueryRaw;
  }
});
