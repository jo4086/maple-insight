import {
  bossDefenseRateMap,
  type BossDifficulty,
  bossDifficultyMap,
  bossForceTypeMap,
  bossHpMap,
  bossMetaMap,
  bossNames,
  bossRewardMesoMap,
  type BossDifficultyMeta,
  type BossName,
  type BossPhaseDefenseRateValue,
  type BossPhaseHpValue,
  type BossSpec,
} from '@maple/data-monster';

import type { GeneratedBossSpecMap } from './types';

function toSortedPhaseNumbers(phaseNumbers: Iterable<number>): number[] {
  return [...new Set(phaseNumbers)].sort((left, right) => left - right);
}

function getPhaseNumbers<TBossName extends BossName>(
  bossName: TBossName,
  difficulty: BossDifficulty,
): number[] {
  const hpByPhase = (bossHpMap[bossName] as Partial<Record<BossDifficulty, Record<number, BossPhaseHpValue>>> | undefined)?.[difficulty];
  const defenseRateByPhase = (bossDefenseRateMap[bossName] as Partial<Record<BossDifficulty, Record<number, BossPhaseDefenseRateValue>>> | undefined)?.[difficulty];
  const phaseMetaByPhase = (bossMetaMap[bossName] as Partial<Record<BossDifficulty, BossDifficultyMeta>> | undefined)?.[difficulty]?.phases;

  return toSortedPhaseNumbers([
    ...Object.keys(hpByPhase ?? {}).map(Number),
    ...Object.keys(defenseRateByPhase ?? {}).map(Number),
    ...Object.keys(phaseMetaByPhase ?? {}).map(Number),
  ]);
}

function createDifficultySpec<TBossName extends BossName>(
  bossName: TBossName,
  difficulty: BossDifficulty,
): BossSpec<TBossName>['difficulties'][number] {
  const rewardMeso = (bossRewardMesoMap[bossName] as Partial<Record<BossDifficulty, number>> | undefined)?.[difficulty];
  const difficultyMeta = (bossMetaMap[bossName] as Partial<Record<BossDifficulty, BossDifficultyMeta>> | undefined)?.[difficulty];
  const hpByPhase = (bossHpMap[bossName] as Partial<Record<BossDifficulty, Record<number, BossPhaseHpValue>>> | undefined)?.[difficulty];
  const defenseRateByPhase = (bossDefenseRateMap[bossName] as Partial<Record<BossDifficulty, Record<number, BossPhaseDefenseRateValue>>> | undefined)?.[difficulty];
  const forceType = bossForceTypeMap[bossName];

  if (rewardMeso == null) {
    throw new Error(`missing boss reward meso: ${bossName} / ${difficulty}`);
  }

  if (!difficultyMeta) {
    throw new Error(`missing boss meta: ${bossName} / ${difficulty}`);
  }

  const phases = getPhaseNumbers(bossName, difficulty).map((phase) => {
    const phaseMeta = difficultyMeta.phases?.[phase];

    return {
      phase,
      level: phaseMeta?.level ?? difficultyMeta.level,
      hp: hpByPhase?.[phase],
      defenseRate: defenseRateByPhase?.[phase],
      requiredForce: phaseMeta?.requiredForce ?? difficultyMeta.requiredForce,
    };
  });

  if (phases.length === 0) {
    throw new Error(`missing boss phases: ${bossName} / ${difficulty}`);
  }

  return {
    difficulty,
    forceType,
    rewardMeso,
    timeLimitSeconds: difficultyMeta.timeLimitSeconds,
    phases,
    entryRequirement: {
      level: difficultyMeta.entryLevel,
      partySize: difficultyMeta.partySize ?? 1,
    },
  };
}

export function createBossSpec<TBossName extends BossName>(bossName: TBossName): BossSpec<TBossName> {
  const difficulties = (bossDifficultyMap[bossName] as readonly BossDifficulty[]).map((difficulty) =>
    createDifficultySpec(bossName, difficulty),
  );

  return {
    name: bossName,
    difficulties,
  };
}

export function createBossSpecs(): BossSpec[] {
  return bossNames.map((bossName) => createBossSpec(bossName));
}

export function createBossSpecMap(): GeneratedBossSpecMap {
  return Object.fromEntries(
    bossNames.map((bossName) => [bossName, createBossSpec(bossName)]),
  ) as GeneratedBossSpecMap;
}
