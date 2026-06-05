import type { InputStatKey } from '../../stat/input-stat';
import type { SkillFormulaValue } from './skill-formula';

/** 수치 수정 연산 */
export type SkillModifierOperation = 'add' | 'multiply' | 'override' | 'addRate';

/** 수정 대상 필드 */
export type SkillModifierTargetField =
  | 'damagePercent'
  | 'hitCount'
  | 'repeatCount'
  | 'maxTargets'
  | 'durationSec'
  | 'cooldownSec'
  | 'stackMax'
  | 'amount'
  | 'attackStat'
  | 'chancePercent';

/** 다른 스킬 또는 자기 스킬의 수치를 수정하는 효과 */
export type SkillModifierValueEffect<TSkillName extends string = string> = {
  /** 효과 종류 */
  type: 'modifier';
  /** 선택형/랜덤형 효과 구분값. 없으면 항상 적용 */
  variant?: string;
  /** 수정 대상 스킬 */
  targetSkill: TSkillName | readonly TSkillName[];
  /** 수정 대상 필드 */
  targetField: SkillModifierTargetField;
  /** amount/attackStat 수정 시 대상 스탯 */
  targetStat?: InputStatKey;
  /** 수정 연산 */
  operation: SkillModifierOperation;
  /** 수정 수치 */
  value: SkillFormulaValue;
  /** 수치 단위 */
  unit?: 'flat' | 'percent' | 'percentagePoint';
};

/** 스킬별 수치 수정 효과 테이블 */
export type SkillModifierTable<TSkillName extends string = string> = Partial<Record<TSkillName, readonly SkillModifierValueEffect<TSkillName>[]>>;
