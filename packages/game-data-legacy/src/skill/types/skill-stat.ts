import type { SkillStatFormula } from './skill-formula';

/** 스킬별 스탯 효과 테이블 */
export type SkillStatTable<TSkillName extends string = string> = Partial<Record<TSkillName, readonly SkillStatFormula[]>>;
