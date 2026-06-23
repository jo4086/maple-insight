import type { EquipmentClassType, EquipmentStatOption } from '@maple/data-core';

export type EquipmentOption = Omit<EquipmentStatOption, 'equipmentLevelDecrease'>;

export type ClassType = Exclude<EquipmentClassType, '제논' | '공용'>;

export const commonParts = ['장갑', '신발', '망토', '어깨장식', '하의', '한벌옷'] as const;
export const classParts = ['모자', '상의'] as const;
export type CommonPart = (typeof commonParts)[number];
export type ClassPart = (typeof classParts)[number];
export type Part = CommonPart | ClassPart;

export interface Prefix {
  main: string;
  classPrefix: Record<ClassType, string>;
  commonPartName: Partial<Record<CommonPart, string>>;
  classPartName: Partial<Record<ClassPart, Record<ClassType, string>>>;
}

export interface BaseEquipmentTemplateOption {
  mainStat: number;
  subStat: number;
  otherStat: number;
  attackPower?: number;
  bothPowerFlag?: boolean;
  armor?: number;
  ignoreMonsterArmor?: number;
  bossDamage?: number;
  maxHp?: number;
  maxMp?: number;
  maxDf?: number;
  maxHpRate?: number;
  maxMpRate?: number;
  jump?: number;
  speed?: number;
}

export interface PrefixEquipmentTemplate extends BaseEquipmentTemplateOption {
  part: Part;
  baseLevel: number;
  classType: ClassType;
  setEffect: string | null;
}

export interface GeneratedEquipment extends EquipmentOption {
  id: string;
  name: string;
  part: string;
  category: string;
  classType: ClassType;
  setEffect: string | null;
}

export interface GenericEquipmentTemplate extends BaseEquipmentTemplateOption {
  part: string;
  name: string;
  classType: ClassType;
  setEffect: string | null;
}
