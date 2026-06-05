import {
  createEquipmentCapabilityRuleBuilder,
  resolveEquipmentCapability,
  type EquipmentCapability,
  type EquipmentCapabilityOverride,
  type EquipmentCapabilityRuleType,
} from './builder';

import { equipmentTypes } from '@/types';

export const enabledEquipmentCapability = {
  potentialEnabled: true,
  starforceEnabled: true,
  scrollUpgradeEnabled: true,
  addOptionEnabled: true,
} as const satisfies EquipmentCapability;

export const disabledEquipmentCapability = {
  potentialEnabled: false,
  starforceEnabled: false,
  scrollUpgradeEnabled: false,
  addOptionEnabled: false,
} as const satisfies EquipmentCapability;

/**
 * 장비 파츠별 기본 capability 규칙이다.
 * 아이템 이름 단위 예외는 각 아이템 입력 builder에서 `capability`로 override한다.
 */
export const equipmentCapabilityRule = createEquipmentCapabilityRuleBuilder([...equipmentTypes, 'subWeapon'] as const)
  .part('title', disabledEquipmentCapability)
  .part('medal', disabledEquipmentCapability)
  .part('badge', disabledEquipmentCapability)
  .part('pocket', disabledEquipmentCapability)
  .part('android', disabledEquipmentCapability)
  .part('emblem', {
    ...disabledEquipmentCapability,
    potentialEnabled: true,
  })
  .part('mechanicLeg', disabledEquipmentCapability)
  .part('mechanicFrame', disabledEquipmentCapability)
  .part('mechanicArm', disabledEquipmentCapability)
  .part('mechanicTransistor', disabledEquipmentCapability)
  .part('mechanicEngine', disabledEquipmentCapability)
  .part('dragonHat', disabledEquipmentCapability)
  .part('dragonWing', disabledEquipmentCapability)
  .part('dragonTail', disabledEquipmentCapability)
  .part('dragonPendant', disabledEquipmentCapability)
  .part('subWeapon', {
    ...enabledEquipmentCapability,
    starforceEnabled: false,
    scrollUpgradeEnabled: false,
    addOptionEnabled: false,
  })
  .done();

export function resolveEquipmentCapabilityByRule(input: { part: EquipmentCapabilityRuleType; name: string; override?: EquipmentCapabilityOverride }): EquipmentCapability {
  return resolveEquipmentCapability(equipmentCapabilityRule, input, enabledEquipmentCapability);
}
