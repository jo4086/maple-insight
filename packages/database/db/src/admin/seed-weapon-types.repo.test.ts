import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { seedWeaponTypes, type ValidatedWeaponTypeSeedRow } from './seed-weapon-types.repo';

import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

const oneHandedSword = {
  part: '한손검',
  normalizedPart: '한손검',
  category: 'weapon',
  handType: 'oneHanded',
  classGroupKeys: ['warrior'],
  availabilityMode: 'class_groups',
  allowedJobIds: [],
  isDedicated: false,
  weaponConstant: '1.24',
  weaponConstantOverrides: [
    { jobId: 'hero', weaponConstant: '1.3400' },
    { jobId: 'paladin', weaponConstant: '1.24' },
  ],
  attackSpeed: 5,
} satisfies ValidatedWeaponTypeSeedRow;

async function countTransactions(input: unknown): Promise<number> {
  const original = prisma.$transaction;
  let transactions = 0;
  prisma.$transaction = (async () => {
    transactions++;
  }) as typeof original;

  try {
    await assert.rejects(seedWeaponTypes(input), /Weapon type seed/);
    return transactions;
  } finally {
    prisma.$transaction = original;
  }
}

test('malformed input is rejected before opening a transaction', async () => {
  const { weaponConstantOverrides: _missing, ...missing } = oneHandedSword;
  const duplicate = {
    ...oneHandedSword,
    weaponConstantOverrides: [
      { jobId: 'hero', weaponConstant: '1.34' },
      { jobId: 'hero', weaponConstant: '1.44' },
    ],
  };
  const invalid = {
    ...oneHandedSword,
    weaponConstantOverrides: [{ jobId: 'Hero', weaponConstant: '10000' }],
  };

  assert.equal(await countTransactions('not-an-array'), 0);
  assert.equal(await countTransactions(['not-a-row']), 0);
  assert.equal(await countTransactions([[]]), 0);
  assert.equal(await countTransactions([missing]), 0);
  assert.equal(await countTransactions([duplicate]), 0);
  assert.equal(await countTransactions([invalid]), 0);
  assert.equal(await countTransactions([{ ...oneHandedSword, attackSpeed: 0 }]), 0);
  assert.equal(await countTransactions([{ ...oneHandedSword, attackSpeed: 9 }]), 0);
  assert.equal(await countTransactions([{ ...oneHandedSword, attackSpeed: 1.5 }]), 0);
  assert.equal(await countTransactions([{ ...oneHandedSword, attackSpeed: '5' }]), 0);
  assert.equal(await countTransactions([{ ...oneHandedSword, normalizedPart: 'wrong' }]), 0);
  assert.equal(await countTransactions([{ ...oneHandedSword, weaponConstant: { toString: () => '1.24' } }]), 0);
  assert.equal(
    await countTransactions([
      {
        ...oneHandedSword,
        weaponConstant: Object.create(Prisma.Decimal.prototype),
      },
    ]),
    0,
  );
});

test('cross-runtime Decimal existing row is skipped while absent subweapon is inserted', async () => {
  const original = prisma.$transaction;
  const crossRuntimeDecimal = new Proxy(new Prisma.Decimal('1.24'), {
    getPrototypeOf: () => Object.prototype,
  });
  const writes: { data: Record<string, unknown> }[] = [];
  const tx = {
    weaponType: {
      findMany: async () => [{ id: 42n, ...oneHandedSword, weaponConstant: crossRuntimeDecimal }],
      create: async (input: { data: Record<string, unknown> }) => {
        writes.push(input);
      },
    },
  };
  prisma.$transaction = (async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)) as typeof original;
  const subweapon = {
    ...oneHandedSword,
    part: '방패',
    normalizedPart: '방패',
    category: 'subWeapon',
    handType: null,
    classGroupKeys: [],
    availabilityMode: 'common',
    weaponConstant: null,
    weaponConstantOverrides: null,
    attackSpeed: null,
  } satisfies ValidatedWeaponTypeSeedRow;

  try {
    assert.equal(crossRuntimeDecimal instanceof Prisma.Decimal, false);
    assert.equal(Prisma.Decimal.isDecimal(crossRuntimeDecimal), true);
    assert.deepEqual(await seedWeaponTypes([oneHandedSword, subweapon]), { inserted: 1, skipped: 1 });
    assert.equal(writes.length, 1);
    assert.equal(writes[0]?.data.category, 'subWeapon');
    assert.equal(writes[0]?.data.normalizedPart, '방패');
  } finally {
    prisma.$transaction = original;
  }
});

test('actual weapon type JSON inserts all unique rows with representative overrides', async () => {
  const rows = JSON.parse(await readFile(path.resolve(process.cwd(), '../../game-data/equipment/data/weapon-types.json'), 'utf8')) as unknown;
  const original = prisma.$transaction;
  const writes: { data: Record<string, unknown> }[] = [];
  const tx = {
    weaponType: {
      findMany: async () => [],
      create: async (input: { data: Record<string, unknown> }) => {
        writes.push(input);
      },
    },
  };
  prisma.$transaction = (async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)) as typeof original;

  try {
    assert.deepEqual(await seedWeaponTypes(rows), { inserted: 77, skipped: 0 });
    assert.equal(writes.length, 77);
    assert.equal(new Set(writes.map(({ data }) => `${data.category}/${data.normalizedPart}`)).size, 77);

    const shape = (part: string) => {
      const data = writes.find((write) => write.data.part === part)?.data;
      assert.ok(data);
      return {
        handType: data.handType,
        weaponConstant: String(data.weaponConstant),
        weaponConstantOverrides: data.weaponConstantOverrides,
        attackSpeed: data.attackSpeed,
      };
    };
    assert.equal(shape('스태프').attackSpeed, 2);
    assert.equal(shape('활').attackSpeed, 4);
    assert.equal(shape('카르타').attackSpeed, 4);
    assert.deepEqual(shape('한손검'), {
      handType: 'oneHanded',
      weaponConstant: '1.24',
      weaponConstantOverrides: [{ jobId: 'hero', weaponConstant: '1.34' }],
      attackSpeed: 5,
    });
    assert.deepEqual(shape('한손둔기'), {
      handType: 'oneHanded',
      weaponConstant: '1.2',
      weaponConstantOverrides: [
        { jobId: 'hero', weaponConstant: '1.34' },
        { jobId: 'paladin', weaponConstant: '1.24' },
      ],
      attackSpeed: 5,
    });
    assert.deepEqual(shape('두손검'), {
      handType: 'twoHanded',
      weaponConstant: '1.34',
      weaponConstantOverrides: [{ jobId: 'hero', weaponConstant: '1.44' }],
      attackSpeed: 4,
    });
    assert.deepEqual(shape('두손둔기'), {
      handType: 'twoHanded',
      weaponConstant: '1.34',
      weaponConstantOverrides: [{ jobId: 'hero', weaponConstant: '1.44' }],
      attackSpeed: 4,
    });
  } finally {
    prisma.$transaction = original;
  }
});

test('two overrides are included and null overrides are omitted on create', async () => {
  const original = prisma.$transaction;
  const writes: { data?: Record<string, unknown> }[] = [];
  const tx = {
    weaponType: {
      findMany: async () => [],
      create: async (input: { data?: Record<string, unknown> }) => {
        writes.push(input);
      },
    },
  };
  prisma.$transaction = (async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)) as typeof original;

  try {
    const withoutOverrides = {
      ...oneHandedSword,
      part: '두손검',
      normalizedPart: '두손검',
      handType: 'twoHanded' as const,
      weaponConstantOverrides: null,
      attackSpeed: null,
    };
    assert.deepEqual(await seedWeaponTypes([oneHandedSword, withoutOverrides]), { inserted: 2, skipped: 0 });
    assert.equal(Object.hasOwn(writes[0]?.data ?? {}, 'weaponConstantOverrides'), true);
    assert.deepEqual(writes[0]?.data?.weaponConstantOverrides, [
      { jobId: 'hero', weaponConstant: '1.34' },
      { jobId: 'paladin', weaponConstant: '1.24' },
    ]);
    assert.equal(writes[0]?.data?.attackSpeed, 5);
    assert.equal(Object.hasOwn(writes[1]?.data ?? {}, 'weaponConstantOverrides'), false);
    assert.equal(writes[1]?.data?.attackSpeed, null);
  } finally {
    prisma.$transaction = original;
  }
});

test('equal existing rows are skipped with override order and decimal formatting ignored', async () => {
  const original = prisma.$transaction;
  const writes: unknown[] = [];
  const tx = {
    weaponType: {
      findMany: async () => [
        {
          id: 42n,
          ...oneHandedSword,
          weaponConstant: '1.2400',
          weaponConstantOverrides: [
            { jobId: 'paladin', weaponConstant: '1.2400' },
            { jobId: 'hero', weaponConstant: '1.34' },
          ],
        },
      ],
      create: async (input: unknown) => {
        writes.push(input);
      },
    },
  };
  prisma.$transaction = (async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)) as typeof original;

  try {
    assert.deepEqual(await seedWeaponTypes([oneHandedSword]), { inserted: 0, skipped: 1 });
    assert.deepEqual(writes, []);
  } finally {
    prisma.$transaction = original;
  }
});

test('speed-only conflict aborts before any absent rows are inserted', async () => {
  const original = prisma.$transaction;
  const writes: unknown[] = [];
  const tx = {
    weaponType: {
      findMany: async () => [{ id: 42n, ...oneHandedSword, attackSpeed: 6 }],
      create: async (input: unknown) => {
        writes.push(input);
      },
    },
  };
  prisma.$transaction = (async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)) as typeof original;
  const absent = { ...oneHandedSword, part: '두손검', normalizedPart: '두손검', handType: 'twoHanded' as const };

  try {
    await assert.rejects(seedWeaponTypes([absent, oneHandedSword]), /Weapon type seed conflict: weapon\/한손검/);
    assert.deepEqual(writes, []);
  } finally {
    prisma.$transaction = original;
  }
});
