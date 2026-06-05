import type { SkillFormulaValue } from './skill-formula';

/** 방어 효과 종류 */
export type SkillDefenseType =
  /** 받는 피해 감소 */
  | 'damageReduction'
  /** 무적 */
  | 'invincible';

/** 방어 효과 수치 */
export type SkillDefenseValueEffect = {
  /** 방어 효과 종류 */
  type: SkillDefenseType;
  /** 방어 효과 세부 이름 */
  name?: string;
  /** 방어 효과 수치 */
  amount?: SkillFormulaValue;
  /** 최대 HP의 일정 비율로 피해를 입히는 공격에도 적용 여부 */
  appliesToMaxHpRateDamage?: boolean;
  /** 지속시간, 초 단위. 없으면 상시 적용 */
  durationSec?: SkillFormulaValue;
};

/** 스킬별 방어 효과 테이블 */
export type SkillDefenseTable<TSkillName extends string = string> = Partial<Record<TSkillName, readonly SkillDefenseValueEffect[]>>;
