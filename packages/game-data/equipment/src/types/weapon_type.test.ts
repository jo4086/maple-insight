import assert from 'node:assert/strict';

import { finalClassNameKeyMap } from '@maple/data-core';

import { resolveWeaponTypeConstant, type WeaponTypeRecord } from './weapon_type.ts';

type WeaponRecord = Extract<WeaponTypeRecord, { readonly category: 'weapon' }>;

const weaponType = {
  id: 1n,
  part: '한손둔기',
  normalizedPart: '한손둔기',
  category: 'weapon',
  handType: 'oneHanded',
  classGroupKeys: ['warrior'],
  availabilityMode: 'class_groups',
  allowedJobIds: [],
  isDedicated: false,
  attackSpeed: 5,
  weaponConstant: 1.2,
  weaponConstantOverrides: [
    { jobId: finalClassNameKeyMap['히어로'], weaponConstant: 1.34 },
    { jobId: finalClassNameKeyMap['팔라딘'], weaponConstant: 1.24 },
  ],
} as const satisfies WeaponRecord;

assert.equal(resolveWeaponTypeConstant(weaponType, finalClassNameKeyMap['히어로']), 1.34);
assert.equal(resolveWeaponTypeConstant(weaponType, finalClassNameKeyMap['팔라딘']), 1.24);
assert.equal(resolveWeaponTypeConstant(weaponType, finalClassNameKeyMap['다크나이트']), 1.2);
