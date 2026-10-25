import assert from 'node:assert/strict';
import { test } from 'node:test';

import { cloneGameDataVersionInTransaction, failGameDataVersionImport, finalizeGameDataVersionCopy, findGameDataVersions, resetIncompleteGameDataVersionCopy, softDeleteGameDataVersion, updateGameDataVersionReleasedOn } from './game-data-version.repo';

import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

const sourceVersion = '1.2.100';
const targetVersion = '1.2.101';
const ownedModels = ['gameJob', 'gameSkill', 'gameSkillCommon', 'gameSkillHint', 'gameSkillLevel', 'gameSkillPvpCommon', 'equipmentItem'] as const;

function transaction(status = 'ready', collision = false) {
  const created: Record<string, unknown[]> = {};
  const tx: Record<string, unknown> = {
    gameDataVersion: {
      findUnique: async ({ where }: { where: { version: string } }) =>
        where.version === sourceVersion ? { status, releasedOn: null } : collision ? { status: 'ready' } : null,
      create: async ({ data }: { data: unknown }) => { (created.gameDataVersion ??= []).push(data); },
    },
    gameDataRawFile: {
      findMany: async ({ cursor }: { cursor?: unknown }) => cursor ? [] : [{ id: 10n, version: sourceVersion, fileName: 'raw.json', rowCount: 1, createdAt: new Date(0), updatedAt: new Date(0) }],
      create: async ({ data }: { data: unknown }) => { (created.gameDataRawFile ??= []).push(data); return { id: 20n }; },
    },
    gameDataRawRecord: {
      findMany: async ({ cursor }: { cursor?: unknown }) => cursor ? [] : [{ id: 11n, fileId: 10n, rowIndex: 0, sourceKey: 'a', payload: { a: 1 } }],
      createMany: async ({ data }: { data: unknown }) => { (created.gameDataRawRecord ??= []).push(data); },
    },
  };
  for (const name of ownedModels) {
    tx[name] = {
      findMany: async ({ cursor }: { cursor?: unknown }) => cursor ? [] : [{ id: 30n, version: sourceVersion, jobId: '01', skillId: '02', name: 'item' }],
      createMany: async ({ data }: { data: unknown }) => { (created[name] ??= []).push(data); },
    };
  }
  return { tx: tx as unknown as Prisma.TransactionClient, created };
}

test('clone copies every owned table and remaps raw file identity without marking ready', async () => {
  const { tx, created } = transaction();
  await cloneGameDataVersionInTransaction(tx, sourceVersion, targetVersion);
  assert.deepEqual(Object.keys(created).sort(), ['gameDataVersion', 'gameDataRawFile', 'gameDataRawRecord', ...ownedModels].sort());
  assert.deepEqual(created.gameDataVersion, [{ version: targetVersion, major: 1, minor: 2, patch: 101, environment: 'copy', status: 'copying', releasedOn: null }]);
  assert.deepEqual(created.gameDataRawFile, [{ fileName: 'raw.json', rowCount: 1, version: targetVersion, createdAt: new Date(0), updatedAt: new Date(0) }]);
  assert.deepEqual(created.gameDataRawRecord, [[{ rowIndex: 0, sourceKey: 'a', payload: { a: 1 }, fileId: 20n }]]);
  for (const name of ownedModels) {
    const rows = created[name] as Record<string, unknown>[][];
    assert.equal(rows[0][0].version, targetVersion, name);
    assert.equal(rows[0][0].id, name === 'equipmentItem' ? undefined : 30n, name);
  }
});

test('release date and soft delete use guarded updates without cascading', async () => {
  const original = prisma.gameDataVersion.updateMany;
  const writes: unknown[] = [];
  prisma.gameDataVersion.updateMany = (async (input: unknown) => {
    writes.push(input);
    return { count: 1 };
  }) as typeof original;
  try {
    await updateGameDataVersionReleasedOn(sourceVersion, '2024-02-29');
    await updateGameDataVersionReleasedOn(sourceVersion, null);
    await softDeleteGameDataVersion(sourceVersion);
    assert.deepEqual(writes, [
      { where: { version: sourceVersion, status: { not: 'deleted' } }, data: { releasedOn: new Date('2024-02-29') } },
      { where: { version: sourceVersion, status: { not: 'deleted' } }, data: { releasedOn: null } },
      { where: { version: sourceVersion, status: { in: ['importing', 'ready', 'failed', 'copying'] } }, data: { status: 'deleted' } },
    ]);
    await assert.rejects(updateGameDataVersionReleasedOn(sourceVersion, '2024-02-30'));
    assert.equal(writes.length, 3);
    prisma.gameDataVersion.updateMany = (async () => ({ count: 0 })) as typeof original;
    await assert.rejects(softDeleteGameDataVersion(sourceVersion));
  } finally {
    prisma.gameDataVersion.updateMany = original;
  }
});

test('clone rejects deleted source, collision, and invalid target without writes', async () => {
  for (const [status, collision, target] of [['deleted', false, targetVersion], ['importing', false, targetVersion], ['ready', true, targetVersion], ['ready', false, '1.02.101']] as const) {
    const { tx, created } = transaction(status, collision);
    await assert.rejects(cloneGameDataVersionInTransaction(tx, sourceVersion, target));
    assert.deepEqual(created, {});
  }
});

test('copy finalization and failure require valid previous states', async () => {
  const original = prisma.gameDataVersion.updateMany;
  const writes: unknown[] = [];
  prisma.gameDataVersion.updateMany = (async (input: unknown) => {
    writes.push(input);
    return { count: 1 };
  }) as typeof original;
  try {
    await finalizeGameDataVersionCopy(targetVersion);
    await failGameDataVersionImport(targetVersion);
    assert.deepEqual(writes, [
      { where: { version: targetVersion, environment: 'copy', status: 'copying' }, data: { status: 'importing' } },
      { where: { version: targetVersion, status: { in: ['importing', 'copying'] } }, data: { status: 'failed', completedAt: null } },
    ]);
    prisma.gameDataVersion.updateMany = (async () => ({ count: 0 })) as typeof original;
    await assert.rejects(finalizeGameDataVersionCopy(targetVersion));
    await assert.rejects(failGameDataVersionImport(targetVersion));
  } finally {
    prisma.gameDataVersion.updateMany = original;
  }
});

test('raw clone paginates beyond 250k rows with bounded batches', async () => {
  const { tx } = transaction();
  const total = 250_001;
  let reads = 0;
  let writes = 0;
  let copied = 0;
  const delegate = tx.gameDataRawRecord as unknown as {
    findMany: (input: unknown) => Promise<unknown[]>;
    createMany: (input: unknown) => Promise<unknown>;
  };
  delegate.findMany = async (input: unknown) => {
    const { cursor, take } = input as { cursor?: { id: bigint }; take: number };
    assert.equal(take, 100);
    const start = cursor ? Number(cursor.id - 11n) + 1 : 0;
    reads++;
    return Array.from({ length: Math.min(take, total - start) }, (_, index) => ({
      id: BigInt(start + index) + 11n, fileId: 10n, rowIndex: start + index,
      sourceKey: null, payload: { row: start + index }, createdAt: new Date(0),
    }));
  };
  delegate.createMany = async (input: unknown) => {
    const { data } = input as { data: { fileId: bigint; rowIndex: number }[] };
    assert.ok(data.length <= 100);
    assert.equal(data[0].rowIndex, copied);
    assert.ok(data.every((row) => row.fileId === 20n));
    copied += data.length;
    writes++;
  };
  await cloneGameDataVersionInTransaction(tx, sourceVersion, targetVersion);
  assert.equal(copied, total);
  assert.equal(writes, 2501);
  assert.equal(reads, 2502);
});

test('default version listing includes copying and deleted; explicit status filters', async () => {
  const original = prisma.gameDataVersion.findMany;
  const queries: unknown[] = [];
  const rows = [{ status: 'copying' }, { status: 'deleted' }, { status: 'ready' }];
  prisma.gameDataVersion.findMany = (async (input: unknown) => {
    queries.push(input);
    const where = (input as { where?: { status: string } }).where;
    return where ? rows.filter((row) => row.status === where.status) : rows;
  }) as typeof original;
  try {
    assert.deepEqual(await findGameDataVersions(), rows);
    assert.deepEqual(await findGameDataVersions('ready'), [{ status: 'ready' }]);
    assert.deepEqual(queries, [
      { where: undefined, orderBy: [{ major: 'desc' }, { minor: 'desc' }, { patch: 'desc' }] },
      { where: { status: 'ready' }, orderBy: [{ major: 'desc' }, { minor: 'desc' }, { patch: 'desc' }] },
    ]);
  } finally {
    prisma.gameDataVersion.findMany = original;
  }
});

test('reset deletes only a copying copy through guarded parent delete', async () => {
  const original = prisma.$transaction;
  const deletes: unknown[] = [];
  const tx = {
    gameDataVersion: {
      deleteMany: async (input: unknown) => {
        deletes.push(input);
        return { count: 1 };
      },
    },
  };
  prisma.$transaction = (async (callback: (client: typeof tx) => Promise<void>) => callback(tx)) as typeof original;
  try {
    await resetIncompleteGameDataVersionCopy(targetVersion);
    assert.deepEqual(deletes, [{
      where: { version: targetVersion, environment: 'copy', status: 'copying' },
    }]);
    assert.deepEqual(Object.keys(tx), ['gameDataVersion']);
  } finally {
    prisma.$transaction = original;
  }
});

test('reset refuses missing or non-copying targets and noncanonical versions', async () => {
  const original = prisma.$transaction;
  let transactions = 0;
  let deletes = 0;
  let stored: { version: string; environment: string; status: string } | null = null;
  const tx = {
    gameDataVersion: {
      deleteMany: async ({ where }: { where: { version: string; environment: string; status: string } }) => {
        deletes++;
        assert.deepEqual(where, { version: targetVersion, environment: 'copy', status: 'copying' });
        return { count: stored !== null && Object.entries(where).every(([key, value]) => stored![key as keyof typeof stored] === value) ? 1 : 0 };
      },
    },
  };
  prisma.$transaction = (async (callback: (client: typeof tx) => Promise<void>) => {
    transactions++;
    return callback(tx);
  }) as typeof original;
  try {
    for (const invalid of ['1.02.101', '1.2.101x', '9007199254740992.2.101']) {
      await assert.rejects(resetIncompleteGameDataVersionCopy(invalid));
    }
    assert.equal(transactions, 0);
    const rejected = [
      null,
      ...(['failed', 'importing', 'ready', 'deleted'] as const).map((status) => ({ version: targetVersion, environment: 'copy', status })),
      { version: targetVersion, environment: 'test', status: 'copying' },
      { version: sourceVersion, environment: 'copy', status: 'copying' },
    ];
    for (const row of rejected) {
      stored = row;
      await assert.rejects(resetIncompleteGameDataVersionCopy(targetVersion), /cannot reset incomplete copy/);
    }
    assert.equal(transactions, rejected.length);
    assert.equal(deletes, rejected.length);
  } finally {
    prisma.$transaction = original;
  }
});
