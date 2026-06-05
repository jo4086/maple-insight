import type { BossPhaseDefenseRateValue } from './boss-defense-rate';
import type { BossDifficultyOf } from './boss-difficulty';
import type { BossForceType } from './boss-force';
import type { BossPhaseHpValue } from './boss-hp';
import type { BossName } from './boss-name';

export type BossHp = bigint;

export type BossPhaseSpec = {
  phase: number;
  level?: number;
  hp?: BossPhaseHpValue;
  defenseRate?: BossPhaseDefenseRateValue;
  timeLimitSeconds?: number;
  requiredForce?: number;
};

export type BossDifficultySpec<TBossName extends BossName> = {
  difficulty: BossDifficultyOf<TBossName>;
  forceType: BossForceType;
  rewardMeso: number;
  timeLimitSeconds?: number;
  phases: BossPhaseSpec[];
  entryRequirement?: {
    level?: number;
    partySize: 1 | 2 | 3 | 4 | 5 | 6;
  };
};

export type BossSpec<TBossName extends BossName = BossName> = {
  name: TBossName;
  difficulties: BossDifficultySpec<TBossName>[];
};
