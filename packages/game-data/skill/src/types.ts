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
};
