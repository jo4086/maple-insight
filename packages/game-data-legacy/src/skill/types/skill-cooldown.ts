import type { SkillFormulaValue } from './skill-formula';

/** 스킬별 재사용 대기시간 테이블 */
export type SkillCooldownTable<TSkillName extends string = string> = Partial<Record<TSkillName, SkillFormulaValue>>;
