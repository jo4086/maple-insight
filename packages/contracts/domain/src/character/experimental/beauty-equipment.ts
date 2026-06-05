export interface CommonBeautyOption {
  base_color: string;
  mix_color: string;
  mix_rate: string;
  freestyle_flag: string;
}

export interface CharacterBeauty {
  date: string;
  character_gender: string;
  character_class: string;
  character_hair: CommonBeautyOption & {
    hair_name: string;
  };
  character_face: CommonBeautyOption & {
    face_name: string;
  };
  character_skin: Omit<CommonBeautyOption, 'base_color'> & {
    skin_name: string;
    color_style: string;
  };
  additional_character_hair: CommonBeautyOption & {
    hair_name: string;
  };
  additional_character_face: CommonBeautyOption & {
    face_name: string;
  };
  additional_character_skin: Omit<CommonBeautyOption, 'base_color'> & {
    skin_name: string;
    color_style: string;
  };
}
