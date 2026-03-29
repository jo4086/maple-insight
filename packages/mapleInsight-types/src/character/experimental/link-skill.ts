export interface LinkSkill {
  name: string;
  description: string;
  level: number;
  effect: string;
  icon: string;
}

export interface EquippedLinkSkill extends LinkSkill {
  effect_next: string;
}

export interface CharacterLinkSkill {
  date: string | null;
  character_class: string;
  link_skill: EquippedLinkSkill[];
  presets: LinkSkill[][];
  owned_link_skill: LinkSkill;
  owned_presets: LinkSkill[];
}

export interface LinkSkillRawData {
  date: string | null;
  character_class: string;
  character_link_skill: {
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_effect_next: string;
    skill_icon: string;
  }[];
  character_link_skill_preset_1: {
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_icon: string;
  }[];
  character_link_skill_preset_2: {
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_icon: string;
  }[];
  character_link_skill_preset_3: {
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_icon: string;
  }[];
  character_owned_link_skill: {
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_icon: string;
  };
  character_owned_link_skill_preset_1: {
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_icon: string;
  };
  character_owned_link_skill_preset_2: {
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_icon: string;
  };
  character_owned_link_skill_preset_3: {
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_icon: string;
  };
}
