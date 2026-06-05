export interface CashRaw {
  date: string | null;
  character_gender: string;
  character_class: string;
  /** 캐릭터 외형 모드 (0: 일반, 1: 베타 or 드레스업) */
  character_look_mode: string;
  preset_no: number;
  cash_item_equipment_base: {
    cash_item_equipment_part: string;
    cash_item_equipment_slot: string;
    cash_item_name: string;
    cash_item_icon: string;
    cash_item_description: string | null;
    cash_item_option: {
      option_type: string;
      option_value: string;
    }[];
    date_expire: string | null;
    date_option_expire: string | null;
    cash_item_label: string | null;
    cash_item_coloring_prism: {
      color_range: string;
      hue: number;
      saturation: number;
      value: number;
    } | null;
    cash_item_effect_prism: {
      color_range: string;
      hue: number;
      saturation: number;
      value: number;
    } | null;
    item_gender: string | null;
    skills: string[];
    freestyle_flag: string;
    emotion_name: string | null;
  }[];
  cash_item_equipment_preset_1: {
    cash_item_equipment_part: string;
    cash_item_equipment_slot: string;
    cash_item_name: string;
    cash_item_icon: string;
    cash_item_description: string | null;
    cash_item_option: {
      option_type: string;
      option_value: string;
    }[];
    date_expire: string | null;
    date_option_expire: string | null;
    cash_item_label: string | null;
    cash_item_coloring_prism: {
      color_range: string;
      hue: number;
      saturation: number;
      value: number;
    } | null;
    cash_item_effect_prism: {
      color_range: string;
      hue: number;
      saturation: number;
      value: number;
    } | null;
    item_gender: string | null;
    skills: string[];
    freestyle_flag: string;
    emotion_name: string | null;
  }[];
  cash_item_equipment_preset_2: {
    cash_item_equipment_part: string;
    cash_item_equipment_slot: string;
    cash_item_name: string;
    cash_item_icon: string;
    cash_item_description: string | null;
    cash_item_option: {
      option_type: string;
      option_value: string;
    }[];
    date_expire: string | null;
    date_option_expire: string | null;
    cash_item_label: string | null;
    cash_item_coloring_prism: {
      color_range: string;
      hue: number;
      saturation: number;
      value: number;
    } | null;
    cash_item_effect_prism: {
      color_range: string;
      hue: number;
      saturation: number;
      value: number;
    } | null;
    item_gender: string | null;
    skills: string[];
    freestyle_flag: string;
    emotion_name: string | null;
  }[];
  cash_item_equipment_preset_3: {
    cash_item_equipment_part: string;
    cash_item_equipment_slot: string;
    cash_item_name: string;
    cash_item_icon: string;
    cash_item_description: string | null;
    cash_item_option: {
      option_type: string;
      option_value: string;
    }[];
    date_expire: string | null;
    date_option_expire: string | null;
    cash_item_label: string | null;
    cash_item_coloring_prism: {
      color_range: string;
      hue: number;
      saturation: number;
      value: number;
    } | null;
    cash_item_effect_prism: {
      color_range: string;
      hue: number;
      saturation: number;
      value: number;
    } | null;
    item_gender: string | null;
    skills: string[];
    freestyle_flag: string;
    emotion_name: string | null;
  }[];
  additional_cash_item_equipment_base: {
    cash_item_equipment_part: string;
    cash_item_equipment_slot: string;
    cash_item_name: string;
    cash_item_icon: string;
    cash_item_description: string | null;
    cash_item_option: {
      option_type: string;
      option_value: string;
    }[];
    date_expire: string | null;
    date_option_expire: string | null;
    cash_item_label: string | null;
    cash_item_coloring_prism: {
      color_range: string;
      hue: number;
      saturation: number;
      value: number;
    } | null;
    cash_item_effect_prism: {
      color_range: string;
      hue: number;
      saturation: number;
      value: number;
    } | null;
    item_gender: string | null;
    skills: string[];
    freestyle_flag: string;
    emotion_name: string | null;
  }[];
  additional_cash_item_equipment_preset_1: {
    cash_item_equipment_part: string;
    cash_item_equipment_slot: string;
    cash_item_name: string;
    cash_item_icon: string;
    cash_item_description: string | null;
    cash_item_option: {
      option_type: string;
      option_value: string;
    }[];
    date_expire: string | null;
    date_option_expire: string | null;
    cash_item_label: string | null;
    cash_item_coloring_prism: {
      color_range: string;
      hue: number;
      saturation: number;
      value: number;
    } | null;
    cash_item_effect_prism: {
      color_range: string;
      hue: number;
      saturation: number;
      value: number;
    } | null;
    item_gender: string | null;
    skills: string[];
    freestyle_flag: string;
    emotion_name: string | null;
  }[];
  additional_cash_item_equipment_preset_2: {
    cash_item_equipment_part: string;
    cash_item_equipment_slot: string;
    cash_item_name: string;
    cash_item_icon: string;
    cash_item_description: string | null;
    cash_item_option: {
      option_type: string;
      option_value: string;
    }[];
    date_expire: string | null;
    date_option_expire: string | null;
    cash_item_label: string | null;
    cash_item_coloring_prism: {
      color_range: string;
      hue: number;
      saturation: number;
      value: number;
    } | null;
    cash_item_effect_prism: {
      color_range: string;
      hue: number;
      saturation: number;
      value: number;
    } | null;
    item_gender: string | null;
    skills: string[];
    freestyle_flag: string;
    emotion_name: string | null;
  }[];
  additional_cash_item_equipment_preset_3: {
    cash_item_equipment_part: string;
    cash_item_equipment_slot: string;
    cash_item_name: string;
    cash_item_icon: string;
    cash_item_description: string | null;
    cash_item_option: {
      option_type: string;
      option_value: string;
    }[];
    date_expire: string | null;
    date_option_expire: string | null;
    cash_item_label: string | null;
    cash_item_coloring_prism: {
      color_range: string;
      hue: number;
      saturation: number;
      value: number;
    } | null;
    cash_item_effect_prism: {
      color_range: string;
      hue: number;
      saturation: number;
      value: number;
    } | null;
    item_gender: string | null;
    skills: string[];
    freestyle_flag: string;
    emotion_name: string | null;
  }[];
}
