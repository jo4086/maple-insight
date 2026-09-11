import type { RawJobCategory } from './raw';

export type SkillRawJobCategory = RawJobCategory;

export type LinearDamagePercent = {
  base: number;
  perLevel: number;
};

export type SkillLinkedGroups = {
  skills: readonly string[];
  internalSkills?: readonly string[];
  linkedGroups?: readonly {
    source: string;
    linkedSkills: readonly string[];
  }[];
  derivedSkills?: readonly {
    source: string;
    skills: readonly string[];
  }[];
};

type LinkedGroup<TSource extends string> = {
  source: TSource;
  linkedSkills: readonly string[];
};

type SkillLinkedGroupsWithSourceConstraint<TSkills extends readonly string[]> = Omit<SkillLinkedGroups, 'skills' | 'linkedGroups'> & {
  skills: TSkills;
  linkedGroups?: readonly LinkedGroup<TSkills[number]>[];
};

export function defineSkillLinkedGroups<const TSkills extends readonly string[]>(
  value: SkillLinkedGroupsWithSourceConstraint<TSkills>,
): SkillLinkedGroupsWithSourceConstraint<TSkills> {
  return value;
}
