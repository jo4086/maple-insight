import assert from 'node:assert/strict';
import { test } from 'node:test';

import { backfillEquipmentWeaponTypes } from './backfill-equipment-weapon-types.repo';

import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

const version = '1.2.424';
const warriorCatalog = {
  id: 10n,
  normalizedPart: '한손검',
  availabilityMode: 'class_groups',
  classGroupKeys: ['warrior'],
  allowedJobIds: [],
  isDedicated: false,
};

async function withTransaction<T>(tx: unknown, run: () => Promise<T>): Promise<T> {
  const original = prisma.$transaction;
  prisma.$transaction = (async (callback: (client: unknown) => Promise<T>) => callback(tx)) as typeof original;
  try {
    return await run();
  } finally {
    prisma.$transaction = original;
  }
}

test('links exact canonical matches and reports all remaining primary rows as deferred', async () => {
  const writes: unknown[] = [];
  const tx = {
    gameDataVersion: { findUnique: async () => ({ status: 'ready' }) },
    equipmentItem: {
      findMany: async () => [
        { id: 1n, part: '한손 검', requiredClass: '전사' },
        { id: 2n, part: '한손검', requiredClass: '마법사' },
        { id: 3n, part: '공용검', requiredClass: '공용' },
        { id: 4n, part: '복합검', requiredClass: ['전사', '마법사'] },
        { id: 5n, part: '전용검', requiredClass: '전사' },
        { id: 6n, part: '미등록검', requiredClass: '전사' },
      ],
      updateMany: async (input: unknown) => { writes.push(input); return { count: 1 }; },
      count: async () => 109,
    },
    weaponType: { findMany: async () => [
      warriorCatalog,
      { ...warriorCatalog, id: 11n, normalizedPart: '공용검', availabilityMode: 'common', classGroupKeys: [] },
      { ...warriorCatalog, id: 12n, normalizedPart: '복합검', classGroupKeys: ['warrior', 'mage'] },
      { ...warriorCatalog, id: 13n, normalizedPart: '전용검', isDedicated: true },
    ] },
  };

  const result = await withTransaction(tx, () => backfillEquipmentWeaponTypes(version));

  assert.deepEqual(result, { linked: 1, deferred: 109 });
  assert.deepEqual(writes, [{
    where: {
      id: 1n,
      version,
      category: '무기',
      part: '한손 검',
      weaponTypeId: null,
      requiredClass: { equals: '전사' },
      requiredClassOverride: { equals: Prisma.DbNull },
    },
    data: { weaponTypeId: 10n },
  }]);
});

test('conditional update failure rejects the transaction for rollback', async () => {
  let rolledBack = false;
  const tx = {
    gameDataVersion: { findUnique: async () => ({ status: 'ready' }) },
    equipmentItem: {
      findMany: async () => [{ id: 1n, part: '한손검', requiredClass: '전사' }],
      updateMany: async () => ({ count: 0 }),
      count: async () => 0,
    },
    weaponType: { findMany: async () => [warriorCatalog] },
  };
  const original = prisma.$transaction;
  prisma.$transaction = (async (callback: (client: unknown) => Promise<unknown>) => {
    try {
      return await callback(tx);
    } catch (error) {
      rolledBack = true;
      throw error;
    }
  }) as typeof original;
  try {
    await assert.rejects(backfillEquipmentWeaponTypes(version), /race detected: 1/);
    assert.equal(rolledBack, true);
  } finally {
    prisma.$transaction = original;
  }
});

test('already linked rows are excluded from reads and counts', async () => {
  const queries: unknown[] = [];
  let writes = 0;
  const tx = {
    gameDataVersion: { findUnique: async () => ({ status: 'ready' }) },
    equipmentItem: {
      findMany: async (input: unknown) => { queries.push(input); return []; },
      updateMany: async () => { writes++; return { count: 1 }; },
      count: async (input: unknown) => { queries.push(input); return 0; },
    },
    weaponType: { findMany: async () => [warriorCatalog] },
  };

  assert.deepEqual(await withTransaction(tx, () => backfillEquipmentWeaponTypes(version)), { linked: 0, deferred: 0 });
  assert.equal(writes, 0);
  assert.deepEqual(queries, [
    {
      where: {
        version,
        category: '무기',
        weaponTypeId: null,
        requiredClassOverride: { equals: Prisma.DbNull },
      },
      select: { id: true, part: true, requiredClass: true },
    },
    { where: { version, category: '무기', weaponTypeId: null } },
  ]);
});

test('missing and non-ready versions are rejected before equipment access', async () => {
  for (const status of [null, 'importing', 'failed']) {
    let reads = 0;
    const tx = {
      gameDataVersion: { findUnique: async () => status === null ? null : { status } },
      equipmentItem: { findMany: async () => { reads++; return []; } },
      weaponType: { findMany: async () => { reads++; return []; } },
    };
    await withTransaction(tx, async () => {
      await assert.rejects(backfillEquipmentWeaponTypes(version), /requires a ready version/);
    });
    assert.equal(reads, 0);
  }
});

test('required class mismatch remains deferred without an update', async () => {
  let writes = 0;
  const tx = {
    gameDataVersion: { findUnique: async () => ({ status: 'ready' }) },
    equipmentItem: {
      findMany: async () => [{ id: 2n, part: '한손검', requiredClass: '공용' }],
      updateMany: async () => { writes++; return { count: 1 }; },
      count: async () => 1,
    },
    weaponType: { findMany: async () => [warriorCatalog] },
  };

  assert.deepEqual(await withTransaction(tx, () => backfillEquipmentWeaponTypes(version)), { linked: 0, deferred: 1 });
  assert.equal(writes, 0);
});
