import { dragonTypes, mechanicTypes } from '@/types';
import type { EquipmentType } from '@/types';

export type PotentialRuleEquipmentType = EquipmentType | 'subWeapon';

/**
 * 기본적으로 잠재능력이 존재하지 않는 장비 파츠다.
 *
 * 기계심장(`androidHeart`)은 안드로이드와 별개 장비로 잠재능력이 가능하므로
 * `android`만 비활성 파츠에 포함한다.
 */
export const potentialDisabledEquipmentTypes = [
  'title',
  'medal',
  'pocket',
  'badge',
  'android',
  ...mechanicTypes,
  ...dragonTypes,
] as const satisfies readonly PotentialRuleEquipmentType[];

type PotentialEquipmentRuleInput = {
  /** 장비 파츠 key */
  type: PotentialRuleEquipmentType;
  /** 아이템 이름. 추후 이름 기반 예외가 필요할 때 사용한다. */
  name: string;
};

export function isPotentialEnabledByEquipmentRule({ type }: PotentialEquipmentRuleInput) {
  const disabledTypes: readonly PotentialRuleEquipmentType[] = potentialDisabledEquipmentTypes;

  return !disabledTypes.includes(type);
}
