import { toBooleanByFlag } from 'src/utils/boolean';
import { toNumberSafe } from 'src/utils/number';

import type { BeautyState, CharacterBeauty, FaceStyle, HairStyle, SkinStyle } from '../types/beauty-equipment';
import type { BeautyRaw } from '../types/beauty-equipment.raw';

type HairRaw = BeautyRaw['character_hair'];
type FaceRaw = BeautyRaw['character_face'];
type SkinRaw = BeautyRaw['character_skin'];

function toHairStyle(raw: HairRaw): HairStyle {
  return {
    name: raw.hair_name,
    baseColor: raw.base_color,
    mixColor: raw.mix_color,
    mixRate: toNumberSafe(raw.mix_rate),
    freestyleFlag: toBooleanByFlag(raw.freestyle_flag),
  };
}

function toFaceStyle(raw: FaceRaw): FaceStyle {
  return {
    name: raw.face_name,
    baseColor: raw.base_color,
    mixColor: raw.mix_color,
    mixRate: toNumberSafe(raw.mix_rate),
    freestyleFlag: toBooleanByFlag(raw.freestyle_flag),
  };
}

function toSkinStyle(raw: SkinRaw): SkinStyle {
  return {
    name: raw.skin_name,
    colorStyle: raw.color_style,
    hue: raw.hue,
    saturation: raw.saturation,
    brightness: raw.brightness,
  };
}

function toBeautyInfo(hair: HairRaw, face: FaceRaw, skin: SkinRaw): BeautyState {
  return {
    hair: toHairStyle(hair),
    face: toFaceStyle(face),
    skin: toSkinStyle(skin),
  };
}

export function toCharacterBeauty(raw: BeautyRaw): CharacterBeauty {
  return {
    date: raw.date,
    characterGender: raw.character_gender,
    equipped: toBeautyInfo(raw.character_hair, raw.character_face, raw.character_skin),
    additional: toBeautyInfo(raw.additional_character_hair, raw.additional_character_face, raw.additional_character_skin),
  };
}
