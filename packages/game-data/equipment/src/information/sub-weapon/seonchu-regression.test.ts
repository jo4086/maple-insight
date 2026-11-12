import assert from 'node:assert/strict';
import test from 'node:test';

import { subWeaponPartMetaMap } from '../../rule/weapon/sub-weapon.ts';
import { subWeaponTypes } from '../../types/sub-weapon.ts';

import { subWeaponItemMetaMap } from './meta.ts';

test('seonchu remains the shared Aran and Hoyoung sub-weapon part', () => {
  assert.equal((subWeaponTypes as readonly string[]).includes('ballast'), false);
  assert.equal(subWeaponTypes.includes('seonchu'), true);

  for (const name of ['천룡추', '아스트라 백호추'] as const) {
    assert.equal(subWeaponItemMetaMap[name].part, 'seonchu');
    assert.deepEqual(subWeaponItemMetaMap[name].requiredClassKeys, ['aran']);
    assert.equal(subWeaponItemMetaMap[name].requiredClass, '아란');
  }

  assert.equal(subWeaponItemMetaMap['월장석 선추'].part, 'seonchu');
  assert.deepEqual(subWeaponItemMetaMap['월장석 선추'].requiredClassKeys, ['hoyoung']);
  assert.equal(subWeaponPartMetaMap.seonchu.label, '선추');
});
