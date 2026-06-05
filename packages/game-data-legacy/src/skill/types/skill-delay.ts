import type { SkillDelayFormula } from './skill-formula';

/** 스킬별 딜레이 테이블 */
export type SkillDelayTable<TSkillName extends string = string> = Partial<Record<TSkillName, SkillDelayFormula>>;
