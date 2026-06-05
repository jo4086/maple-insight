import type { SkillAttackFormula, SkillFormulaValue, SkillStatFormula } from './skill-formula';

/** 공격 트리거 카운트 계산 규칙 */
export type SkillAttackTriggerCountRule<TSkillName extends string = string> = {
  /** 이 규칙을 적용할 스킬 목록 */
  skills?: readonly TSkillName[];
  /** 이 규칙을 적용할 스킬 태그 목록 */
  tags?: readonly string[];
  /** 트리거 카운트 1회로 인정할 적중/사용 횟수 */
  hitCountPerTriggerCount: SkillFormulaValue;
};

/** 공격 발동 조건 */
export type SkillAttackTrigger<TSkillName extends string = string> = {
  /** 발동 기준 hit: 모든 적중, directAttackHit: 직접 공격 적중, skillUse: 스킬 사용 */
  triggerOn: 'hit' | 'directAttackHit' | 'skillUse';
  /** 발동 조건으로 인정할 스킬 목록, 없으면 triggerOn 조건 전체 */
  skills?: readonly TSkillName[];
  /** 발동 조건으로 인정할 스킬 태그 목록 */
  tags?: readonly string[];
  /** 발동에 필요한 적중/사용 횟수 */
  requiredHitCount?: SkillFormulaValue;
  /** 스킬/태그별 트리거 카운트 계산 규칙 */
  countRules?: readonly SkillAttackTriggerCountRule<TSkillName>[];
  /** 발동 확률 */
  chancePercent?: SkillFormulaValue;
};

/** 어택타입 (action: 직접타격타입, nonAction: 직접타격x) */
export type SkillAttackType = 'action' | 'nonAction';

/** 공격 효과 수치 */
export type SkillAttackValueEffect<TSkillName extends string = string> = SkillAttackFormula & {
  /** 어택타입 (action: 직접타격타입, nonAction: 직접타격x) */
  type: SkillAttackType;
  /** 공격 세부 이름 */
  name?: string;
  /** 발동 조건 설명 */
  condition?: string;
  /** 공격 발동 조건 */
  trigger?: SkillAttackTrigger<TSkillName>;
  /** 지속시간, 초 단위 */
  durationSec?: SkillFormulaValue;
  /** 재발동 간격, 초 단위 */
  intervalSec?: SkillFormulaValue;
  /** 지속피해 틱 간격, 초 단위 */
  tickIntervalSec?: SkillFormulaValue;
  /** 크리티컬 적용 여부 */
  canCritical?: boolean;
  /** 해당 공격에만 적용되는 스탯 */
  stats?: readonly SkillStatFormula[];
};

/** 스킬별 공격 효과 테이블 */
export type SkillAttackTable<TSkillName extends string = string> = Partial<Record<TSkillName, readonly SkillAttackValueEffect<TSkillName>[]>>;
