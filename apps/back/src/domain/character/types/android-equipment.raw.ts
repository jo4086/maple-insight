import type { DeepNullable } from '@/types/deep-nullable';

interface AndroidRawBase {
  date: string | null;
  android_name: string | null;
  android_nickname: string | null;
  android_icon: string | null;
  android_description: string | null;
  android_hair: {
    hair_name: string | null;
    base_color: string | null;
    mix_color: string | null;
    mix_rate: string;
    freestyle_flag: string;
  };
  android_face: {
    face_name: string | null;
    base_color: string | null;
    mix_color: string | null;
    mix_rate: string;
    freestyle_flag: string;
  };
  android_skin: {
    skin_name: string;
    color_style: string | null;
    hue: number | null;
    saturation: number | null;
    brightness: number | null;
  } | null;
  android_cash_item_equipment: {
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
    android_item_gender: string | null;
    freestyle_flag: string;
  }[];
  android_ear_sensor_clip_flag: string;
  android_gender: string | null;
  android_grade: string | number | null;
  android_non_humanoid_flag: string | null;
  android_shop_usable_flag: string | null;
  preset_no: number;
  android_preset_1: {
    android_name: string | null;
    android_nickname: string | null;
    android_icon: string | null;
    android_description: string | null;
    android_gender: string | null;
    android_grade: string | number | null;
    android_skin: {
      skin_name: string;
      color_style: string | null;
      hue: number | null;
      saturation: number | null;
      brightness: number | null;
    } | null;
    android_hair: {
      hair_name: string | null;
      base_color: string | null;
      mix_color: string | null;
      mix_rate: string;
      freestyle_flag: string;
    };
    android_face: {
      face_name: string | null;
      base_color: string | null;
      mix_color: string | null;
      mix_rate: string;
      freestyle_flag: string;
    };
    android_ear_sensor_clip_flag: string;
    android_non_humanoid_flag: string | null;
    android_shop_usable_flag: string | null;
  } | null;
  android_preset_2: {
    android_name: string | null;
    android_nickname: string | null;
    android_icon: string | null;
    android_description: string | null;
    android_gender: string | null;
    android_grade: string | number | null;
    android_skin: {
      skin_name: string;
      color_style: string | null;
      hue: number | null;
      saturation: number | null;
      brightness: number | null;
    } | null;
    android_hair: {
      hair_name: string | null;
      base_color: string | null;
      mix_color: string | null;
      mix_rate: string;
      freestyle_flag: string;
    };
    android_face: {
      face_name: string | null;
      base_color: string | null;
      mix_color: string | null;
      mix_rate: string;
      freestyle_flag: string;
    };
    android_ear_sensor_clip_flag: string;
    android_non_humanoid_flag: string | null;
    android_shop_usable_flag: string | null;
  } | null;
  android_preset_3: {
    android_name: string | null;
    android_nickname: string | null;
    android_icon: string | null;
    android_description: string | null;
    android_gender: string | null;
    android_grade: string | number | null;
    android_skin: {
      skin_name: string;
      color_style: string | null;
      hue: number | null;
      saturation: number | null;
      brightness: number | null;
    } | null;
    android_hair: {
      hair_name: string | null;
      base_color: string | null;
      mix_color: string | null;
      mix_rate: string;
      freestyle_flag: string;
    };
    android_face: {
      face_name: string | null;
      base_color: string | null;
      mix_color: string | null;
      mix_rate: string;
      freestyle_flag: string;
    };
    android_ear_sensor_clip_flag: string;
    android_non_humanoid_flag: string | null;
    android_shop_usable_flag: string | null;
  } | null;
}

export type AndroidRaw = DeepNullable<AndroidRawBase>;
