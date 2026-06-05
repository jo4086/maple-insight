import type { SkillFormulaValue } from './skill-formula';

/** 스킬별 지속시간 테이블 */
export type SkillDurationTable<TSkillName extends string = string> = Partial<Record<TSkillName, SkillFormulaValue>>;
