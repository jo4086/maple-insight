export * from './weapon';
export * from './armor';
export * from './accessory';
export * from './etc-equipment';
export * from './option';

import type { AccessoryType } from './accessory';
import type { ArmorType } from './armor';
import type { EtcEquipmentType, MechanicEquipmentType, DragonEquipmentType } from './etc-equipment';
import type { MainWeaponType, SubWeaponType } from './weapon';

export type EquipmentType = MainWeaponType | SubWeaponType | ArmorType | AccessoryType | EtcEquipmentType | MechanicEquipmentType | DragonEquipmentType;
