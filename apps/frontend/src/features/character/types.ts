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

interface ItemOptionProps {
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

interface ItemEquipmentProps {
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

export interface SearchNickResponse {
  basic: CharacterBasic;
  ability: CharacterAbility;
  propensity: CharacterPropensity;
  'symbol-equipment': CharacterSymbolEquipment;
  'item-equipment': CharacterItemEquipment;
  stat: CharacterStat;
  'hyper-stat': CharacterHyperStat;
  'set-effect': CharacterSetEffect;
}
