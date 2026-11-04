import assert from 'node:assert/strict';
import { test } from 'node:test';

import { assertGameDataBundleSeedVersion } from './seed-game-data-bundle.repo';

test('bundle preflight allows new and importing versions', () => {
  assert.doesNotThrow(() => assertGameDataBundleSeedVersion('1.2.3', null));
  assert.doesNotThrow(() => assertGameDataBundleSeedVersion('1.2.3', 'importing'));
});

test('bundle preflight rejects ready and other unsafe existing versions', () => {
  for (const status of ['ready', 'failed', 'copying', 'deleted']) {
    assert.throws(
      () => assertGameDataBundleSeedVersion('1.2.3', status),
      /refuses existing game data version/,
    );
  }
});
