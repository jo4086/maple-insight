import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveEffectiveEquipmentAvailability } from './weapon-type-availability';

const warriorType = {
  availabilityMode: 'class_groups',
  classGroupKeys: ['warrior'],
  allowedJobIds: [],
} as const;

test('linked item with null override inherits canonical weapon type availability', () => {
  assert.deepEqual(resolveEffectiveEquipmentAvailability({
    weaponType: warriorType,
    requiredClassOverride: null,
    legacyRequiredClass: '전사',
  }), {
    source: 'weapon_type', mode: 'class_groups', classGroupKeys: ['warrior'], allowedJobIds: [],
  });
});

test('Korean item override remains exact full replacement', () => {
  assert.deepEqual(resolveEffectiveEquipmentAvailability({
    weaponType: warriorType,
    requiredClassOverride: '전사',
    legacyRequiredClass: '전사',
  }), { source: 'item_override', requiredClass: '전사' });

  assert.deepEqual(resolveEffectiveEquipmentAvailability({
    weaponType: warriorType,
    requiredClassOverride: ['히어로', '팔라딘'],
    legacyRequiredClass: ['히어로', '팔라딘'],
  }), { source: 'item_override', requiredClass: ['히어로', '팔라딘'] });
});

test('explicit common override remains common', () => {
  assert.deepEqual(resolveEffectiveEquipmentAvailability({
    weaponType: warriorType,
    requiredClassOverride: '공용',
    legacyRequiredClass: '공용',
  }), {
    source: 'item_override', mode: 'common', classGroupKeys: [], allowedJobIds: [],
  });
});

test('validated class group keys remain canonical', () => {
  assert.deepEqual(resolveEffectiveEquipmentAvailability({
    weaponType: warriorType,
    requiredClassOverride: ['mage'],
    legacyRequiredClass: '마법사',
  }), {
    source: 'item_override', mode: 'class_groups', classGroupKeys: ['mage'], allowedJobIds: [],
  });
});

test('unvalidated strings are not classified as job IDs', () => {
  assert.deepEqual(resolveEffectiveEquipmentAvailability({
    weaponType: warriorType,
    requiredClassOverride: ['100', '101'],
    legacyRequiredClass: ['히어로', '팔라딘'],
  }), { source: 'item_override', requiredClass: ['100', '101'] });
});

test('unlinked item preserves legacy requiredClass', () => {
  const requiredClass = ['전사', '궁수'];
  assert.deepEqual(resolveEffectiveEquipmentAvailability({
    weaponType: null,
    requiredClassOverride: null,
    legacyRequiredClass: requiredClass,
  }), { source: 'legacy', requiredClass });
});

test('invalid override contents are rejected', () => {
  assert.throws(() => resolveEffectiveEquipmentAvailability({
    weaponType: warriorType,
    requiredClassOverride: ['전사', ''],
    legacyRequiredClass: '전사',
  }), /Invalid requiredClassOverride/);
  assert.throws(() => resolveEffectiveEquipmentAvailability({
    weaponType: warriorType,
    requiredClassOverride: ['공용'],
    legacyRequiredClass: '공용',
  }), /Invalid requiredClassOverride/);
});
