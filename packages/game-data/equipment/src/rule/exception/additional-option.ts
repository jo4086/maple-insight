import { dragonTypes, mechanicTypes } from '@/types';
import type { EquipmentType } from '@/types';

export type AdditionalOptionRuleEquipmentType = EquipmentType | 'subWeapon';

/**
 * 기본적으로 추가 옵션(추옵)이 존재하지 않는 장비 파츠다.
 *
 * 현재는 명확한 예외인 메카닉 장비와 드래곤 장비만 비활성으로 둔다.
 * 다른 파츠의 세부 예외는 장비 데이터가 확정될 때 이 규칙에 추가한다.
 */
export const additionalOptionDisabledEquipmentTypes = [
  ...mechanicTypes,
  ...dragonTypes,
] as const satisfies readonly AdditionalOptionRuleEquipmentType[];

type AdditionalOptionEquipmentRuleInput = {
  /** 장비 파츠 key */
  type: AdditionalOptionRuleEquipmentType;
  /** 아이템 이름. 추후 이름 기반 예외가 필요할 때 사용한다. */
  name: string;
};

export function isAdditionalOptionEnabledByEquipmentRule({ type }: AdditionalOptionEquipmentRuleInput) {
  const disabledTypes: readonly AdditionalOptionRuleEquipmentType[] = additionalOptionDisabledEquipmentTypes;

  return !disabledTypes.includes(type);
}
