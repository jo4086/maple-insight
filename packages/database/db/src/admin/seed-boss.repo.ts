import { bossSpecJson } from '@maple/game-data';

import { prisma } from '@/lib/prisma';

type SeedBossPhaseValue = bigint | Record<string, bigint>;
type SeedBossDefenseRateValue = number | Record<string, number>;

type SeedBossSpec = {
  name: string;
  difficulties: {
    difficulty: string;
    forceType: string;
    rewardMeso: number;
    timeLimitSeconds?: number;
    phases: {
      phase: number;
      level?: number;
      hp?: string | Record<string, string>;
      defenseRate?: SeedBossDefenseRateValue;
      timeLimitSeconds?: number;
      requiredForce?: number;
    }[];
    entryRequirement?: {
      level?: number;
      partySize?: 1 | 2 | 3 | 4 | 5 | 6;
    };
  }[];
};

type SeedBossSpecsResult = {
  bossDifficultyCount: number;
  bossPhaseCount: number;
  bossPhaseTargetCount: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeHp(value: string | Record<string, string> | undefined): SeedBossPhaseValue | undefined {
  if (value == null) {
    return undefined;
  }

  if (typeof value === 'string') {
    return BigInt(value);
  }

  return Object.fromEntries(Object.entries(value).map(([targetName, hp]) => [targetName, BigInt(hp)]));
}

export async function seedBossSpecs(): Promise<SeedBossSpecsResult> {
  const bossSpecs = bossSpecJson as SeedBossSpec[];

  return prisma.$transaction(async (tx) => {
    await tx.bossPhaseTarget.deleteMany();
    await tx.bossPhase.deleteMany();
    await tx.bossDifficulty.deleteMany();

    let bossDifficultyCount = 0;
    let bossPhaseCount = 0;
    let bossPhaseTargetCount = 0;

    for (const bossSpec of bossSpecs) {
      for (const difficultySpec of bossSpec.difficulties) {
        const bossDifficulty = await tx.bossDifficulty.create({
          data: {
            bossName: bossSpec.name,
            difficulty: difficultySpec.difficulty,
            forceType: difficultySpec.forceType,
            rewardMeso: BigInt(difficultySpec.rewardMeso),
            entryLevel: difficultySpec.entryRequirement?.level,
            partySize: difficultySpec.entryRequirement?.partySize,
            timeLimitSeconds: difficultySpec.timeLimitSeconds,
          },
        });

        bossDifficultyCount += 1;

        for (const phaseSpec of difficultySpec.phases) {
          const normalizedHp = normalizeHp(phaseSpec.hp);
          const phaseDefenseRate = phaseSpec.defenseRate;
          const phaseHasTargets = isRecord(normalizedHp) || isRecord(phaseDefenseRate);

          const bossPhase = await tx.bossPhase.create({
            data: {
              bossDifficultyId: bossDifficulty.id,
              phase: phaseSpec.phase,
              level: phaseSpec.level,
              requiredForce: phaseSpec.requiredForce,
              hp: typeof normalizedHp === 'bigint' ? normalizedHp : undefined,
              defenseRate: typeof phaseDefenseRate === 'number' ? phaseDefenseRate : undefined,
              timeLimitSeconds: phaseSpec.timeLimitSeconds,
            },
          });

          bossPhaseCount += 1;

          if (!phaseHasTargets) {
            continue;
          }

          const hpTargets = isRecord(normalizedHp) ? normalizedHp : {};
          const defenseTargets = isRecord(phaseDefenseRate) ? phaseDefenseRate : {};
          const targetNames = new Set([...Object.keys(hpTargets), ...Object.keys(defenseTargets)]);

          for (const targetName of targetNames) {
            const hp = hpTargets[targetName];
            const defenseRate = defenseTargets[targetName];

            await tx.bossPhaseTarget.create({
              data: {
                bossPhaseId: bossPhase.id,
                targetName,
                level: phaseSpec.level,
                requiredForce: phaseSpec.requiredForce,
                hp: typeof hp === 'bigint' ? hp : undefined,
                defenseRate:
                  typeof defenseRate === 'number'
                    ? defenseRate
                    : typeof phaseDefenseRate === 'number'
                      ? phaseDefenseRate
                      : undefined,
              },
            });

            bossPhaseTargetCount += 1;
          }
        }
      }
    }

    return {
      bossDifficultyCount,
      bossPhaseCount,
      bossPhaseTargetCount,
    };
  });
}
