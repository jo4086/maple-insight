import type { AllClassName, ClassGroup } from '@maple/data-core';

import {
  armorTypes,
  accessoryTypes,
  etcTypes,
  mechanicTypes,
  dragonTypes,
  equipmentTypes,
  equipmentCategories,
  weaponTypes,
  oneHandedWeaponTypes,
  twoHandedWeaponTypes,
  weaponHandTypes,
} from './equipment';
import { equipmentSets } from './set';
import { subWeaponTypes, warriorFinalClasses } from './sub-weapon';

export * from './equipment';
export * from './set';
export * from './sub-weapon';

export type WeaponHandType = (typeof weaponHandTypes)[number];
export type WeaponType = (typeof weaponTypes)[number];
export type OneHandedWeaponType = (typeof oneHandedWeaponTypes)[number];
export type TwoHandedWeaponType = (typeof twoHandedWeaponTypes)[number];

export type SubWeaponType = (typeof subWeaponTypes)[number];
export type WarriorFinalClass = (typeof warriorFinalClasses)[number];

export type ArmorType = (typeof armorTypes)[number];
export type AccessoryType = (typeof accessoryTypes)[number];
export type EtcType = (typeof etcTypes)[number];
export type MechanicType = (typeof mechanicTypes)[number];
export type DragonType = (typeof dragonTypes)[number];
export type EquipmentType = (typeof equipmentTypes)[number];
export type EquipmentCategory = (typeof equipmentCategories)[number];

export type EquipmentSet = (typeof equipmentSets)[number];

export const commonEquipmentRequiredClass = '공용' as const;

/** 장비 착용 가능 직업/직업군 */
export type EquipmentRequiredClass = AllClassName | ClassGroup | typeof commonEquipmentRequiredClass;

/** 아이템 스탯 옵션 */
export interface EquipmentOption {
  /** 힘 */
  str: number;
  /** 민첩 */
  dex: number;
  /** 지력 */
  int: number;
  /** 행운 */
  luk: number;
  /** HP */
  maxHp: number;
  /** MP */
  maxMp: number;
  /** DF */
  maxDf: number;
  /** HP (%) */
  maxHpRate: number;
  /** MP (%) */
  maxMpRate: number;
  /** 공격력 */
  attackPower: number;
  /** 마력 */
  magicPower: number;
  /** 방어력 */
  armor: number;
  /** 이동속도 */
  speed: number;
  /** 점프력 */
  jump: number;
  /** 보스 몬스터 데미지 (%) */
  bossDamage: number;
  /** 몬스터 방어율 무시 (%) */
  ignoreMonsterArmor: number;
  /** 올스탯 (%) */
  allStat: number;
  /** 데미지 (%) */
  damage: number;
  /** 장착 장비 레벨 감소 */
  equipmentLevelDecrease: number;
}
