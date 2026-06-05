import type { SkillRawJobCategory } from '@maple/data-skill';

export type GeneratedRawSkill = {
  jobID: string;
  skillID: string;
  skillName: string;
  skillDesc: string;
  maxLevel: string;
  invisible: 'True' | 'False' | '';
  hyper: string;
  reqSkill: string;
  reqSkillLevel: string;
  reqLevel: string;
};

export type GeneratedRawJobSkillGroup = {
  jobId: string;
  classNames?: readonly string[];
  category?: SkillRawJobCategory;
  skills: GeneratedRawSkill[];
};

export type GeneratedRawJobSkillPayload = {
  version: string;
  jobCount: number;
  skillCount: number;
  groups: GeneratedRawJobSkillGroup[];
};
