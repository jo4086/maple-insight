import { StatName } from './stat-name';

export const statValueTypes = ['number', 'percent'] as const;
export type StatValueType = (typeof statValueTypes)[number];

/**
 * [none]: 숫자 스탯
 * [stack]: 단순 합산되는 퍼센트
 * [final-damage]: 최종 데미지
 * [ignore-defense]: 방무
 **/
export const statPercentApplyTypes = ['none', 'stack', 'final-damage', 'ignore-defense'] as const;

export type StatPercentApplyType = (typeof statPercentApplyTypes)[number];

export type StatTypeMeta = {
  statName: StatName;
  valueType: StatValueType;
  percentApplyType?: StatPercentApplyType;
};
