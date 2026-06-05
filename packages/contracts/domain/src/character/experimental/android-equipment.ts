export interface AndroidHair {
  hair_name: string;
  base_color: string;
  mix_color: string;
  mix_rate: string;
  freestyle_flag: string;
}

export interface AndroidFace {
  face_name: string;
  base_color: string;
  mix_color: string;
  mix_rate: string;
  freestyle_flag: string;
}

export interface AndroidSkin {
  skin_name: string;
  color_style: string;
  hue: number;
  saturation: number;
  brightness: number;
}

export interface AndroidPreset {
  no: number;
  name: string;
  nickname: string;
  icon: string;
  description: string;
  gender: string;
  grade: string;
  skin: AndroidSkin;
  hair: AndroidHair;
  face: AndroidFace;
  ear_sensor_clip_flag: string;
  non_humanoid_flag: string;
  shop_usable_flag: string;
}

export interface AndroidCashItemOption {
  type: string;
  value: string;
}

export interface AndroidCashItem {
  part: string;
  slot: string;
  name: string;
  icon: string;
  description: string;
  option: AndroidCashItemOption[];
  date_expire: string;
  date_option_expire: string;
  label: string;
  coloring_prism: {
    color_range: string;
    hue: number;
    saturation: number;
    value: number;
  };
  item_gender: string;
  freestyle_flag: string;
}

export interface CharacterAndroid {
  date: string | null;
  info: {
    name: string;
    nickname: string;
    icon: string;
    description: string;
    hair: AndroidHair;
    face: AndroidFace;
    skin: AndroidSkin;
    ear_sensor_clip_flag: string;
    gender: string;
    grade: string;
    non_humanoid_flag: string;
    shop_usable_flag: string;
  };
  cash_info: AndroidCashItem[];
  preset_no: number;
  presets: AndroidPreset[];
}

export interface AndroidRawData {
  date: string;
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
  android_cash_item_equipment: [
    {
      cash_item_equipment_part: string;
      cash_item_equipment_slot: string;
      cash_item_name: string;
      cash_item_icon: string;
      cash_item_description: string;
      cash_item_option: [
        {
          option_type: string;
          option_value: string;
        },
      ];
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
    },
  ];
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
