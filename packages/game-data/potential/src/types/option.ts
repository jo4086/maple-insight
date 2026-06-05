import type { InputStatKey } from '@maple/data-core';

export const weaponPotentialBaseOptions = [
  'ignore-monster-armor',
  'attack-power-rate',
  'magic-power-rate',
  'boss-damage',
  'damage',
  'critical-rate',
  'attack-power',
  'magic-power',
] as const satisfies readonly InputStatKey[];

export const commonPotentialBaseOptions = [
  'str',
  'dex',
  'int',
  'luk',
  'str-rate',
  'dex-rate',
  'int-rate',
  'luk-rate',
  'all-stat',
  'all-stat-rate',
  'max-hp',
  'max-mp',
  'max-hp-rate',
  'max-mp-rate',
] as const satisfies readonly InputStatKey[];

export const potentialSpecialOptions = [
  'recovery-efficiency-increase',
  'attack-trigger-hp-recovery',
  'attack-trigger-mp-recovery',
  'attack-trigger-debuff-poison',
  'attack-trigger-debuff-stun',
  'attack-trigger-debuff-darkness',
  'attack-trigger-debuff-slow',
  'attack-trigger-debuff-freeze',
  'attack-trigger-debuff-seal',
  'damaged-trigger-emotion',
  'skill-cooldown-reduction',
  'post-damage-invincibility-duration',
  'damaged-trigger-invincibility',
  'damaged-trigger-flat-damage-ignore',
  'damaged-trigger-damage-rate-ignore',
  'damage-reflect',
  'attack-trigger-auto-steal',
  'tick-hp-recovery',
  'tick-mp-recovery',
  'skill-mp-cost-reduction',
  'usable-mystic-door',
  'usable-advanced-bless',
  'usable-hyper-body',
  'usable-sharp-eyes',
  'usable-wind-booster',
  'usable-haste',
  'usable-combat-orders',
] as const;

export const potentialOptionScopes = [
  'weapon',
  'excludeWeapon',
  'hat',
  'top',
  'bottom',
  'overall',
  'gloves',
  'shoes',
  'accessory',
  'dropMesoAccessory',
  'belt',
  'shoulder',
  'subWeapon',
  'armor',
] as const;

/** 메소/드랍 잠재가 붙는 장신구: 반지, 귀고리, 펜던트, 얼굴장식, 눈장식 */
export const dropMesoPotentialAccessoryParts = ['ring', 'earring', 'pendant', 'face', 'eye'] as const;

export type PotentialSpecialOption = (typeof potentialSpecialOptions)[number];
export type PotentialOption = InputStatKey | PotentialSpecialOption;
export type PotentialOptionScope = (typeof potentialOptionScopes)[number];

export const weaponPotentialOptions = [...weaponPotentialBaseOptions, ...commonPotentialBaseOptions] as const;

export const excludeWeaponPotentialOptions = [...commonPotentialBaseOptions, 'armor', 'armor-rate', 'recovery-efficiency-increase'] as const;

export const potentialScopedOptionMap = {
  armor: ['excludeWeapon'],
  'armor-rate': ['excludeWeapon'],
  'recovery-efficiency-increase': ['excludeWeapon'],

  'attack-trigger-hp-recovery': ['weapon'],
  'attack-trigger-mp-recovery': ['weapon'],
  'attack-trigger-debuff-poison': ['weapon'],
  'attack-trigger-debuff-stun': ['weapon'],
  'attack-trigger-debuff-darkness': ['weapon'],
  'attack-trigger-debuff-slow': ['weapon'],
  'attack-trigger-debuff-freeze': ['weapon'],
  'attack-trigger-debuff-seal': ['weapon'],

  'damaged-trigger-emotion': ['hat'],
  'skill-cooldown-reduction': ['hat'],

  'post-damage-invincibility-duration': ['top', 'overall'],
  'damaged-trigger-invincibility': ['top', 'overall'],

  'damaged-trigger-flat-damage-ignore': ['subWeapon', 'armor', 'belt', 'shoulder'],
  'damaged-trigger-damage-rate-ignore': ['armor'],

  'damage-reflect': ['top', 'bottom', 'overall'],
  'attack-trigger-auto-steal': ['gloves'],
  'critical-damage': ['gloves'],

  speed: ['shoes'],
  jump: ['shoes'],

  'tick-hp-recovery': ['accessory'],
  'tick-mp-recovery': ['accessory'],
  'drop-rate': ['dropMesoAccessory'],
  'meso-rate': ['dropMesoAccessory'],
  'skill-mp-cost-reduction': ['accessory'],

  'usable-mystic-door': ['hat'],
  'usable-advanced-bless': ['hat'],
  'usable-hyper-body': ['bottom'],
  'usable-sharp-eyes': ['gloves'],
  'usable-wind-booster': ['gloves'],
  'usable-haste': ['shoes'],
  'usable-combat-orders': ['shoes'],
} as const satisfies Partial<Record<PotentialOption, readonly PotentialOptionScope[]>>;

export type WeaponPotentialOption = (typeof weaponPotentialOptions)[number];
export type ExcludeWeaponPotentialOption = (typeof excludeWeaponPotentialOptions)[number];
