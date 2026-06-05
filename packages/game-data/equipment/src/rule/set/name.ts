import type { ClassGroup, ClassGroupKey } from '@maple/data-core';

import { cygnusEmpressSetNameMap } from '@/label';
import type { EquipmentSet } from '@/types';

export type EquipmentSetDisplayNameRule =
  | {
      /** 고정 세트 표시명 */
      type: 'fixed';
      /** 그대로 표시되는 세트명 */
      name: string;
    }
  | {
      /** 직업군 라벨을 괄호로 붙이는 표시명: 루타비스 세트(전사) */
      type: 'classGroupParenthesized';
      /** 괄호 앞에 표시되는 세트명 */
      name: string;
    }
  | {
      /** 직업군별로 실제 세트명이 완전히 다른 표시명 */
      type: 'classGroup';
      /** 직업군별 실제 세트명 */
      names: Record<ClassGroupKey, string>;
    };

export const equipmentSetDisplayNameRuleMap = {
  cygnusEmpress: {
    type: 'classGroup',
    names: cygnusEmpressSetNameMap,
  },
  rootAbyss: {
    type: 'classGroupParenthesized',
    name: '루타비스 세트',
  },
  absolabs: {
    type: 'classGroupParenthesized',
    name: '앱솔랩스 세트',
  },
  challenger: {
    type: 'fixed',
    name: '도전자의 장비 세트',
  },
  arcaneShade: {
    type: 'classGroupParenthesized',
    name: '아케인셰이드 세트',
  },
  eternal: {
    type: 'classGroupParenthesized',
    name: '에테르넬 세트',
  },
  darkBoss: {
    type: 'fixed',
    name: '칠흑의 보스 세트',
  },
  bossAccessory: {
    type: 'fixed',
    name: '보스 장신구 세트',
  },
  dawnBoss: {
    type: 'fixed',
    name: '여명의 보스 세트',
  },
  brilliantBoss: {
    type: 'fixed',
    name: '광휘의 보스 세트',
  },
  meister: {
    type: 'fixed',
    name: '마이스터 세트',
  },
  sevenDay: {
    type: 'fixed',
    name: '칠요 세트',
  },
} as const satisfies Record<EquipmentSet, EquipmentSetDisplayNameRule>;

type ResolveEquipmentSetDisplayNameRule<TRule extends EquipmentSetDisplayNameRule> = TRule extends {
  type: 'fixed';
  name: infer TName extends string;
}
  ? TName
  : TRule extends {
        type: 'classGroupParenthesized';
        name: infer TName extends string;
      }
    ? `${TName}(${ClassGroup})`
    : TRule extends {
          type: 'classGroup';
          names: infer TNames extends Record<ClassGroupKey, string>;
        }
      ? TNames[keyof TNames]
      : never;

/** 실제 장비 데이터에 표시되는 모든 세트명 */
export type EquipmentSetDisplayName = {
  [K in keyof typeof equipmentSetDisplayNameRuleMap]: ResolveEquipmentSetDisplayNameRule<(typeof equipmentSetDisplayNameRuleMap)[K]>;
}[keyof typeof equipmentSetDisplayNameRuleMap];

/** 짧은 별칭: 장비 API/계약 타입에서 세트명 필드에 사용 */
export type SetNames = EquipmentSetDisplayName;
