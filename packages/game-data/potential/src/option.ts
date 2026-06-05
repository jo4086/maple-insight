import type { InputStatKey } from '@maple/data-core';

import type { PotentialOptionKey, PotentialSpecialOptionKey } from './types';

export const weaponPotentialCustomStatKeys = [
  'boss-damage',
  'attack-power-rate',
  'magic-power-rate',
  'ignore-monster-armor',
  'damage',
  'critical-rate',
  'attack-power',
  'magic-power',
] as const satisfies readonly InputStatKey[];

export const potentialSpecialOptionKeys = [
  'attack-trigger-hp-recovery',
  'attack-trigger-mp-recovery',
  'attack-trigger-debuff-poison',
  'attack-trigger-debuff-stun',
  'attack-trigger-debuff-slow',
  'attack-trigger-debuff-darkness',
  'attack-trigger-debuff-freeze',
  'attack-trigger-debuff-seal',
] as const satisfies readonly PotentialSpecialOptionKey[];

export const potentialSpecialOptionLabelMap = {
  'attack-trigger-hp-recovery': '공격 시 HP 회복',
  'attack-trigger-mp-recovery': '공격 시 MP 회복',
  'attack-trigger-debuff-poison': '공격 시 중독 적용',
  'attack-trigger-debuff-stun': '공격 시 기절 적용',
  'attack-trigger-debuff-slow': '공격 시 슬로우 적용',
  'attack-trigger-debuff-darkness': '공격 시 암흑 적용',
  'attack-trigger-debuff-freeze': '공격 시 빙결 적용',
  'attack-trigger-debuff-seal': '공격 시 봉인 적용',
} as const satisfies Record<PotentialSpecialOptionKey, string>;

export const blackCubeWeaponRollableOptionKeys = [
  'str',
  'dex',
  'int',
  'luk',
  'max-hp',
  'max-mp',
  'attack-power',
  'magic-power',
  'str-rate',
  'dex-rate',
  'int-rate',
  'luk-rate',
  'max-hp-rate',
  'max-mp-rate',
  'attack-power-rate',
  'magic-power-rate',
  'critical-rate',
  'damage',
  'all-stat',
  'all-stat-rate',
  'ignore-monster-armor',
  'boss-damage',
  ...potentialSpecialOptionKeys,
] as const satisfies readonly PotentialOptionKey[];
