import type { ClassGroupKey } from '@maple/data-core';

import { subWeaponPartLabelMap, weaponTypeLabelMap as weaponTypeLabelMapFromRule } from '@/rule/weapon';
import {
  equipmentTypes,
  type AccessoryType,
  type ArmorType,
  type DragonType,
  type EquipmentCategory,
  type EquipmentType,
  type EquipmentSet,
  type EtcType,
  type MechanicType,
  type SubWeaponType,
  type WeaponHandType,
  type WeaponType,
} from '@/types';

export const weaponHandTypeLabelMap = {
  oneHanded: '한손',
  twoHanded: '두손',
} as const satisfies Record<WeaponHandType, string>;

export type WeaponHandTypeLabel = (typeof weaponHandTypeLabelMap)[WeaponHandType];

export const armorTypeLabelMap = {
  hat: '모자',
  top: '상의',
  bottom: '하의',
  overall: '한벌옷',
  cape: '망토',
  gloves: '장갑',
  shoes: '신발',
} as const satisfies Record<ArmorType, string>;

export const accessoryTypeLabelMap = {
  shoulder: '어깨장식',
  face: '얼굴장식',
  eye: '눈장식',
  earring: '귀고리',
  pendant: '목걸이',
  powerSource: '파워소스',
  pocket: '포켓 아이템',
  emblem: '엠블렘',
  badge: '뱃지',
  ring: '반지',
  belt: '벨트',
  medal: '훈장',
} as const satisfies Record<AccessoryType, string>;

export const etcTypeLabelMap = {
  title: '칭호',
  android: '안드로이드',
  androidHeart: '기계심장',
} as const satisfies Record<EtcType, string>;

export const weaponTypeLabelMap = {
  ...weaponTypeLabelMapFromRule,
} as const satisfies Record<WeaponType, string>;

export const mechanicTypeLabelMap = {
  mechanicLeg: '레그',
  mechanicFrame: '프레임',
  mechanicArm: '암',
  mechanicTransistor: '트랜지스터',
  mechanicEngine: '엔진',
} as const satisfies Record<MechanicType, string>;

export const dragonTypeLabelMap = {
  dragonHat: '드래곤 모자',
  dragonWing: '날개장식',
  dragonTail: '꼬리장식',
  dragonPendant: '드래곤 펜던트',
} as const satisfies Record<DragonType, string>;

export const equipmentTypeLabelMap = {
  ...armorTypeLabelMap,
  ...accessoryTypeLabelMap,
  ...etcTypeLabelMap,
  ...weaponTypeLabelMap,
  ...mechanicTypeLabelMap,
  ...dragonTypeLabelMap,
} as const satisfies Record<EquipmentType, string>;

export type EquipmentTypeLabel = (typeof equipmentTypeLabelMap)[EquipmentType];

export const equipmentPartLabelMap = {
  ...equipmentTypeLabelMap,
  ...subWeaponPartLabelMap,
} as const satisfies Record<EquipmentType | SubWeaponType, string>;

export type EquipmentPartLabel = (typeof equipmentPartLabelMap)[EquipmentType | SubWeaponType];

export const equipmentTypeLabels = equipmentTypes.map((type) => equipmentTypeLabelMap[type]) as EquipmentTypeLabel[];

export const equipmentCategoryLabelMap = {
  armor: '방어구',
  accessory: '장신구',
  weapon: '무기',
  subWeapon: '보조무기',
  mechanical: '메카닉 장비',
  dragon: '드래곤 장비',
  emblem: '엠블렘/파워소스',
  etc: '기타',
} as const satisfies Record<EquipmentCategory, string>;

export type EquipmentCategoryLabel = (typeof equipmentCategoryLabelMap)[EquipmentCategory];

export const equipmentSetLabelMap = {
  cygnusEmpress: '시그너스 여제',
  rootAbyss: '루타비스',
  absolabs: '앱솔랩스',
  challenger: '도전자의 장비',
  arcaneShade: '아케인셰이드',
  eternal: '에테르넬',
  darkBoss: '칠흑의 보스',
  bossAccessory: '보스 장신구',
  dawnBoss: '여명의 보스',
  brilliantBoss: '광휘의 보스',
  meister: '마이스터',
  sevenDay: '칠요',
} as const satisfies Record<EquipmentSet, string>;

export type EquipmentSetLabel = (typeof equipmentSetLabelMap)[EquipmentSet];

export const cygnusEmpressSetNameMap = {
  warrior: '라이온하트 세트',
  mage: '드래곤테일 세트',
  archer: '팔콘윙 세트',
  thief: '레이븐혼 세트',
  pirate: '샤크투스 세트',
} as const satisfies Record<ClassGroupKey, string>;
