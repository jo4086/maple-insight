import type { CharacterSkill, Skill } from '@maple/types';

import type { SkillRaw } from '../types/skill.raw';

type SkillItemRaw = NonNullable<SkillRaw['character_skill']>[number];

function toSkill(raw: SkillItemRaw): Skill {
  return {
    name: raw.skill_name ?? '',
    description: raw.skill_description ?? '',
    level: raw.skill_level ?? 0,
    effect: raw.skill_effect ?? '',
    effectNext: raw.skill_effect_next ?? '',
    icon: raw.skill_icon ?? '',
  };
}

export function toCharacterSkill(raw: SkillRaw): CharacterSkill {
  return {
    date: raw.date,
    skillGrade: raw.character_skill_grade ?? '',
    skills: (raw.character_skill ?? []).map(toSkill),
  };
}
