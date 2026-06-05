interface HairRaw {
  hair_name: string;
  base_color: string;
  mix_color: string;
  mix_rate: string;
  freestyle_flag: string;
}

interface FaceRaw {
  face_name: string;
  base_color: string;
  mix_color: string;
  mix_rate: string;
  freestyle_flag: string;
}

interface SkinRaw {
  skin_name: string;
  color_style: string;
  hue: number;
  saturation: number;
  brightness: number;
}

export interface BeautyRaw {
  date: string | null;
  character_gender: string;
  character_class: string;
  /** 제로: 알파
   * 엔버: 일반 모드 */
  character_hair: HairRaw;
  /** 제로: 알파
   * 엔버: 일반 모드 */
  character_face: FaceRaw;
  /** 제로: 알파
   * 엔버: 일반 모드 */
  character_skin: SkinRaw;
  /** 제로: 베타
   * 엔버: 드레스폼 */
  additional_character_hair: HairRaw | null;
  /** 제로: 베타
   * 엔버: 드레스폼 */
  additional_character_face: FaceRaw | null;
  /** 제로: 베타
   * 엔버: 드레스폼 */
  additional_character_skin: SkinRaw | null;
}
