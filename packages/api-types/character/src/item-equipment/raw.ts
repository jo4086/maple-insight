export interface ItemOptionRaw {
  str: string;
  dex: string;
  int: string;
  luk: string;
  max_hp: string;
  max_mp: string;
  attack_power: string;
  magic_power: string;
  armor: string;
  speed: string;
  jump: string;
  boss_damage: string;
  ignore_monster_armor: string;
  all_stat: string;
  damage: string;
  equipment_level_decrease: number;
  max_hp_rate: string;
  max_mp_rate: string;
}

export interface TotalOptionRaw {
  str: string;
  dex: string;
  int: string;
  luk: string;
  max_hp: string;
  max_mp: string;
  attack_power: string;
  magic_power: string;
  armor: string;
  speed: string;
  jump: string;
  boss_damage: string;
  ignore_monster_armor: string;
  all_stat: string;
  damage: string;
  equipment_level_decrease: number;
  max_hp_rate: string;
  max_mp_rate: string;
}

export interface BaseOptionRaw {
  str: string;
  dex: string;
  int: string;
  luk: string;
  max_hp: string;
  max_mp: string;
  attack_power: string;
  magic_power: string;
  armor: string;
  speed: string;
  jump: string;
  boss_damage: string;
  ignore_monster_armor: string;
  all_stat: string;
  max_hp_rate: string;
  max_mp_rate: string;
  base_equipment_level: number;
}

export interface AddOptionRaw {
  str: string;
  dex: string;
  int: string;
  luk: string;
  max_hp: string;
  max_mp: string;
  attack_power: string;
  magic_power: string;
  armor: string;
  speed: string;
  jump: string;
  boss_damage: string;
  damage: string;
  all_stat: string;
  equipment_level_decrease: number;
}

export interface StarforceOptionRaw {
  str: string;
  dex: string;
  int: string;
  luk: string;
  max_hp: string;
  max_mp: string;
  attack_power: string;
  magic_power: string;
  armor: string;
  speed: string;
  jump: string;
}

export interface EtcOptionRaw {
  str: string;
  dex: string;
  int: string;
  luk: string;
  max_hp: string;
  max_mp: string;
  attack_power: string;
  magic_power: string;
  armor: string;
  speed: string;
  jump: string;
}

export interface ExceptionalOptionRaw {
  str: string;
  dex: string;
  int: string;
  luk: string;
  max_hp: string;
  max_mp: string;
  attack_power: string;
  magic_power: string;
  exceptional_upgrade: number;
}

export interface ItemAdditionalPotentialRaw {
  additional_potential_option_grade: string | null;
  additional_potential_option_flag: string;
  additional_potential_option_1: string | null;
  additional_potential_option_2: string | null;
  additional_potential_option_3: string | null;
}

export interface ItemPotentialRaw {
  potential_option_grade: string | null;
  potential_option_flag: string;
  potential_option_1: string | null;
  potential_option_2: string | null;
  potential_option_3: string | null;
}

export interface PotentialOptionsRaw {
  potential_option_grade: string | null;
  potential_option_flag: string;
  potential_option_1: string | null;
  potential_option_2: string | null;
  potential_option_3: string | null;
  additional_potential_option_grade: string | null;
  additional_potential_option_flag: string;
  additional_potential_option_1: string | null;
  additional_potential_option_2: string | null;
  additional_potential_option_3: string | null;
}

export interface ItemEquipmentRaw {
  date: string | null;
  /** 남, 여, 기타 */
  character_gender: string;
  /** 캐릭터 직업 */
  character_class: string;
  preset_no: number;
  item_equipment: ({
    item_equipment_part: string;
    item_equipment_slot: string;
    item_name: string;
    item_icon: string;
    item_description: string | null;
    item_shape_name: string;
    item_shape_icon: string;
    item_gender: string | null;
    item_total_option: TotalOptionRaw;
    item_base_option: BaseOptionRaw;
    item_add_option: AddOptionRaw;
    item_etc_option: EtcOptionRaw;
    item_starforce_option: StarforceOptionRaw;
    item_exceptional_option: ExceptionalOptionRaw;
    equipment_level_increase: number;
    growth_exp: number;
    growth_level: number;
    scroll_upgrade: string;
    cuttable_count: string;
    golden_hammer_flag: string;
    scroll_resilience_count: string;
    scroll_upgradeable_count: string;
    soul_name: string | null;
    soul_option: string | null;
    starforce: string;
    starforce_scroll_flag: string;
    special_ring_level: number;
    date_expire: string | null;
    freestyle_flag: string;
  } & PotentialOptionsRaw)[];
  item_equipment_preset_1: ({
    item_equipment_part: string;
    item_equipment_slot: string;
    item_name: string;
    item_icon: string;
    item_description: string | null;
    item_shape_name: string;
    item_shape_icon: string;
    item_gender: string | null;
    item_total_option: TotalOptionRaw;
    item_base_option: BaseOptionRaw;
    item_add_option: AddOptionRaw;
    item_etc_option: EtcOptionRaw;
    item_starforce_option: StarforceOptionRaw;
    item_exceptional_option: ExceptionalOptionRaw;
    equipment_level_increase: number;
    growth_exp: number;
    growth_level: number;
    scroll_upgrade: string;
    cuttable_count: string;
    golden_hammer_flag: string;
    scroll_resilience_count: string;
    scroll_upgradeable_count: string;
    soul_name: string | null;
    soul_option: string | null;
    starforce: string;
    starforce_scroll_flag: string;
    special_ring_level: number;
    date_expire: string | null;
    freestyle_flag: string;
  } & PotentialOptionsRaw)[];
  item_equipment_preset_2: ({
    item_equipment_part: string;
    item_equipment_slot: string;
    item_name: string;
    item_icon: string;
    item_description: string | null;
    item_shape_name: string;
    item_shape_icon: string;
    item_gender: string | null;
    item_total_option: TotalOptionRaw;
    item_base_option: BaseOptionRaw;
    item_add_option: AddOptionRaw;
    item_etc_option: EtcOptionRaw;
    item_starforce_option: StarforceOptionRaw;
    item_exceptional_option: ExceptionalOptionRaw;
    equipment_level_increase: number;
    growth_exp: number;
    growth_level: number;
    scroll_upgrade: string;
    cuttable_count: string;
    golden_hammer_flag: string;
    scroll_resilience_count: string;
    scroll_upgradeable_count: string;
    soul_name: string | null;
    soul_option: string | null;
    starforce: string;
    starforce_scroll_flag: string;
    special_ring_level: number;
    date_expire: string | null;
    freestyle_flag: string;
  } & PotentialOptionsRaw)[];
  item_equipment_preset_3: ({
    item_equipment_part: string;
    item_equipment_slot: string;
    item_name: string;
    item_icon: string;
    item_description: string | null;
    item_shape_name: string;
    item_shape_icon: string;
    item_gender: string | null;
    item_total_option: TotalOptionRaw;
    item_base_option: BaseOptionRaw;
    item_add_option: AddOptionRaw;
    item_etc_option: EtcOptionRaw;
    item_starforce_option: StarforceOptionRaw;
    item_exceptional_option: ExceptionalOptionRaw;
    equipment_level_increase: number;
    growth_exp: number;
    growth_level: number;
    scroll_upgrade: string;
    cuttable_count: string;
    golden_hammer_flag: string;
    scroll_resilience_count: string;
    scroll_upgradeable_count: string;
    soul_name: string | null;
    soul_option: string | null;
    starforce: string;
    starforce_scroll_flag: string;
    special_ring_level: number;
    date_expire: string | null;
    freestyle_flag: string;
  } & PotentialOptionsRaw)[];
  title: {
    title_name: string;
    title_icon: string;
    title_description: string | null;
    date_expire: string | null;
    date_option_expire: string;
    title_shape_name: string;
    title_shape_icon: string;
    title_shape_description: string | null;
  } | null;
  medal_shape: {
    medal_shape_name: string;
    medal_shape_icon: string;
    medal_shape_description: string | null;
    medal_shape_changed_name: string;
    medal_shape_changed_icon: string;
    medal_shape_changed_description: string | null;
  } | null;
  dragon_equipment: {
    item_equipment_part: string;
    item_equipment_slot: string;
    item_name: string;
    item_icon: string;
    item_description: string | null;
    item_shape_name: string;
    item_shape_icon: string;
    item_gender: string | null;
    item_total_option: TotalOptionRaw;
    item_base_option: BaseOptionRaw;
    item_add_option: AddOptionRaw;
    item_etc_option: EtcOptionRaw;
    item_starforce_option: StarforceOptionRaw;
    item_exceptional_option: ExceptionalOptionRaw;
    equipment_level_increase: number;
    growth_exp: number;
    growth_level: number;
    scroll_upgrade: string;
    cuttable_count: string;
    golden_hammer_flag: string;
    scroll_resilience_count: string;
    scroll_upgradeable_count: string;
    soul_name: string | null;
    soul_option: string | null;
    starforce: string;
    starforce_scroll_flag: string;
    special_ring_level: number;
    date_expire: string | null;
    freestyle_flag: string;
  }[];
  mechanic_equipment: {
    item_equipment_part: string;
    item_equipment_slot: string;
    item_name: string;
    item_icon: string;
    item_description: string | null;
    item_shape_name: string;
    item_shape_icon: string;
    item_gender: string | null;
    item_total_option: TotalOptionRaw;
    item_base_option: BaseOptionRaw;
    item_add_option: AddOptionRaw;
    item_etc_option: EtcOptionRaw;
    item_starforce_option: StarforceOptionRaw;
    item_exceptional_option: ExceptionalOptionRaw;
    equipment_level_increase: number;
    growth_exp: number;
    growth_level: number;
    scroll_upgrade: string;
    cuttable_count: string;
    golden_hammer_flag: string;
    scroll_resilience_count: string;
    scroll_upgradeable_count: string;
    soul_name: string | null;
    soul_option: string | null;
    starforce: string;
    starforce_scroll_flag: string;
    special_ring_level: number;
    date_expire: string | null;
    freestyle_flag: string;
  }[];
}
