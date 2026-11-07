import assert from 'node:assert/strict';
import test from 'node:test';

import { classifyJobId } from './job-id-classifier';

function expectJob(jobId: string) {
  const result = classifyJobId(jobId);
  assert.equal(result.kind, 'job');
  return result;
}

test('classifies canonical and zero-padded jobs without changing original IDs', () => {
  const novice = expectJob('0');
  assert.equal(novice.jobId, '0');
  assert.equal(novice.normalizedJobId, '00000');
  assert.equal(novice.classGroup, 'novice');
  assert.equal(novice.stage, 0);
  assert.equal(novice.ambiguous, false);

  const warrior = expectJob('100');
  assert.equal(warrior.normalizedJobId, '00100');
  assert.equal(warrior.classGroup, 'warrior');
  assert.equal(warrior.stage, 1);

  const cygnus = expectJob('1000');
  assert.equal(cygnus.prefixLabel, '시그너스 기사단');
  assert.equal(cygnus.classGroup, 'novice');

  const padded = expectJob('00100');
  assert.equal(padded.jobId, '00100');
  assert.equal(padded.normalizedJobId, '00100');
});

test('keeps all shared branches without marking identical class names and stages ambiguous', () => {
  const novice = expectJob('000');
  assert.ok(novice.matches.length > 1);
  assert.ok(novice.matches.every(({ className, stage }) => className === '초보자' && stage === 0));
  assert.equal(novice.ambiguous, false);

  const warrior = expectJob('100');
  assert.ok(warrior.matches.length > 1);
  assert.ok(warrior.matches.every(({ className, stage }) => className === '검사' && stage === 1));
  assert.equal(warrior.ambiguous, false);
});

test('uses explicit class and stage exceptions', () => {
  const luminous = expectJob('2700');
  assert.equal(luminous.classGroup, 'mage');
  assert.equal(luminous.stage, 1);
  assert.equal(luminous.explicitException, true);

  const evanStages = [
    ['2200', 1],
    ['2211', 2],
    ['2214', 3],
    ['2217', 4],
    ['2220', 6],
  ] as const;
  for (const [jobId, stage] of evanStages) {
    const evan = expectJob(jobId);
    assert.equal(evan.stage, stage);
    assert.equal(evan.explicitException, true);
    assert.equal(evan.branch, undefined);
  }

  const dualBlade15 = expectJob('430');
  assert.equal(dualBlade15.stage, 1.5);
  assert.equal(dualBlade15.explicitException, true);
  const dualBlade25 = expectJob('432');
  assert.equal(dualBlade25.stage, 2.5);
  assert.equal(dualBlade25.branch, 3);
  assert.equal(dualBlade25.explicitException, true);
});

test('reports shared and dual-class registry entries without choosing a final job', () => {
  const demon = expectJob('3001');
  assert.equal(demon.ambiguous, true);
  assert.deepEqual(
    demon.matches.map(({ classKey }) => classKey),
    ['demon-slayer', 'demon-avenger'],
  );
  assert.equal(demon.explicitException, true);

  const xenon = expectJob('3612');
  assert.deepEqual(xenon.classGroup, ['thief', 'pirate']);
  assert.equal(xenon.stage, 4);
  assert.equal(xenon.explicitException, true);
});

test('separates retired, dummy, unknown, skill group, system, and invalid IDs', () => {
  for (const jobId of ['2210', '2212', '2213', '2215', '2216', '2218', '7000', '9999']) {
    assert.equal(classifyJobId(jobId).kind, 'dummy');
  }

  assert.equal(classifyJobId('30000').kind, 'unknown');
  assert.equal(classifyJobId('19000').kind, 'unknown');
  assert.equal(classifyJobId('40006').kind, 'unknown');
  assert.equal(classifyJobId('50001').kind, 'unknown');

  for (const jobId of ['40000', '40001', '40002', '40003', '40004', '40005', '50000', '50006', '50007']) {
    const result = classifyJobId(jobId);
    assert.equal(result.kind, 'skillGroup');
    assert.equal(result.jobId, jobId);
    assert.equal(result.normalizedJobId, jobId);
  }

  assert.deepEqual(classifyJobId('123456'), { kind: 'system', jobId: '123456' });
  assert.deepEqual(classifyJobId('1234567'), { kind: 'invalid', jobId: '1234567' });
  assert.deepEqual(classifyJobId('12x'), { kind: 'invalid', jobId: '12x' });
  assert.deepEqual(classifyJobId(''), { kind: 'invalid', jobId: '' });
});
