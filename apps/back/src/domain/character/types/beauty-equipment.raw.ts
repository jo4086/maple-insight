export interface BeautyRaw {
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
