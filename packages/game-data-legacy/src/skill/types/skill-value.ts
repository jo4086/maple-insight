import type { SkillAttackValueEffect } from './skill-attack';
import type { SkillDefenseValueEffect } from './skill-defense';
import type { SkillCooldownFormula, SkillDelayFormula, SkillDurationFormula, SkillStatFormula } from './skill-formula';
import type { SkillModifierValueEffect } from './skill-modifier';

/** 스킬 값 효과 */
export type SkillValueEffect<TSkillName extends string = string> =
  | SkillAttackValueEffect<TSkillName>
  | SkillBuffValueEffect
  | SkillDebuffValueEffect
  | SkillDefenseValueEffect
  | SkillModifierValueEffect<TSkillName>;

/** 조합된 스킬 값 */
export type SkillValue<TSkillName extends string = string> = Partial<SkillCooldownFormula & SkillDurationFormula> & {
  /** 스킬 딜레이 */
  delay?: SkillDelayFormula;
  /** 스킬 전체에 적용되는 스탯 */
  stats?: readonly SkillStatFormula[];
  /** 스킬 주요 효과 목록 */
  effects: readonly SkillValueEffect<TSkillName>[];
};

/** 버프 효과 수치 */
export type SkillBuffValueEffect = Partial<SkillDurationFormula> & {
  /** 효과 종류 */
  type: 'buff';
  /** 버프 세부 이름 */
  name?: string;
  /** 버프로 적용되는 스탯 목록 */
  stats: readonly SkillStatFormula[];
};

/** 디버프 효과 수치 */
export type SkillDebuffValueEffect = Partial<SkillDurationFormula> & {
  /** 효과 종류 */
  type: 'debuff';
  /** 디버프 세부 이름 */
  name?: string;
  /** 디버프로 적용되는 스탯 목록 */
  stats: readonly SkillStatFormula[];
};
