export interface Skill {
  name: string;
  description: string;
  level: number;
  effect: string;
  effectNext: string;
  icon: string;
}

export interface CharacterSkill {
  date: string | null;
  skillGrade: string;
  skills: Skill[];
}
