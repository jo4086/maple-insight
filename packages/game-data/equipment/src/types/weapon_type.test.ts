import assert from 'node:assert/strict';

import { finalClassNameKeyMap } from '@maple/data-core';

import { resolveWeaponTypeConstant, type WeaponTypeRecord } from './weapon_type.ts';

type WeaponRecord = Extract<WeaponTypeRecord, { readonly category: 'weapon' }>;

const weaponType = {
  id: 1n,
  part: '한손검',
  normalizedPart: '한손검',
  category: 'weapon',
  handType: 'oneHanded',
  classGroupKeys: ['warrior'],
  availabilityMode: 'class_groups',
  allowedJobIds: [],
  isDedicated: false,
  weaponConstant: 1.24,
  heroWeaponConstant: 1.34,
  attackSpeed: 5,
} as const satisfies WeaponRecord;

assert.equal(resolveWeaponTypeConstant(weaponType, finalClassNameKeyMap['팔라딘']), 1.24);
assert.equal(resolveWeaponTypeConstant(weaponType, finalClassNameKeyMap['히어로']), 1.34);
assert.equal(resolveWeaponTypeConstant({ ...weaponType, heroWeaponConstant: null }, finalClassNameKeyMap['히어로']), 1.24);
