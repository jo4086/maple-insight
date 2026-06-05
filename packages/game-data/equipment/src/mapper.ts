import { classGroupKeyMap } from '@maple/data-core';
import type { ClassGroup } from '@maple/data-core';

import { equipmentCategoryLabelMap, equipmentPartLabelMap, equipmentTypeLabelMap, weaponHandTypeLabelMap } from './label';
import { subWeaponPartLabelMap } from './rule/weapon';
import { equipmentSetDisplayNameRuleMap } from './rule';
import type { EquipmentCategory, EquipmentSet, EquipmentType, SubWeaponType, WeaponHandType } from './types';

export function mapEquipmentTypeLabel(type: EquipmentType | SubWeaponType, category?: EquipmentCategory) {
  if (category === 'subWeapon') {
    return subWeaponPartLabelMap[type as SubWeaponType] ?? equipmentPartLabelMap[type];
  }

  if (type in equipmentTypeLabelMap) {
    return equipmentTypeLabelMap[type as EquipmentType];
  }

  return equipmentPartLabelMap[type];
}

export function mapEquipmentCategoryLabel(category: EquipmentCategory) {
  return equipmentCategoryLabelMap[category];
}

export function mapWeaponHandTypeLabel(handType: WeaponHandType) {
  return weaponHandTypeLabelMap[handType];
}

export function mapEquipmentSetDisplayName(setKey: EquipmentSet, classGroup?: ClassGroup | null) {
  const rule = equipmentSetDisplayNameRuleMap[setKey];

  if (rule.type === 'fixed') {
    return rule.name;
  }

  if (rule.type === 'classGroupParenthesized') {
    return classGroup ? `${rule.name}(${classGroup})` : rule.name;
  }

  return classGroup ? rule.names[classGroupKeyMap[classGroup]] : null;
}

export function mapEquipmentType(type: EquipmentType) {
  return {
    type,
    label: mapEquipmentTypeLabel(type),
  };
}

export function mapEquipmentCategory(category: EquipmentCategory) {
  return {
    category,
    label: mapEquipmentCategoryLabel(category),
  };
}
