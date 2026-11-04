import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import {
  assertEquipmentSeedVersion,
  matchEquipmentWeaponTypes,
  seedEquipment,
  toEquipmentItemCreateManyInput,
  validateEquipmentSeedItem,
} from './seed-equipment.repo';

import { prisma } from '@/lib/prisma';

type MatchItem = Parameters<typeof matchEquipmentWeaponTypes>[0][number];
type CatalogRow = Parameters<typeof matchEquipmentWeaponTypes>[1][number];

function item(
  category: string,
  part: string,
  name = part,
  requiredClassOverride?: unknown,
  requiredClass: string | readonly string[] = '전사',
): MatchItem {
  return { category, part, name, requiredClass, requiredClassOverride } as MatchItem;
}

function catalogRow(
  id: bigint,
  category: string,
  normalizedPart: string,
  availabilityMode = 'class_groups',
  classGroupKeys: readonly string[] = ['warrior'],
  allowedJobIds: readonly string[] = [],
): CatalogRow {
  return { id, category, normalizedPart, availabilityMode, classGroupKeys, allowedJobIds };
}

test('Korean generator categories map to explicit catalog categories', () => {
  const weapon = item('무기', '한손 검');
  const subWeapon = item('보조무기', '방패');
  const matches = matchEquipmentWeaponTypes([weapon, subWeapon], [
    catalogRow(1n, 'weapon', '한손검'),
    catalogRow(2n, 'subWeapon', '방패'),
  ]);
  assert.equal(matches.get(weapon), 1n);
  assert.equal(matches.get(subWeapon), 2n);
});

test('incomplete catalog is reported before partial linking', () => {
  assert.throws(() => matchEquipmentWeaponTypes([
    item('무기', '한손검'),
    item('무기', '두손검'),
  ], [
    catalogRow(1n, 'weapon', '한손검'),
  ]), /Unsupported weapon type catalog matches: weapon\/두손검/);
});

test('primary weapon inherits canonical common and single class-group availability', () => {
  const common = item('무기', '초보자검', '초보자검', undefined, '공용');
  const mage = item('무기', '완드', '완드', undefined, '마법사');
  const matches = matchEquipmentWeaponTypes([common, mage], [
    catalogRow(1n, 'weapon', '초보자검', 'common', []),
    catalogRow(2n, 'weapon', '완드', 'class_groups', ['mage']),
  ]);
  assert.equal(matches.get(common), 1n);
  assert.equal(matches.get(mage), 2n);
});

test('primary weapon explicit override passes when it exactly preserves requiredClass', () => {
  const requiredClass = ['히어로', '팔라딘'];
  const weapon = item('무기', '한손검', '전용검', requiredClass, requiredClass);
  const matches = matchEquipmentWeaponTypes([weapon], [
    catalogRow(1n, 'weapon', '한손검', 'job_ids', [], ['hero']),
  ]);
  assert.equal(matches.get(weapon), 1n);
});

test('primary weapon rejects mismatched legacy class and inconsistent explicit override', () => {
  assert.throws(() => matchEquipmentWeaponTypes([
    item('무기', '한손검', '잘못된 전사검', undefined, '궁수'),
  ], [
    catalogRow(1n, 'weapon', '한손검'),
  ]), /requiredClass does not match weapon type availability: 잘못된 전사검/);
  assert.throws(() => matchEquipmentWeaponTypes([
    item('무기', '한손검', '잘못된 전용검', '히어로', '전사'),
  ], [
    catalogRow(1n, 'weapon', '한손검'),
  ]), /requiredClassOverride does not match requiredClass: 잘못된 전용검/);
});

test('subweapon remains unmatched while catalog has no subweapon rows', () => {
  const subWeapon = item('보조무기', '방패');
  const matches = matchEquipmentWeaponTypes([subWeapon], [
    catalogRow(1n, 'weapon', '한손검'),
  ]);
  assert.equal(matches.has(subWeapon), false);
});

test('subweapon requires exact match when catalog has subweapon rows', () => {
  assert.throws(() => matchEquipmentWeaponTypes([
    item('보조무기', '방패'),
  ], [
    catalogRow(2n, 'subWeapon', '마도서'),
  ]), /Unsupported weapon type catalog matches: subWeapon\/방패/);
});

test('non-weapon equipment remains unlinked', () => {
  assert.equal(matchEquipmentWeaponTypes([item('방어구', '모자')], []).size, 0);
});

test('generated nonweapon categories are accepted without overrides', () => {
  assert.doesNotThrow(() => validateEquipmentSeedItem(item('기타', '기타')));
  assert.doesNotThrow(() => validateEquipmentSeedItem(item('엠블렘/파워소스', '엠블렘')));
});

test('generated nonweapon categories reject requiredClassOverride', () => {
  assert.throws(() => validateEquipmentSeedItem(item('기타', '기타', '기타', '전사')), /unsupported for 기타/);
  assert.throws(
    () => validateEquipmentSeedItem(item('엠블렘/파워소스', '엠블렘', '엠블렘', '전사')),
    /unsupported for 엠블렘\/파워소스/,
  );
});

test('category, part, and override are validated before writes', () => {
  assert.throws(() => validateEquipmentSeedItem(item('weapon', '한손검')), /Unsupported equipment category/);
  assert.throws(() => validateEquipmentSeedItem(item('무기', '   ')), /Invalid equipment part/);
  assert.throws(() => validateEquipmentSeedItem(item('방어구', '모자', '모자', '전사')), /unsupported for 방어구/);
  assert.throws(() => validateEquipmentSeedItem(item('무기', '한손검', '검', [])), /Invalid requiredClassOverride/);
  assert.throws(() => validateEquipmentSeedItem(item('무기', '한손검', '검', ['공용'])), /Invalid requiredClassOverride/);
  assert.throws(() => validateEquipmentSeedItem(item('무기', '한손검', '검', [' 전사'])), /Invalid requiredClassOverride/);
  assert.doesNotThrow(() => validateEquipmentSeedItem(item('무기', '한손검', '검', '공용')));
  assert.doesNotThrow(() => validateEquipmentSeedItem(item('무기', '한손검', '검', ['전사'])));
  assert.doesNotThrow(() => validateEquipmentSeedItem(item('보조무기', '방패', '방패', ['히어로', '팔라딘'])));
});

test('absent and null override omit createMany property while explicit override is retained', () => {
  const absent = toEquipmentItemCreateManyInput(item('무기', '한손검'), '1.2.3', null);
  const jsonNull = toEquipmentItemCreateManyInput(item('무기', '한손검', '검', null), '1.2.3', null);
  const replacement = toEquipmentItemCreateManyInput(item('무기', '한손검', '검', ['히어로']), '1.2.3', 7n);
  assert.equal(Object.hasOwn(absent, 'requiredClassOverride'), false);
  assert.equal(Object.hasOwn(jsonNull, 'requiredClassOverride'), false);
  assert.equal(Object.hasOwn(replacement, 'requiredClassOverride'), true);
  assert.deepEqual(replacement.requiredClassOverride, ['히어로']);
  assert.equal(replacement.weaponTypeId, 7n);
});

test('standalone seed rejects existing versions while bundle continues importing version', () => {
  assert.throws(() => assertEquipmentSeedVersion('1.2.3', 'ready', false), /refuses existing game data version/);
  assert.throws(() => assertEquipmentSeedVersion('1.2.3', 'ready', true), /refuses existing game data version/);
  assert.throws(() => assertEquipmentSeedVersion('1.2.3', null, true), /requires importing game data version/);
  assert.equal(assertEquipmentSeedVersion('1.2.3', null, false), 'create');
  assert.equal(assertEquipmentSeedVersion('1.2.3', 'importing', true), 'continue');
});

async function withEquipmentFiles(
  run: (dir: string) => Promise<void>,
  files: { weapon?: MatchItem[]; subWeapon?: MatchItem[] } = {},
): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'seed-equipment-'));
  try {
    await Promise.all([
      writeFile(path.join(dir, 'weapon.json'), JSON.stringify(files.weapon ?? [item('무기', '한손검')])),
      writeFile(path.join(dir, 'armor.json'), '[]'),
      writeFile(path.join(dir, 'accessory.json'), '[]'),
      writeFile(path.join(dir, 'subWeapon.json'), JSON.stringify(files.subWeapon ?? [])),
    ]);
    await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test('ready-version rejection happens before equipment writes', async () => {
  const original = prisma.$transaction;
  let deletes = 0;
  try {
    await withEquipmentFiles(async (dir) => {
      prisma.$transaction = (async (callback: (tx: unknown) => Promise<unknown>) => callback({
        gameDataVersion: { findUnique: async () => ({ status: 'ready' }) },
        equipmentItem: { deleteMany: async () => { deletes += 1; } },
      })) as typeof original;
      await assert.rejects(seedEquipment({ version: '1.2.3', dir }), /refuses existing game data version/);
    });
    assert.equal(deletes, 0);
  } finally {
    prisma.$transaction = original;
  }
});

test('seed path links primary weapon type FK', async () => {
  const original = prisma.$transaction;
  const created: { weaponTypeId: bigint | null }[] = [];
  try {
    await withEquipmentFiles(async (dir) => {
      prisma.$transaction = (async (callback: (tx: unknown) => Promise<unknown>) => callback({
        gameDataVersion: { findUnique: async () => ({ status: 'importing' }) },
        weaponType: {
          findMany: async () => [catalogRow(7n, 'weapon', '한손검')],
        },
        equipmentItem: {
          deleteMany: async () => ({ count: 0 }),
          createMany: async ({ data }: { data: { weaponTypeId: bigint | null }[] }) => {
            created.push(...data);
            return { count: data.length };
          },
        },
      })) as typeof original;
      const result = await seedEquipment({ version: '1.2.3', dir, importInProgress: true });
      assert.equal(result.total, 1);
    });
    assert.equal(created.length, 1);
    assert.equal(created[0]?.weaponTypeId, 7n);
  } finally {
    prisma.$transaction = original;
  }
});

test('missing primary weapon match fails before version creation or item deletion', async () => {
  const original = prisma.$transaction;
  let versionWrites = 0;
  let deletes = 0;
  try {
    await withEquipmentFiles(async (dir) => {
      prisma.$transaction = (async (callback: (tx: unknown) => Promise<unknown>) => callback({
        gameDataVersion: {
          findUnique: async () => null,
          updateMany: async () => { versionWrites += 1; return { count: 0 }; },
          create: async () => { versionWrites += 1; },
        },
        weaponType: { findMany: async () => [] },
        equipmentItem: { deleteMany: async () => { deletes += 1; } },
      })) as typeof original;
      await assert.rejects(
        seedEquipment({ version: '1.2.3', dir }),
        /Unsupported weapon type catalog matches: weapon\/한손검/,
      );
    });
    assert.equal(versionWrites, 0);
    assert.equal(deletes, 0);
  } finally {
    prisma.$transaction = original;
  }
});

test('stale dedicated primary weapon input fails before version creation or equipment writes', async () => {
  const original = prisma.$transaction;
  let versionWrites = 0;
  let deletes = 0;
  let creates = 0;
  try {
    await withEquipmentFiles(async (dir) => {
      prisma.$transaction = (async (callback: (tx: unknown) => Promise<unknown>) => callback({
        gameDataVersion: {
          findUnique: async () => null,
          updateMany: async () => { versionWrites += 1; return { count: 0 }; },
          create: async () => { versionWrites += 1; },
        },
        weaponType: {
          findMany: async () => [catalogRow(7n, 'weapon', '한손검', 'job_ids', [], ['hero'])],
        },
        equipmentItem: {
          deleteMany: async () => { deletes += 1; },
          createMany: async () => { creates += 1; },
        },
      })) as typeof original;
      await assert.rejects(
        seedEquipment({ version: '1.2.3', dir }),
        /requiredClass does not match weapon type availability: 한손검/,
      );
    });
    assert.equal(versionWrites, 0);
    assert.equal(deletes, 0);
    assert.equal(creates, 0);
  } finally {
    prisma.$transaction = original;
  }
});

test('seed path defers subweapon link when catalog has no subweapon rows', async () => {
  const original = prisma.$transaction;
  const created: { weaponTypeId: bigint | null }[] = [];
  try {
    await withEquipmentFiles(async (dir) => {
      prisma.$transaction = (async (callback: (tx: unknown) => Promise<unknown>) => callback({
        gameDataVersion: { findUnique: async () => ({ status: 'importing' }) },
        weaponType: {
          findMany: async () => [catalogRow(7n, 'weapon', '한손검')],
        },
        equipmentItem: {
          deleteMany: async () => ({ count: 0 }),
          createMany: async ({ data }: { data: { weaponTypeId: bigint | null }[] }) => {
            created.push(...data);
            return { count: data.length };
          },
        },
      })) as typeof original;
      await seedEquipment({ version: '1.2.3', dir, importInProgress: true });
    }, { weapon: [], subWeapon: [item('보조무기', '방패')] });
    assert.equal(created[0]?.weaponTypeId, null);
  } finally {
    prisma.$transaction = original;
  }
});
