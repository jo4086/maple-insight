import assert from 'node:assert/strict';

import { createSubWeaponMetaBuilder } from './builder.ts';

const items = createSubWeaponMetaBuilder<'inherited' | 'replaced'>({
  part: 'shield',
  requiredClass: '공용',
})
  .add('inherited')
  .add('replaced', { requiredClass: ['히어로', '팔라딘'] })
  .doneStrict();

assert.equal(Object.hasOwn(items.inherited, 'requiredClassOverride'), false);
assert.equal(items.inherited.requiredClass, '공용');
assert.deepEqual(items.replaced.requiredClassOverride, ['히어로', '팔라딘']);
assert.deepEqual(items.replaced.requiredClass, ['히어로', '팔라딘']);
