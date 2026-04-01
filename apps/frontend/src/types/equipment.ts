type EquipmentLayoutCell = {
  slot: string;
  col: number;
  row: number;
  colSpan?: number;
  rowSpan?: number;
};

export const EQUIPMENT_LAYOUT: EquipmentLayoutCell[] = [
  { slot: '반지4', col: 1, row: 1 },
  { slot: '얼굴장식', col: 2, row: 1 },
  { slot: 'character-preview', col: 3, row: 1, colSpan: 3, rowSpan: 4 },
  { slot: '모자', col: 6, row: 1 },
  { slot: '망토', col: 7, row: 1 },

  { slot: '반지3', col: 1, row: 2 },
  { slot: '눈장식', col: 2, row: 2 },
  { slot: '상의', col: 6, row: 2 },
  { slot: '장갑', col: 7, row: 2 },

  { slot: '반지2', col: 1, row: 3 },
  { slot: '귀고리', col: 2, row: 3 },
  { slot: '하의', col: 6, row: 3 },
  { slot: '신발', col: 7, row: 3 },

  { slot: '반지1', col: 1, row: 4 },
  { slot: '펜던트2', col: 2, row: 4 },
  { slot: '어깨장식', col: 6, row: 4 },
  { slot: '훈장', col: 7, row: 4 },

  { slot: '벨트', col: 1, row: 5 },
  { slot: '펜던트1', col: 2, row: 5 },
  { slot: '무기', col: 3, row: 5 },
  { slot: '보조무기', col: 4, row: 5 },
  { slot: '엠블렘', col: 5, row: 5 },
  { slot: '안드로이드', col: 6, row: 5 },
  { slot: '기계 심장', col: 7, row: 5 },

  { slot: '포켓 아이템', col: 1, row: 6 },
  { slot: '뱃지', col: 7, row: 6 },
] as const;

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
