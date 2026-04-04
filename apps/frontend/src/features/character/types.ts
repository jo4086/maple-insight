type DateType = string | null;

interface AbilityInfo {
  ability_no: string;
  ability_grade: string;
  ability_value: string;
}
interface AbilityPreset {
  ability_preset_grade: string;
  ability_info: AbilityInfo;
}

interface SymbolProps {
  symbol_name: string;
  symbol_icon: string;
  symbol_description: string;
  symbol_other_effect_description: null | string;
  symbol_force: string;
  symbol_level: number;
  symbol_str: string;
  symbol_dex: string;
  symbol_int: string;
  symbol_luk: string;
  symbol_hp: string;
  symbol_drop_rate: string;
  symbol_meso_rate: string;
  symbol_exp_rate: string;
  symbol_growth_count: number;
  symbol_require_growth_count: number;
}

export interface ItemOptionProps {
  str?: string;
  dex?: string;
  int?: string;
  luk?: string;
  max_hp?: string;
  max_mp?: string;
  attack_power?: string;
  magic_power?: string;
  armor?: string;
  speed?: string;
  jump?: string;
  boss_damage?: string;
  ignore_monster_armor?: string;
  all_stat?: string;
  damage?: string;
  equipment_level_decrease?: number;
  max_hp_rate?: string;
  max_mp_rate?: string;
}

interface ItemAdditionalPotentialProps {
  additional_potential_option_grade: string;
  additional_potential_option_flag: string;
  additional_potential_option_1: string;
  additional_potential_option_2: string;
  additional_potential_option_3: string;
}
interface ItemPotentialProps {
  potential_option_grade: string;
  potential_option_flag: string;
  potential_option_1: string;
  potential_option_2: string;
  potential_option_3: string;
}
type RemovePotentialKeys = keyof ItemPotentialProps | keyof ItemAdditionalPotentialProps;

export interface ItemEquipmentProps {
  item_equipment_part: string;
  item_equipment_slot: string;
  item_name: string;
  item_icon: string;
  item_description: null | string;
  item_shape_name: string;
  item_shape_icon: string;
  item_gender: null | string;
  item_total_option: ItemOptionProps;
  item_base_option: ItemOptionProps & {
    base_equipment_level: number;
  };
  potential_option_grade: string;
  additional_potential_option_grade: string;
  potential_option_flag: string;
  potential_option_1: string;
  potential_option_2: string;
  potential_option_3: string;
  additional_potential_option_flag: string;
  additional_potential_option_1: string;
  additional_potential_option_2: string;
  additional_potential_option_3: string;
  equipment_level_increase: number;
  item_exceptional_option: ItemOptionProps & {
    exceptional_upgrade: number;
  };
  item_add_option: ItemOptionProps;
  growth_exp: number;
  growth_level: number;
  scroll_upgrade: string;
  cuttable_count: string;
  golden_hammer_flag: string;
  scroll_resilience_count: string;
  scroll_upgradeable_count: string;
  soul_name: null | string;
  soul_option: null | string;
  item_etc_option: ItemOptionProps;
  starforce: string;
  starforce_scroll_flag: string;
  item_starforce_option: ItemOptionProps;
  special_ring_level: number;
  date_expire: null | string;
  freestyle_flag: string;
}

interface HyperStatPresetProps {
  stat_type: string;
  stat_point: null | number;
  stat_level: number;
  stat_increase: null | string;
}

interface SetEffectOptionProps {
  set_count: number;
  set_option: string;
}
interface SetEffectProps {
  set_name: string;
  total_set_count: number;
  set_effect_info: SetEffectOptionProps[];
  set_option_full: SetEffectOptionProps[];
}

export interface CharacterBasic {
  date: DateType;
  character_name: string;
  world_name: string;
  character_gender: string;
  character_class: string;
  character_class_level: string;
  character_level: number;
  character_exp: number;
  character_exp_rate: string;
  character_guild_name: string;
  character_image: string;
  character_date_create: string;
  access_flag: string;
  liberation_quest_clear: string;
}

export interface CharacterAbility {
  date: DateType;
  ability_grade: string;
  ability_info: AbilityInfo[];
  remain_fame: number;
  preset_no: number;
  ability_preset_1: AbilityPreset;
  ability_preset_2: AbilityPreset;
  ability_preset_3: AbilityPreset;
}

export interface CharacterPropensity {
  date: DateType;
  charisma_level: number;
  sensibility_level: number;
  insight_level: number;
  willingness_level: number;
  handicraft_level: number;
  charm_level: number;
}

export interface CharacterSymbolEquipment {
  date: DateType;
  character_class: string;
  symbol: SymbolProps[];
}

export interface CharacterItemEquipment {
  date: DateType;
  character_gender: string;
  character_class: string;
  preset_no: number;
  item_equipment: ItemEquipmentProps[];
  item_equipment_preset_1: ItemEquipmentProps[];
  item_equipment_preset_2: ItemEquipmentProps[];
  item_equipment_preset_3: ItemEquipmentProps[];
  title: {
    title_name: string;
    title_icon: string;
    title_description: string;
    date_expire: null | string;
    date_option_expire: null | string;
    title_shape_name: string;
    title_shape_icon: string;
    title_shape_description: string;
  };
  medal_shape: {
    medal_shape_name: string;
    medal_shape_icon: string;
    medal_shape_description: string;
    medal_shape_changed_name: string;
    medal_shape_changed_icon: string;
    medal_shape_changed_description: string;
  };
  dragon_equipment: Omit<ItemEquipmentProps, RemovePotentialKeys>[];
  mechanic_equipment: Omit<ItemEquipmentProps, RemovePotentialKeys>[];
}

export interface CharacterStat {
  date: DateType;
  character_class: string;
  final_stat: {
    stat_name: string;
    stat_value: string;
  }[];
  remain_ap: number;
}

export interface CharacterHyperStat {
  date: DateType;
  character_class: string;
  use_preset_no: string;
  use_available_hyper_stat: number;
  hyper_stat_preset_1: HyperStatPresetProps[];
  hyper_stat_preset_1_remain_point: number;
  hyper_stat_preset_2: HyperStatPresetProps[];
  hyper_stat_preset_2_remain_point: number;
  hyper_stat_preset_3: HyperStatPresetProps[];
  hyper_stat_preset_3_remain_point: number;
}

export interface CharacterSetEffect {
  date: DateType;
  set_effect: SetEffectProps[];
}

export interface CharacterOtherStat {
  date: string | null;
  other_stat: {
    other_stat_type: string;
    stat_info: {
      stat_name: string;
      stat_value: string;
    }[];
  }[];
}

export interface CharacterSpecialring {
  date: string | null;
  character_class: string;
  special_ring_reserve_name: string;
  special_ring_reserve_level: number;
  special_ring_reserve_icon: string;
  special_ring_reserve_description: string;
}

export interface SearchNickResponse {
  basic: CharacterBasic;
  ability: CharacterAbility;
  propensity: CharacterPropensity;
  'symbol-equipment': CharacterSymbolEquipment;
  'item-equipment': CharacterItemEquipment;
  stat: CharacterStat;
  'hyper-stat': CharacterHyperStat;
  'set-effect': CharacterSetEffect;
  'beauty-equipment': CharacterBeauty;
  'android-equipment': CharacterAndroid;
  'pet-equipment': CharacterPet;
  skill: SkillRaw;
  'link-skill': LinkSkillRaw;
  vmatrix: VmatrixRaw;
  hexamatrix: HexamatrixRaw;
  'hexamatrix-stat': HexamatrixStatRaw;
  dojang: DojangRaw;
  'other-stat': CharacterOtherStat;
  'ring-reserve-skill-equipment': CharacterSpecialring;
}

export interface OtherStatRaw {
  date: string | null;
  other_stat: {
    other_stat_type: string;
    stat_info: {
      stat_name: string;
      stat_value: string;
    }[];
  }[];
}

// 임시 타입들
export interface CharacterAndroid {
  date: string | null;
  android_name: string;
  android_nickname: string;
  android_icon: string;
  android_description: string;
  android_hair: {
    hair_name: string;
    base_color: string;
    mix_color: string;
    mix_rate: string;
    freestyle_flag: string;
  };
  android_face: {
    face_name: string;
    base_color: string;
    mix_color: string;
    mix_rate: string;
    freestyle_flag: string;
  };
  android_skin: {
    skin_name: string;
    color_style: string;
    hue: number;
    saturation: number;
    brightness: number;
  };
  android_cash_item_equipment: {
    cash_item_equipment_part: string;
    cash_item_equipment_slot: string;
    cash_item_name: string;
    cash_item_icon: string;
    cash_item_description: string;
    cash_item_option: {
      option_type: string;
      option_value: string;
    }[];
    date_expire: string;
    date_option_expire: string;
    cash_item_label: string;
    cash_item_coloring_prism: {
      color_range: string;
      hue: number;
      saturation: number;
      value: number;
    };
    android_item_gender: string;
    freestyle_flag: string;
  }[];
  android_ear_sensor_clip_flag: string;
  android_gender: string;
  android_grade: string;
  android_non_humanoid_flag: string;
  android_shop_usable_flag: string;
  preset_no: number;
  android_preset_1: {
    android_name: string;
    android_nickname: string;
    android_icon: string;
    android_description: string;
    android_gender: string;
    android_grade: string;
    android_skin: {
      skin_name: string;
      color_style: string;
      hue: number;
      saturation: number;
      brightness: number;
    };
    android_hair: {
      hair_name: string;
      base_color: string;
      mix_color: string;
      mix_rate: string;
      freestyle_flag: string;
    };
    android_face: {
      face_name: string;
      base_color: string;
      mix_color: string;
      mix_rate: string;
      freestyle_flag: string;
    };
    android_ear_sensor_clip_flag: string;
    android_non_humanoid_flag: string;
    android_shop_usable_flag: string;
  };
  android_preset_2: {
    android_name: string;
    android_nickname: string;
    android_icon: string;
    android_description: string;
    android_gender: string;
    android_grade: string;
    android_skin: {
      skin_name: string;
      color_style: string;
      hue: number;
      saturation: number;
      brightness: number;
    };
    android_hair: {
      hair_name: string;
      base_color: string;
      mix_color: string;
      mix_rate: string;
      freestyle_flag: string;
    };
    android_face: {
      face_name: string;
      base_color: string;
      mix_color: string;
      mix_rate: string;
      freestyle_flag: string;
    };
    android_ear_sensor_clip_flag: string;
    android_non_humanoid_flag: string;
    android_shop_usable_flag: string;
  };
  android_preset_3: {
    android_name: string;
    android_nickname: string;
    android_icon: string;
    android_description: string;
    android_gender: string;
    android_grade: string;
    android_skin: {
      skin_name: string;
      color_style: string;
      hue: number;
      saturation: number;
      brightness: number;
    };
    android_hair: {
      hair_name: string;
      base_color: string;
      mix_color: string;
      mix_rate: string;
      freestyle_flag: string;
    };
    android_face: {
      face_name: string;
      base_color: string;
      mix_color: string;
      mix_rate: string;
      freestyle_flag: string;
    };
    android_ear_sensor_clip_flag: string;
    android_non_humanoid_flag: string;
    android_shop_usable_flag: string;
  };
}

export interface CharacterBeauty {
  date: string | null;
  character_gender: string;
  character_class: string;
  character_hair: {
    hair_name: string;
    base_color: string;
    mix_color: string;
    mix_rate: string;
    freestyle_flag: string;
  };
  character_face: {
    face_name: string;
    base_color: string;
    mix_color: string;
    mix_rate: string;
    freestyle_flag: string;
  };
  character_skin: {
    skin_name: string;
    color_style: string;
    hue: number;
    saturation: number;
    brightness: number;
  };
  additional_character_hair: {
    hair_name: string;
    base_color: string;
    mix_color: string;
    mix_rate: string;
    freestyle_flag: string;
  };
  additional_character_face: {
    face_name: string;
    base_color: string;
    mix_color: string;
    mix_rate: string;
    freestyle_flag: string;
  };
  additional_character_skin: {
    skin_name: string;
    color_style: string;
    hue: number;
    saturation: number;
    brightness: number;
  };
}

export interface CharacterPet {
  date: string;
  pet_1_name: string;
  pet_1_nickname: string;
  pet_1_icon: string;
  pet_1_description: string;
  pet_1_equipment: {
    item_name: string;
    item_icon: string;
    item_description: string;
    item_option: {
      option_type: string;
      option_value: string;
    }[];
    scroll_upgrade: number;
    scroll_upgradable: number;
    item_shape: string;
    item_shape_icon: string;
    item_date_expire: string;
  };
  pet_1_auto_skill: {
    skill_1: string;
    skill_1_icon: string;
    skill_2: string;
    skill_2_icon: string;
  };
  pet_1_pet_type: string;
  pet_1_skill: string[];
  pet_1_date_expire: string;
  pet_1_appearance: string;
  pet_1_appearance_icon: string;
  pet_2_name: string;
  pet_2_nickname: string;
  pet_2_icon: string;
  pet_2_description: string;
  pet_2_equipment: {
    item_name: string;
    item_icon: string;
    item_description: string;
    item_option: {
      option_type: string;
      option_value: string;
    }[];
    scroll_upgrade: number;
    scroll_upgradable: number;
    item_shape: string;
    item_shape_icon: string;
    item_date_expire: string;
  };
  pet_2_auto_skill: {
    skill_1: string;
    skill_1_icon: string;
    skill_2: string;
    skill_2_icon: string;
  };
  pet_2_pet_type: string;
  pet_2_skill: string[];
  pet_2_date_expire: string;
  pet_2_appearance: string;
  pet_2_appearance_icon: string;
  pet_3_name: string;
  pet_3_nickname: string;
  pet_3_icon: string;
  pet_3_description: string;
  pet_3_equipment: {
    item_name: string;
    item_icon: string;
    item_description: string;
    item_option: {
      option_type: string;
      option_value: string;
    }[];
    scroll_upgrade: number;
    scroll_upgradable: number;
    item_shape: string;
    item_shape_icon: string;
    item_date_expire: string;
  };
  pet_3_auto_skill: {
    skill_1: string;
    skill_1_icon: string;
    skill_2: string;
    skill_2_icon: string;
  };
  pet_3_pet_type: string;
  pet_3_skill: string[];
  pet_3_date_expire: string;
  pet_3_appearance: string;
  pet_3_appearance_icon: string;
}

export interface SkillRaw {
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

export interface LinkSkillRaw {
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

export interface VmatrixRaw {
  date: string | null;
  character_class: string;
  character_v_core_equipment: {
    slot_id: string;
    v_core_name: string;
    v_core_type: string;
    v_core_level: number;
  }[];
  character_v_matrix_remain_slot_upgrade_point: number;
}

export interface HexamatrixRaw {
  date: string | null;
  character_hexa_core_equipment: {
    hexa_core_name: string;
    hexa_core_level: number;
    hexa_core_type: string;
    linked_skill: {
      hexa_skill_id: string;
    }[];
  }[];
}

export interface HexamatrixStatRaw {
  date: string | null;
  character_class: string;
  character_hexa_stat_core: {
    slot_id: string;
    main_stat_name: string;
    sub_stat_name_1: string;
    sub_stat_name_2: string;
    main_stat_level: number;
    sub_stat_level_1: number;
    sub_stat_level_2: number;
    stat_grade: number;
  }[];
  character_hexa_stat_core_2: {
    slot_id: string;
    main_stat_name: string;
    sub_stat_name_1: string;
    sub_stat_name_2: string;
    main_stat_level: number;
    sub_stat_level_1: number;
    sub_stat_level_2: number;
    stat_grade: number;
  }[];
  character_hexa_stat_core_3: {
    slot_id: string;
    main_stat_name: string;
    sub_stat_name_1: string;
    sub_stat_name_2: string;
    main_stat_level: number;
    sub_stat_level_1: number;
    sub_stat_level_2: number;
    stat_grade: number;
  }[];
  preset_hexa_stat_core: {
    slot_id: string;
    main_stat_name: string;
    sub_stat_name_1: string;
    sub_stat_name_2: string;
    main_stat_level: number;
    sub_stat_level_1: number;
    sub_stat_level_2: number;
    stat_grade: number;
  }[];
  preset_hexa_stat_core_2: {
    slot_id: string;
    main_stat_name: string;
    sub_stat_name_1: string;
    sub_stat_name_2: string;
    main_stat_level: number;
    sub_stat_level_1: number;
    sub_stat_level_2: number;
    stat_grade: number;
  }[];
  preset_hexa_stat_core_3: {
    slot_id: string;
    main_stat_name: string;
    sub_stat_name_1: string;
    sub_stat_name_2: string;
    main_stat_level: number;
    sub_stat_level_1: number;
    sub_stat_level_2: number;
    stat_grade: number;
  }[];
}

export interface DojangRaw {
  date: string | null;
  character_class: string;
  world_name: string;
  dojang_best_floor: number;
  date_dojang_record: string | null;
  dojang_best_time: number;
}
