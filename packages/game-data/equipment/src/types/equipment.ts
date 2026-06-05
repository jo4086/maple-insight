export const oneHandedWeaponTypes = [
  'oneHandedSword',
  'oneHandedAxe',
  'oneHandedBluntWeapon',
  'desperado',
  'tuner',
  'longSword',
  'wand',
  'staff',
  'shiningRod',
  'espLimiter',
  'magicGauntlet',
  'breathShooter',
  'dagger',
  'cane',
  'chain',
  'fan',
  'energySword',
  'soulShooter',
] as const;

export const twoHandedWeaponTypes = [
  'twoHandedSword',
  'twoHandedAxe',
  'twoHandedBluntWeapon',
  'spear',
  'polearm',
  'gauntletRevolver',
  'katana',
  'greatSword',
  'bow',
  'crossbow',
  'dualBowguns',
  'ancientBow',
  'claw',
  'chakram',
  'gun',
  'knuckle',
  'handCannon',
] as const;
export const weaponTypes = [...oneHandedWeaponTypes, ...twoHandedWeaponTypes] as const;

export const weaponHandTypes = ['oneHanded', 'twoHanded'] as const;

export const armorTypes = ['hat', 'top', 'bottom', 'overall', 'cape', 'gloves', 'shoes'] as const;
export const accessoryTypes = ['shoulder', 'face', 'eye', 'earring', 'pendant', 'powerSource', 'pocket', 'emblem', 'badge', 'ring', 'belt', 'medal'] as const;
export const etcTypes = ['title', 'android', 'androidHeart'] as const;
export const mechanicTypes = ['mechanicLeg', 'mechanicFrame', 'mechanicArm', 'mechanicTransistor', 'mechanicEngine'] as const;
export const dragonTypes = ['dragonHat', 'dragonWing', 'dragonTail', 'dragonPendant'] as const;

export const equipmentTypes = [...armorTypes, ...accessoryTypes, ...etcTypes, ...weaponTypes, ...mechanicTypes, ...dragonTypes] as const;

export const equipmentCategories = ['armor', 'accessory', 'weapon', 'subWeapon', 'mechanical', 'dragon', 'emblem', 'etc'] as const;
