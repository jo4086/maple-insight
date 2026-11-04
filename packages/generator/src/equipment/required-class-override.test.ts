import assert from 'node:assert/strict';

import { createSubWeaponEquipmentJson, createWeaponEquipmentJson } from './item-json.ts';

const weapons = createWeaponEquipmentJson();
const inheritedWeapon = weapons.find((item) => !item.name.includes('('));
assert.ok(inheritedWeapon);
assert.equal(Object.hasOwn(inheritedWeapon, 'requiredClassOverride'), false);
assert.equal(JSON.stringify(inheritedWeapon).includes('"requiredClassOverride":null'), false);
assert.equal(weapons.some((item) => item.requiredClassOverride === null), false);

const heroWeapon = weapons.find((item) => item.name.endsWith('(히어로)'));
assert.ok(heroWeapon);
assert.equal(heroWeapon.requiredClass, '히어로');
assert.equal(heroWeapon.requiredClassOverride, '히어로');

const subWeapons = createSubWeaponEquipmentJson();
const inheritedSubWeapon = subWeapons.find((item) => item.name === '데이모스 세이지 실드');
assert.ok(inheritedSubWeapon);
assert.equal(inheritedSubWeapon.requiredClass, '마법사');
assert.equal(Object.hasOwn(inheritedSubWeapon, 'requiredClassOverride'), false);

const replacedSubWeapon = subWeapons.find((item) => item.name === '아스트라 세이크리드 이지스');
assert.ok(replacedSubWeapon);
assert.deepEqual(replacedSubWeapon.requiredClass, ['히어로', '팔라딘']);
assert.deepEqual(replacedSubWeapon.requiredClassOverride, ['히어로', '팔라딘']);
