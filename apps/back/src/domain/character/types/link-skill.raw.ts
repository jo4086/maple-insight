export interface LinkSkillRaw {
  date: string | null;
  character_class: string;
  character_link_skill: {
    skill_name: string;
    skill_description: string;
    skill_level: number;
    skill_effect: string;
    skill_effect_next: string | null;
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
