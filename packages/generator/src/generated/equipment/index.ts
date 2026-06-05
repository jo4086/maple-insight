import accessory from './accessory.json';
import armor from './armor.json';
import subWeapon from './subWeapon.json';
import weapon from './weapon.json';

export const generatedAccessoryEquipment = accessory;
export const generatedArmorEquipment = armor;
export const generatedSubWeaponEquipment = subWeapon;
export const generatedWeaponEquipment = weapon;

export const generatedEquipment = {
  accessory,
  armor,
  subWeapon,
  weapon,
} as const;
