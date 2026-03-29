export interface CashItemOption {
  option_type: string;
  option_value: string;
}

export interface PrismOption {
  color_range: string;
  hue: number;
  saturation: number;
  value: number;
}

export interface CashItem {
  equipment_part: string;
  equipment_slot: string;
  name: string;
  icon: string;
  description: string;
  option: CashItemOption[];
  date_expire: string;
  date_option_expire: string;
  label: string;
  coloring_prism: PrismOption;
  effect_prism: PrismOption;
  item_gender: string;
  skills: string[];
  freestyle_flag: string;
  emotion_name: string;
}

export interface CharacterCashItem {
  date: string | null;
  character_gender: string;
  character_class: string;
  character_look_mode: string;
  preset_no: number;
  normal: {
    base: CashItem[];
    presets: CashItem[][];
  };
  additional: {
    base: CashItem[];
    presets: CashItem[][];
  };
}
