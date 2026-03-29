export type SkillGrade = '0' | '1' | '1.5' | '2' | '2.5' | '3' | '4' | 'hyperactive' | 'hyperpassive' | '5' | '6';

export interface Skill {
  name: string;
  description: string;
  level: number;
  effect: string;
  effect_next: string;
  icon: string;
}

export interface CharacterSkill {
  date: string | null;
  character_class: string;
  grade: SkillGrade | string;
  skills: Skill[];
}

export interface SkillRawData {
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
