export interface ItemOption {
  str?: number;
  dex?: number;
  int?: number;
  luk?: number;
  max_hp?: number;
  max_mp?: number;
  attack_power?: number;
  magic_power?: number;
  armor?: number;
  speed?: number;
  jump?: number;
  boss_damage?: number;
  ignore_monster_armor?: number;
  all_stat?: number;
  damage?: number;
  equipment_level_decrease?: number;
  max_hp_rate?: number;
  max_mp_rate?: number;
}

export interface ItemAdditionalPotential {
  additional_potential_option_grade: string | null;
  additional_potential_option_flag: boolean;
  additional_potential_option_1: string | null;
  additional_potential_option_2: string | null;
  additional_potential_option_3: string | null;
}

export interface ItemPotential {
  potential_option_grade: string | null;
  potential_option_flag: boolean;
  potential_option_1: string | null;
  potential_option_2: string | null;
  potential_option_3: string | null;
}

export type RemovePotentialKeys = keyof ItemPotential | keyof ItemAdditionalPotential;

export interface Title {
  title_name: string;
  title_icon: string;
  title_description: string | null;
  date_expire: string | null;
  date_option_expire: string;
  title_shape_name: string;
  title_shape_icon: string;
  title_shape_description: string | null;
}

export interface MedalShape {
  medal_shape_name: string;
  medal_shape_icon: string;
  medal_shape_description: string | null;
  medal_shape_changed_name: string;
  medal_shape_changed_icon: string;
  medal_shape_changed_description: string | null;
}

export interface ItemEquipment {
  item_equipment_part: string;
  item_equipment_slot: string;
  item_name: string;
  item_icon: string;
  item_description: string | null;
  item_shape_name: string;
  item_shape_icon: string;
  item_gender: string | null;
  item_options: {
    total: ItemOption;
    base: ItemOption & {
      base_equipment_level: number;
    };
    exceptional: ItemOption & {
      exceptional_upgrade: number;
    };
    add: ItemOption;
    etc: ItemOption;
    starforce: ItemOption;
  };
  potentials: {
    potential: {
      grade: string | null;
      flag: boolean;
      option_1: string | null;
      option_2: string | null;
      option_3: string | null;
    };
    additional_potential: {
      grade: string | null;
      flag: boolean;
      option_1: string | null;
      option_2: string | null;
      option_3: string | null;
    };
  };
  upgrade: {
    growth_exp: number;
    growth_level: number;
    scroll_upgrade: number;
    cuttable_count: number;
    golden_hammer_flag: boolean;
    scroll_resilience_count: number;
    scroll_upgradable_count: number;
    soul_name: string | null;
    soul_option: string | null;
    starforce: number;
    starforce_scroll_flag: string;
  };
  equipment_level_increase: number;
  special_ring_level: number;
  date_expire: string | null;
  freestyle_flag: boolean;
}

export interface CharacterItem {
  date: string | null;
  character_gender: string;
  character_class: string;
  preset_no: number;
  item_equipment: ItemEquipment[];
  presets: {
    no: number;
    info: ItemEquipment[];
  }[];
  title: Title | null;
  medal_shape: MedalShape | null;
  dragon_equipment: Omit<ItemEquipment, RemovePotentialKeys>[];
  mechanic_equipment: Omit<ItemEquipment, RemovePotentialKeys>[];
}
