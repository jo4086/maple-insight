import assert from 'node:assert/strict';

import { createWeaponMetaBuilder } from './builder.ts';

const dedicated = createWeaponMetaBuilder<'dedicated'>({ requiredLevel: 200 }).add('dedicated', 'desperado').doneStrict().dedicated;
assert.equal(dedicated.requiredClassOverride, '데몬어벤져');
assert.equal(dedicated.requiredClass, '데몬어벤져');

const inherited = createWeaponMetaBuilder<'inherited'>({ requiredLevel: 200 }).add('inherited', 'oneHandedSword').doneStrict().inherited;
assert.equal(Object.hasOwn(inherited, 'requiredClassOverride'), false);
assert.equal(inherited.requiredClass, '전사');

const common = createWeaponMetaBuilder<'common'>({ requiredLevel: 200 })
  .add('common', 'oneHandedSword', { requiredClassOverride: '공용' })
  .doneStrict().common;
assert.equal(common.requiredClassOverride, '공용');
assert.equal(common.requiredClass, '공용');

const classes = ['히어로', '팔라딘'] as const;
const replaced = createWeaponMetaBuilder<'replaced'>({ requiredLevel: 200 })
  .add('replaced', 'oneHandedSword', { requiredClassOverride: classes })
  .doneStrict().replaced;
assert.deepEqual(replaced.requiredClassOverride, classes);
assert.deepEqual(replaced.requiredClass, classes);
