import type { DeepNullable } from '@/types/deep-nullable';

interface HairRawBase {
  hair_name: string;
  base_color: string;
  mix_color: string;
  mix_rate: string;
  freestyle_flag: string;
}

interface FaceRawBase {
  face_name: string;
  base_color: string;
  mix_color: string;
  mix_rate: string;
  freestyle_flag: string;
}

interface SkinRawBase {
  skin_name: string;
  color_style: string;
  hue: number;
  saturation: number;
  brightness: number;
}

interface BeautyRawBase {
  date: string | null;
  character_gender: string;
  character_class: string;
  character_hair: HairRawBase;
  character_face: FaceRawBase;
  character_skin: SkinRawBase;
  additional_character_hair: HairRawBase;
  additional_character_face: FaceRawBase;
  additional_character_skin: SkinRawBase;
}

export type BeautyRaw = DeepNullable<BeautyRawBase>;
