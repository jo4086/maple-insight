import type { DeepNullable } from '@/types/deep-nullable';

interface SkillRawBase {
  date: string | null;
  character_class: string;
  character_skill_grade: string;
  character_skill: {
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_effect_next: string;
    skill_icon: string;
  }[];
}

export type SkillRaw = DeepNullable<SkillRawBase>;
