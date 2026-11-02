import assert from 'node:assert/strict';
import { test } from 'node:test';

import { seedWeaponTypes, type ValidatedWeaponTypeSeedRow } from './seed-weapon-types.repo';

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
  heroWeaponConstant: '1.34',
  attackSpeed: 5,
} satisfies ValidatedWeaponTypeSeedRow;

test('invalid input is rejected before opening a transaction', async () => {
  const original = prisma.$transaction;
  let transactions = 0;
  prisma.$transaction = (async () => { transactions++; }) as typeof original;

  try {
    await assert.rejects(
      seedWeaponTypes([{ ...oneHandedSword, normalizedPart: 'wrong' }]),
      /invalid normalizedPart/,
    );
    assert.equal(transactions, 0);
  } finally {
    prisma.$transaction = original;
  }
});

test('equal existing rows are skipped without changing their ids', async () => {
  const original = prisma.$transaction;
  const writes: unknown[] = [];
  const tx = {
    weaponType: {
      findMany: async () => [{ id: 42n, ...oneHandedSword, weaponConstant: '1.2400' }],
      create: async (input: unknown) => { writes.push(input); },
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

test('one conflicting row aborts before any absent rows are inserted', async () => {
  const original = prisma.$transaction;
  const writes: unknown[] = [];
  const tx = {
    weaponType: {
      findMany: async () => [{ id: 42n, ...oneHandedSword, attackSpeed: 6 }],
      create: async (input: unknown) => { writes.push(input); },
    },
  };
  prisma.$transaction = (async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)) as typeof original;
  const absent = { ...oneHandedSword, part: '두손검', normalizedPart: '두손검', handType: 'twoHanded' };

  try {
    await assert.rejects(seedWeaponTypes([absent, oneHandedSword]), /Weapon type seed conflict: weapon\/한손검/);
    assert.deepEqual(writes, []);
  } finally {
    prisma.$transaction = original;
  }
});
