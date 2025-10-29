type ItemTotalOptionStringSlot =
  | 'str'
  | 'dex'
  | 'int'
  | 'luk'
  | 'max_hp'
  | 'max_mp'
  | 'attack_power'
  | 'magic_power'
  | 'armor'
  | 'speed'
  | 'jump'
  | 'boss_damage'
  | 'ignore_monster_armor'
  | 'all_stat'
  | 'max_hp_rate'
  | 'max_mp_rate';

type ItemTotalOption = Record<ItemTotalOptionStringSlot, string> & {
  equipment_level_decrease: number;
};

// type ItemTotalOption = {
//   str: string;
//   dex: string;
//   int: string;
//   luk: string;
//   max_hp: string;
//   max_mp: string;
//   attack_power: string;
//   magic_power: string;
//   armor: string;
//   speed: string;
// };

type ItemEquipmentSlot = {
  item_equipment_part: string;
  item_equipment_slot: string;
  item_name: string;
  item_icon: string;
  item_description: string | null;
  item_shape_name: string;
  item_shape_icon: string;
  item_gender: string | null;
  // item_total_option
};

export interface ItemEquipment {
  date: string | null;
  character_gender: string;
  character_class: string;
  preset_no: number;
  // item_equipment:
}

// "item_total_option": {
//   "str": "393",
//   "dex": "295",
//   "int": "36",
//   "luk": "36",
//   "max_hp": "255",
//   "max_mp": "255",
//   "attack_power": "875",
//   "magic_power": "0",
//   "armor": "0",
//   "speed": "0",
//   "jump": "0",
//   "boss_damage": "40",
//   "ignore_monster_armor": "20",
//   "all_stat": "0",
//   "damage": "0",
//   "equipment_level_decrease": 0,
//   "max_hp_rate": "0",
//   "max_mp_rate": "0"
// },
// "item_base_option": {
//   "str": "150",
//   "dex": "150",
//   "int": "0",
//   "luk": "0",
//   "max_hp": "0",
//   "max_mp": "0",
//   "attack_power": "340",
//   "magic_power": "0",
//   "armor": "0",
//   "speed": "0",
//   "jump": "0",
//   "boss_damage": "30",
//   "ignore_monster_armor": "20",
//   "all_stat": "0",
//   "max_hp_rate": "0",
//   "max_mp_rate": "0",
//   "base_equipment_level": 200
// },
//
type ItemTotalOpt =
  | 'str'
  | 'dex'
  | 'int'
  | 'luk'
  | 'max_hp'
  | 'max_mp'
  | 'attack_power'
  | 'magic_power'
  | 'armor'
  | 'speed'
  | 'jump'
  | 'boss_damage'
  | 'ignore_monster_armor'
  | 'all_stat'
  | 'damage'
  | 'equipment_level_decrease'
  | 'max_hp_rate'
  | 'max_mp_rate';

type ItemBaseOpt =
  | 'str'
  | 'dex'
  | 'int'
  | 'luk'
  | 'max_hp'
  | 'max_mp'
  | 'attack_power'
  | 'magic_power'
  | 'armor'
  | 'speed'
  | 'jump'
  | 'boss_damage'
  | 'ignore_monster_armor'
  | 'all_stat'
  | 'max_hp_rate'
  | 'max_mp_rate'
  | 'base_equipment_level';

type ItemExceptionalOpt =
  | 'str'
  | 'dex'
  | 'int'
  | 'luk'
  | 'max_hp'
  | 'max_mp'
  | 'attack_power'
  | 'magic_power'
  | 'exceptional_upgrade';

type ItemAddOpt =
  | 'str'
  | 'dex'
  | 'int'
  | 'luk'
  | 'max_hp'
  | 'max_mp'
  | 'attack_power'
  | 'magic_power'
  | 'armor'
  | 'speed'
  | 'jump'
  | 'boss_damage'
  | 'damage'
  | 'all_stat'
  | 'equipment_level_decrease';

type ItemEtcOpt =
  | 'str'
  | 'dex'
  | 'int'
  | 'luk'
  | 'max_hp'
  | 'max_mp'
  | 'attack_power'
  | 'magic_power'
  | 'armor'
  | 'speed'
  | 'jump';

type itemStartforceOpt =
  | 'str'
  | 'dex'
  | 'int'
  | 'luk'
  | 'max_hp'
  | 'max_mp'
  | 'attack_power'
  | 'magic_power'
  | 'armor'
  | 'speed'
  | 'jump';

interface ItemOptions {
  total: ItemTotalOpt;
  source: {
    base: ItemBaseOpt;
    exceptional: ItemExceptionalOpt;
    add: ItemAddOpt;
    etc: ItemEtcOpt;
    starforce: itemStartforceOpt;
  };
}

type ItemOptionKey =
  | 'str'
  | 'dex'
  | 'int'
  | 'luk'
  | 'max_hp'
  | 'max_mp'
  | 'attack_power'
  | 'magic_power'
  | 'armor'
  | 'speed'
  | 'jump'
  | 'boss_damage'
  | 'ignore_monster_armor'
  | 'all_stat'
  | 'damage'
  | 'equipment_level_decrease'
  | 'max_hp_rate'
  | 'max_mp_rate'
  | 'base_equipment_level'
  | 'exceptional_upgrade';
