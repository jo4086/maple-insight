import type { PotentialOption, PotentialGrade, CubeType } from '@/types';
import type { PotentialOptionScope } from '@/types/option';

type PotentialGradeMap = Partial<Record<PotentialOption, readonly PotentialGrade[]>>;
type PotentialScopedGradeMap = Partial<Record<PotentialOptionScope, Partial<Record<PotentialOption, readonly PotentialGrade[]>>>>;
type PotentialScopedFixedValueMap = Partial<Record<PotentialOptionScope, Partial<Record<PotentialGrade, Partial<Record<PotentialOption, number>>>>>>;
type PotentialValueCandidate = {
  value: number;
  rate: number;
};
type PotentialScopedValueCandidateMap = Partial<
  Record<PotentialOptionScope, Partial<Record<PotentialGrade, Partial<Record<PotentialOption, readonly PotentialValueCandidate[]>>>>>
>;

export const potentialGradeMap = {
  'all-stat': ['rare'],
  'all-stat-rate': ['epic', 'unique', 'legendary'],
  'attack-power': ['normal', 'rare'],
  'magic-power': ['normal', 'rare'],
  'attack-power-rate': ['epic', 'unique', 'legendary'],
  'magic-power-rate': ['epic', 'unique', 'legendary'],
  'attack-trigger-debuff-darkness': ['rare'],
  'attack-trigger-debuff-freeze': ['rare'],
  'attack-trigger-debuff-poison': ['rare'],
  'attack-trigger-debuff-seal': ['rare'],
  'attack-trigger-debuff-slow': ['rare'],
  'attack-trigger-debuff-stun': ['rare'],
  'attack-trigger-hp-recovery': ['rare', 'epic'],
  'attack-trigger-mp-recovery': ['rare', 'epic'],
  damage: ['rare', 'epic', 'unique', 'legendary'],
  'boss-damage': ['unique', 'legendary'],
  'critical-rate': ['rare', 'epic', 'unique', 'legendary'],
  str: ['normal', 'rare'],
  dex: ['normal', 'rare'],
  int: ['normal', 'rare'],
  luk: ['normal', 'rare'],
  'str-rate': ['rare', 'epic', 'unique', 'legendary'],
  'dex-rate': ['rare', 'epic', 'unique', 'legendary'],
  'int-rate': ['rare', 'epic', 'unique', 'legendary'],
  'luk-rate': ['rare', 'epic', 'unique', 'legendary'],
  'ignore-monster-armor': ['rare', 'epic', 'unique', 'legendary'],
  'max-hp': ['normal', 'rare'],
  'max-mp': ['normal', 'rare'],
  'max-hp-rate': ['rare', 'epic', 'unique', 'legendary'],
  'max-mp-rate': ['rare', 'epic', 'unique', 'legendary'],
  armor: ['normal', 'rare'],
  'armor-rate': ['rare', 'epic'],
  'recovery-efficiency-increase': ['unique', 'legendary'],

  'damaged-trigger-emotion': ['rare'],
  'skill-cooldown-reduction': ['legendary'],
  'post-damage-invincibility-duration': ['epic', 'unique', 'legendary'],
  'damaged-trigger-invincibility': ['unique', 'legendary'],
  'damaged-trigger-flat-damage-ignore': ['epic'],
  'damaged-trigger-damage-rate-ignore': ['unique', 'legendary'],
  'damage-reflect': ['unique'],
  'attack-trigger-auto-steal': ['unique', 'legendary'],
  'critical-damage': ['legendary'],
  speed: ['normal', 'rare'],
  jump: ['normal', 'rare'],
  'tick-hp-recovery': ['rare'],
  'tick-mp-recovery': ['rare'],
  'drop-rate': ['legendary'],
  'meso-rate': ['legendary'],
  'skill-mp-cost-reduction': ['legendary'],
  'usable-mystic-door': ['unique'],
  'usable-advanced-bless': ['legendary'],
  'usable-hyper-body': ['unique'],
  'usable-sharp-eyes': ['unique'],
  'usable-wind-booster': ['legendary'],
  'usable-haste': ['unique'],
  'usable-combat-orders': ['legendary'],
} as const satisfies Partial<PotentialGradeMap>;

export const potentialScopedGradeMap = {
  weapon: {
    'attack-power': ['legendary'],
    'magic-power': ['legendary'],
  },
  gloves: {
    str: ['unique'],
    dex: ['unique'],
    int: ['unique'],
    luk: ['unique'],
  },
} as const satisfies PotentialScopedGradeMap;

export const potentialScopedFixedValueMap = {
  weapon: {
    legendary: {
      'attack-power': 32,
      'magic-power': 32,
    },
  },
  gloves: {
    unique: {
      str: 32,
      dex: 32,
      int: 32,
      luk: 32,
    },
  },
} as const satisfies PotentialScopedFixedValueMap;

export const potentialScopedValueCandidateMap = {
  hat: {
    legendary: {
      'skill-cooldown-reduction': [
        { value: 1, rate: 50 },
        { value: 2, rate: 50 },
      ],
    },
  },
} as const satisfies PotentialScopedValueCandidateMap;
