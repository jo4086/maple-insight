import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { loadWeaponTypeSeedInput } from './seed-weapon-types-loader';

type JsonObject = Record<string, unknown>;

function assertObject(value: unknown): asserts value is JsonObject {
  assert.equal(typeof value, 'object');
  assert.notEqual(value, null);
  assert.equal(Array.isArray(value), false);
}

test('loads all weapon type rows without invoking database seeding', async () => {
  const input = await loadWeaponTypeSeedInput();
  assert.ok(Array.isArray(input));
  assert.equal(input.length, 36);
  input.forEach(assertObject);

  const rowsByPart = new Map(input.map((row) => [row.part, row]));
  assert.ok(rowsByPart.has('카르타'));
  assert.deepEqual(
    ['한손검', '샤이닝 로드', '에너지 소드', '두손검', '두손둔기'].map((part) => [
      part,
      rowsByPart.get(part)?.weaponConstant,
    ]),
    [
      ['한손검', '1.24'],
      ['샤이닝 로드', '1.2'],
      ['에너지 소드', '1.3125'],
      ['두손검', '1.34'],
      ['두손둔기', '1.34'],
    ],
  );
  assert.deepEqual(rowsByPart.get('한손둔기')?.weaponConstantOverrides, [
    { jobId: 'hero', weaponConstant: '1.34' },
    { jobId: 'paladin', weaponConstant: '1.24' },
  ]);
  assert.equal(rowsByPart.get('한손도끼')?.weaponConstantOverrides, null);
  assert.ok(input.every((row) => row.isDedicated === false));
  assert.ok(input.every((row) => row.availabilityMode !== 'job_ids'));
  assert.ok(input.every((row) => Array.isArray(row.allowedJobIds) && row.allowedJobIds.length === 0));
});

test('reports the source path when reading fails', async () => {
  const missingPath = path.join(tmpdir(), 'missing-weapon-types.json');

  await assert.rejects(loadWeaponTypeSeedInput(missingPath), (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.ok(error.message.startsWith(`Failed to read weapon type seed JSON at ${missingPath}:`));
    return true;
  });
});

test('reports the source path when JSON is malformed', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'weapon-types-'));
  const malformedPath = path.join(directory, 'weapon-types.json');

  try {
    await writeFile(malformedPath, '{', 'utf8');
    await assert.rejects(loadWeaponTypeSeedInput(malformedPath), (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.ok(error.message.startsWith(`Failed to parse weapon type seed JSON at ${malformedPath}:`));
      return true;
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
