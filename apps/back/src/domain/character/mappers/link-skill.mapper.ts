import type { CharacterLinkSkill, EquippedLinkSkill, LinkSkill } from '../types/link-skill';
import type { LinkSkillRaw } from '../types/link-skill.raw';

type EquippedLinkSkillRaw = LinkSkillRaw['character_link_skill'][number];
type LinkSkillPresetRaw = LinkSkillRaw['character_link_skill_preset_1'][number];
type OwnedLinkSkillRaw = LinkSkillRaw['character_owned_link_skill'];

const PRESET_KEYS = [
  'character_link_skill_preset_1',
  'character_link_skill_preset_2',
  'character_link_skill_preset_3',
] as const;

const OWNED_PRESET_KEYS = [
  'character_owned_link_skill_preset_1',
  'character_owned_link_skill_preset_2',
  'character_owned_link_skill_preset_3',
] as const;

function toLinkSkill(raw: LinkSkillPresetRaw | OwnedLinkSkillRaw): LinkSkill {
  return {
    name: raw.skill_name,
    description: raw.skill_description,
    level: raw.skill_level,
    effect: raw.skill_effect,
    icon: raw.skill_icon,
  };
}

function toEquippedLinkSkill(raw: EquippedLinkSkillRaw): EquippedLinkSkill {
  return {
    ...toLinkSkill(raw),
    effectNext: raw.skill_effect_next,
  };
}

export function toCharacterLinkSkill(raw: LinkSkillRaw): CharacterLinkSkill {
  return {
    date: raw.date,
    equipped: raw.character_link_skill.map(toEquippedLinkSkill),
    presets: PRESET_KEYS.map((key, index) => ({
      no: index + 1,
      info: raw[key].map(toLinkSkill),
    })),
    owned: toLinkSkill(raw.character_owned_link_skill),
    ownedPresets: OWNED_PRESET_KEYS.map((key) => toLinkSkill(raw[key])),
  };
}
