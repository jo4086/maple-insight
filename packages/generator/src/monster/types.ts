import type { BossName, BossSpec } from '@maple/data-monster';

export type GeneratedBossSpec = BossSpec;
export type GeneratedBossSpecMap = Partial<Record<BossName, BossSpec>>;
