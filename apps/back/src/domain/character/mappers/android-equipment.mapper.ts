import type { CashItem, CashItemOption, PrismOption } from '@maple/types';
import { toBooleanByFlag } from 'src/utils/boolean';
import { toNumberSafe } from 'src/utils/number';

import type { AndroidInfo, CharacterAndroid } from '../types/android-equipment';
import type { AndroidRaw } from '../types/android-equipment.raw';
import type { BeautyState, FaceStyle, HairStyle, SkinStyle } from '../types/beauty-equipment';

type AndroidCashItem = Omit<CashItem, 'effectPrism' | 'skills' | 'emotionName'>;
type HairRaw = AndroidRaw['android_hair'];
type FaceRaw = AndroidRaw['android_face'];
type SkinRaw = AndroidRaw['android_skin'];
type CashItemRaw = AndroidRaw['android_cash_item_equipment'][number];
type AndroidPresetRaw = NonNullable<AndroidRaw['android_preset_1']>;

function toHairStyle(raw: HairRaw): HairStyle | null {
  if (raw.hair_name == null && raw.base_color == null && raw.mix_color == null) {
    return null;
  }

  return {
    name: raw.hair_name ?? '',
    baseColor: raw.base_color ?? '',
    mixColor: raw.mix_color ?? '',
    mixRate: toNumberSafe(raw.mix_rate),
    freestyleFlag: toBooleanByFlag(raw.freestyle_flag),
  };
}

function toFaceStyle(raw: FaceRaw): FaceStyle | null {
  if (raw.face_name == null && raw.base_color == null && raw.mix_color == null) {
    return null;
  }

  return {
    name: raw.face_name ?? '',
    baseColor: raw.base_color ?? '',
    mixColor: raw.mix_color ?? '',
    mixRate: toNumberSafe(raw.mix_rate),
    freestyleFlag: toBooleanByFlag(raw.freestyle_flag),
  };
}

function toSkinStyle(raw: SkinRaw): SkinStyle | null {
  if (!raw) return null;

  return {
    name: raw.skin_name,
    colorStyle: raw.color_style ?? '',
    hue: raw.hue ?? 0,
    saturation: raw.saturation ?? 0,
    brightness: raw.brightness ?? 0,
  };
}

function toBeautyState(hair: HairRaw, face: FaceRaw, skin: SkinRaw): BeautyState | null {
  const mappedHair = toHairStyle(hair);
  const mappedFace = toFaceStyle(face);
  const mappedSkin = toSkinStyle(skin);

  if (!mappedHair && !mappedFace && !mappedSkin) {
    return null;
  }

  return {
    hair: mappedHair,
    face: mappedFace,
    skin: mappedSkin,
  };
}

function toCashItemOption(raw: CashItemRaw['cash_item_option'][number]): CashItemOption {
  return {
    type: raw.option_type,
    value: raw.option_value,
  };
}

function toPrismOption(raw: CashItemRaw['cash_item_coloring_prism']): PrismOption | null {
  if (!raw) return null;

  return {
    colorRange: raw.color_range,
    hue: raw.hue,
    saturation: raw.saturation,
    value: raw.value,
  };
}

function toAndroidCashItem(raw: CashItemRaw): AndroidCashItem {
  return {
    part: raw.cash_item_equipment_part,
    slot: raw.cash_item_equipment_slot,
    name: raw.cash_item_name,
    icon: raw.cash_item_icon,
    description: raw.cash_item_description,
    option: raw.cash_item_option.map(toCashItemOption),
    dateExpire: raw.date_expire,
    dateOptionExpire: raw.date_option_expire,
    label: raw.cash_item_label,
    coloringPrism: toPrismOption(raw.cash_item_coloring_prism),
    gender: raw.android_item_gender,
    freestyleFlag: toBooleanByFlag(raw.freestyle_flag),
  };
}

function toAndroidInfo(raw: {
  android_name: string | null;
  android_nickname: string | null;
  android_icon: string | null;
  android_description: string | null;
  android_hair: HairRaw;
  android_face: FaceRaw;
  android_skin: SkinRaw;
  android_cash_item_equipment?: CashItemRaw[];
  android_ear_sensor_clip_flag: string;
  android_gender: string | null;
  android_grade: string | number | null;
  android_non_humanoid_flag: string | null;
  android_shop_usable_flag: string | null;
}): AndroidInfo {
  return {
    name: raw.android_name,
    nickname: raw.android_nickname,
    icon: raw.android_icon,
    description: raw.android_description,
    style: toBeautyState(raw.android_hair, raw.android_face, raw.android_skin),
    cashItemInfo: (raw.android_cash_item_equipment ?? []).map(toAndroidCashItem),
    earSensorClipFlag: toBooleanByFlag(raw.android_ear_sensor_clip_flag),
    gender: raw.android_gender,
    grade: raw.android_grade == null ? null : toNumberSafe(raw.android_grade),
    nonHumanoidFlag: raw.android_non_humanoid_flag,
    shopUsableFlag: raw.android_shop_usable_flag == null ? null : toBooleanByFlag(raw.android_shop_usable_flag),
  };
}

function toAndroidPreset(no: number, raw: AndroidPresetRaw | null): CharacterAndroid['presets'][number] {
  return {
    no,
    info: raw
      ? toAndroidInfo({
          ...raw,
          android_cash_item_equipment: [],
        })
      : null,
  };
}

export function toCharacterAndroid(raw: AndroidRaw): CharacterAndroid {
  return {
    date: raw.date,
    equipped: toAndroidInfo(raw),
    presetNo: raw.preset_no,
    presets: [toAndroidPreset(1, raw.android_preset_1), toAndroidPreset(2, raw.android_preset_2), toAndroidPreset(3, raw.android_preset_3)],
  };
}
