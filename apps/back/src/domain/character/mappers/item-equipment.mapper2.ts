import { classGroups, type ClassType, type EquipmentSlot } from '@maple/types';

import type { AndroidRaw } from '../types/android-equipment.raw';
import type { AndroidEquipment } from '../types/android-equipment2';
import type { ItemEquipmentRaw, ItemOptionRaw } from '../types/item-equipment.raw';
import type { CharacterEquipment, DragonEquipment, EquipmentPreset, ItemEquipment, MedalShape, MechanicEquipment, Title } from '../types/item-equipment2';
import { equipmentSlotMetaMap } from '../../equipment/equipment-slot-meta';
import { getMaxStarforceByBaseLevel } from '../utils/getMaxStarforceByBaseLevel';

import { toBooleanByFlag } from '@/utils/boolean';
import { toNumberSafe } from '@/utils/number';

type MainItemRaw = NonNullable<ItemEquipmentRaw['item_equipment']>[number];
type PresetItemRaw = NonNullable<ItemEquipmentRaw['item_equipment_preset_1']>[number];
type ClassExclusiveItemRaw = NonNullable<ItemEquipmentRaw['dragon_equipment']>[number];
type ItemRaw = MainItemRaw | PresetItemRaw | ClassExclusiveItemRaw;
type AndroidPresetKey = 'android_preset_1' | 'android_preset_2' | 'android_preset_3';
type ItemPresetKey = 'item_equipment_preset_1' | 'item_equipment_preset_2' | 'item_equipment_preset_3';
type AndroidCashItemRaw = NonNullable<NonNullable<AndroidRaw['android_cash_item_equipment']>[number]>;
type EquipmentOptionRaw = {
  [K in keyof ItemOptionRaw]?: ItemOptionRaw[K] | null;
} | null | undefined;

const ITEM_PRESET_KEYS: ItemPresetKey[] = ['item_equipment_preset_1', 'item_equipment_preset_2', 'item_equipment_preset_3'];
const ANDROID_PRESET_KEYS: AndroidPresetKey[] = ['android_preset_1', 'android_preset_2', 'android_preset_3'];
const EMPTY_BEAUTY_STATE: AndroidEquipment['style'] = {
  hair: null,
  face: null,
  skin: null,
};

function toEquipmentOption(raw: EquipmentOptionRaw) {
  return {
    str: toNumberSafe(raw?.str, 0),
    dex: toNumberSafe(raw?.dex, 0),
    int: toNumberSafe(raw?.int, 0),
    luk: toNumberSafe(raw?.luk, 0),
    maxHp: toNumberSafe(raw?.max_hp, 0),
    maxMp: toNumberSafe(raw?.max_mp, 0),
    attackPower: toNumberSafe(raw?.attack_power, 0),
    magicPower: toNumberSafe(raw?.magic_power, 0),
    armor: toNumberSafe(raw?.armor, 0),
    speed: toNumberSafe(raw?.speed, 0),
    jump: toNumberSafe(raw?.jump, 0),
    bossDamage: toNumberSafe(raw?.boss_damage, 0),
    ignoreMonsterArmor: toNumberSafe(raw?.ignore_monster_armor, 0),
    allStat: toNumberSafe(raw?.all_stat, 0),
    damage: toNumberSafe(raw?.damage, 0),
    equipmentLevelDecrease: toNumberSafe(raw?.equipment_level_decrease, 0),
    maxHpRate: toNumberSafe(raw?.max_hp_rate, 0),
    maxMpRate: toNumberSafe(raw?.max_mp_rate, 0),
  };
}

function toClassType(characterClass: string | null | undefined): ClassType {
  if (!characterClass) return '초보자';

  for (const group of Object.values(classGroups)) {
    for (const affiliation of Object.values(group.affiliations)) {
      if (affiliation.classes.includes(characterClass)) {
        return group.classType;
      }
    }
  }

  return '초보자';
}

function toEquipmentCategory(slot: string | null | undefined): string {
  if (!slot) return '';

  return equipmentSlotMetaMap[slot as EquipmentSlot]?.category ?? '';
}

function toBaseEquipment(raw: ItemRaw, characterClass: string | null | undefined) {
  const baseLevel = raw.item_base_option?.base_equipment_level ?? 0;

  return {
    baseLevel,
    name: raw.item_name ?? '',
    part: raw.item_equipment_part ?? '',
    category: toEquipmentCategory(raw.item_equipment_slot),
    classType: toClassType(characterClass),
    slot: raw.item_equipment_slot ?? '',
    icon: raw.item_icon ?? '',
    description: raw.item_description,
    shapeName: raw.item_shape_name ?? '',
    shapeIcon: raw.item_shape_icon ?? '',
    gender: raw.item_gender,
    dateExpire: raw.date_expire,
    freestyleFlag: toBooleanByFlag(raw.freestyle_flag ?? '0'),
    starforce: toNumberSafe(raw.starforce, 0),
    starforceLimit: getMaxStarforceByBaseLevel(baseLevel),
    cuttableCount: toNumberSafe(raw.cuttable_count, 0),
    scrollUpgrade: toNumberSafe(raw.scroll_upgrade, 0),
    scrollUpgradableCount: toNumberSafe(raw.scroll_upgradable_count, 0),
    soulName: raw.soul_name,
    soulOption: raw.soul_option,
    starforceScrollFlag: toBooleanByFlag(raw.starforce_scroll_flag ?? '0'),
    specialRingLevel: raw.special_ring_level ?? 0,
    growthExp: raw.growth_exp ?? 0,
    growthLevel: raw.growth_level ?? 0,
    options: {
      total: toEquipmentOption(raw.item_total_option),
      base: toEquipmentOption(raw.item_base_option),
      add: toEquipmentOption(raw.item_add_option),
      starforce: toEquipmentOption(raw.item_starforce_option),
      scroll: toEquipmentOption(raw.item_etc_option),
      exceptional: toEquipmentOption(raw.item_exceptional_option),
    },
  };
}

function hasPotentialOption(raw: {
  potential_option_grade?: string | null;
  potential_option_1?: string | null;
  potential_option_2?: string | null;
  potential_option_3?: string | null;
}): boolean {
  return [raw.potential_option_grade, raw.potential_option_1, raw.potential_option_2, raw.potential_option_3].some((value) => value != null);
}

function hasAdditionalPotentialOption(raw: {
  additional_potential_option_grade?: string | null;
  additional_potential_option_1?: string | null;
  additional_potential_option_2?: string | null;
  additional_potential_option_3?: string | null;
}): boolean {
  return [raw.additional_potential_option_grade, raw.additional_potential_option_1, raw.additional_potential_option_2, raw.additional_potential_option_3].some(
    (value) => value != null,
  );
}

function toItemEquipment(raw: MainItemRaw | PresetItemRaw, characterClass: string | null | undefined): ItemEquipment {
  const potentialFlag = 'potential_option_flag' in raw ? toBooleanByFlag(raw.potential_option_flag ?? '0') : hasPotentialOption(raw);
  const additionalFlag = 'additional_potential_option_flag' in raw ? toBooleanByFlag(raw.additional_potential_option_flag ?? '0') : hasAdditionalPotentialOption(raw);

  return {
    ...toBaseEquipment(raw, characterClass),
    potentialGrade: raw.potential_option_grade,
    potentialFlag,
    potential1: raw.potential_option_1,
    potential2: raw.potential_option_2,
    potential3: raw.potential_option_3,
    additionalGrade: raw.additional_potential_option_grade,
    additionalFlag,
    additional1: raw.additional_potential_option_1,
    additional2: raw.additional_potential_option_2,
    additional3: raw.additional_potential_option_3,
  };
}

function toClassExclusiveEquipment(raw: ClassExclusiveItemRaw, characterClass: string | null | undefined): DragonEquipment | MechanicEquipment {
  return toBaseEquipment(raw, characterClass);
}

function toTitle(raw: ItemEquipmentRaw['title']): Title | null {
  if (!raw) return null;

  return {
    titleName: raw.title_name ?? '',
    titleIcon: raw.title_icon ?? '',
    titleDescription: raw.title_description ?? '',
    dateExpire: raw.date_expire,
    dateOptionExpire: raw.date_option_expire,
    titleShapeName: raw.title_shape_name ?? '',
    titleShapeIcon: raw.title_shape_icon ?? '',
    titleShapeDescription: raw.title_shape_description ?? '',
  };
}

function toMedalShape(raw: ItemEquipmentRaw['medal_shape']): MedalShape | null {
  if (!raw) return null;

  return {
    name: raw.medal_shape_name ?? '',
    icon: raw.medal_shape_icon ?? '',
    description: raw.medal_shape_description,
    changedName: raw.medal_shape_changed_name ?? '',
    changedIcon: raw.medal_shape_changed_icon ?? '',
    changedDescription: raw.medal_shape_changed_description,
  };
}

function toHairStyle(raw: AndroidRaw['android_hair']): AndroidEquipment['style']['hair'] {
  if (!raw) return null;
  if (raw.hair_name == null && raw.base_color == null && raw.mix_color == null) {
    return null;
  }

  return {
    name: raw.hair_name ?? '',
    baseColor: raw.base_color ?? '',
    mixColor: raw.mix_color ?? '',
    mixRate: toNumberSafe(raw.mix_rate, 0),
    freestyleFlag: toBooleanByFlag(raw.freestyle_flag ?? '0'),
  };
}

function toFaceStyle(raw: AndroidRaw['android_face']): AndroidEquipment['style']['face'] {
  if (!raw) return null;
  if (raw.face_name == null && raw.base_color == null && raw.mix_color == null) {
    return null;
  }

  return {
    name: raw.face_name ?? '',
    baseColor: raw.base_color ?? '',
    mixColor: raw.mix_color ?? '',
    mixRate: toNumberSafe(raw.mix_rate, 0),
    freestyleFlag: toBooleanByFlag(raw.freestyle_flag ?? '0'),
  };
}

function toSkinStyle(raw: AndroidRaw['android_skin']): AndroidEquipment['style']['skin'] {
  if (!raw) return null;

  return {
    name: raw.skin_name ?? '',
    colorStyle: raw.color_style ?? '',
    hue: toNumberSafe(raw.hue, 0),
    saturation: toNumberSafe(raw.saturation, 0),
    brightness: toNumberSafe(raw.brightness, 0),
  };
}

function toBeautyState(hair: AndroidRaw['android_hair'], face: AndroidRaw['android_face'], skin: AndroidRaw['android_skin']): AndroidEquipment['style'] {
  return {
    hair: toHairStyle(hair),
    face: toFaceStyle(face),
    skin: toSkinStyle(skin),
  };
}

function toAndroidCashItemOption(raw: NonNullable<AndroidCashItemRaw['cash_item_option']>[number]) {
  return {
    type: raw.option_type ?? '',
    value: raw.option_value ?? '',
  };
}

function toAndroidColoringPrism(raw: AndroidCashItemRaw['cash_item_coloring_prism']) {
  if (!raw) return null;

  return {
    colorRange: raw.color_range ?? '',
    hue: toNumberSafe(raw.hue, 0),
    saturation: toNumberSafe(raw.saturation, 0),
    value: toNumberSafe(raw.value, 0),
  };
}

function toAndroidCashItem(raw: AndroidCashItemRaw): AndroidEquipment['cashItemInfo'][number] {
  return {
    part: raw.cash_item_equipment_part ?? '',
    slot: raw.cash_item_equipment_slot ?? '',
    name: raw.cash_item_name ?? '',
    icon: raw.cash_item_icon ?? '',
    description: raw.cash_item_description,
    option: (raw.cash_item_option ?? []).map(toAndroidCashItemOption),
    dateExpire: raw.date_expire,
    dateOptionExpire: raw.date_option_expire,
    label: raw.cash_item_label,
    coloringPrism: toAndroidColoringPrism(raw.cash_item_coloring_prism),
    gender: raw.android_item_gender,
    freestyleFlag: toBooleanByFlag(raw.freestyle_flag ?? '0'),
  };
}

function hasAndroidIdentity(raw: {
  android_name?: string | null;
  android_nickname?: string | null;
  android_icon?: string | null;
  android_description?: string | null;
  android_gender?: string | null;
  android_grade?: string | number | null;
  android_non_humanoid_flag?: string | null;
  android_shop_usable_flag?: string | null;
}): boolean {
  return [
    raw.android_name,
    raw.android_nickname,
    raw.android_icon,
    raw.android_description,
    raw.android_gender,
    raw.android_grade,
    raw.android_non_humanoid_flag,
    raw.android_shop_usable_flag,
  ].some((value) => value != null);
}

function toAndroidEquipment(
  raw: AndroidRaw | NonNullable<AndroidRaw['android_preset_1']> | NonNullable<AndroidRaw['android_preset_2']> | NonNullable<AndroidRaw['android_preset_3']> | null | undefined,
): AndroidEquipment | null {
  if (!raw) return null;

  const style = toBeautyState(raw.android_hair, raw.android_face, raw.android_skin);
  const cashItemInfo = 'android_cash_item_equipment' in raw ? (raw.android_cash_item_equipment ?? []).map(toAndroidCashItem) : [];
  const hasStyle = Boolean(style.hair || style.face || style.skin);

  if (!hasAndroidIdentity(raw) && !hasStyle && cashItemInfo.length === 0) {
    return null;
  }

  return {
    name: raw.android_name ?? '',
    nickname: raw.android_nickname ?? '',
    icon: raw.android_icon ?? '',
    description: raw.android_description ?? '',
    style: hasStyle ? style : EMPTY_BEAUTY_STATE,
    cashItemInfo,
    earSensorClipFlag: toBooleanByFlag(raw.android_ear_sensor_clip_flag ?? '0'),
    gender: raw.android_gender ?? '',
    grade: raw.android_grade == null ? 0 : toNumberSafe(raw.android_grade, 0),
    nonHumanoidFlag: raw.android_non_humanoid_flag ?? '',
    shopUsableFlag: toBooleanByFlag(raw.android_shop_usable_flag ?? '0'),
  };
}

export function toCharacterEquipment(raw: ItemEquipmentRaw, androidRaw?: AndroidRaw | null): CharacterEquipment {
  const characterClass = raw.character_class;
  const dragonEquipment = (raw.dragon_equipment ?? []).map((item) => toClassExclusiveEquipment(item, characterClass));
  const mechanicEquipment = (raw.mechanic_equipment ?? []).map((item) => toClassExclusiveEquipment(item, characterClass));

  const presets: EquipmentPreset[] = ITEM_PRESET_KEYS.map((itemPresetKey, index) => {
    const androidPresetKey = ANDROID_PRESET_KEYS[index];

    return {
      no: index + 1,
      itemEquipment: (raw[itemPresetKey] ?? []).map((item) => toItemEquipment(item, characterClass)),
      dragonEquipment,
      mechanicEquipment,
      androidEquipment: toAndroidEquipment(androidRaw?.[androidPresetKey] ?? null),
    };
  });

  return {
    itemEquipment: (raw.item_equipment ?? []).map((item) => toItemEquipment(item, characterClass)),
    dragonEquipment,
    mechanicEquipment,
    androidEquipment: toAndroidEquipment(androidRaw ?? null),
    title: toTitle(raw.title),
    medalShape: toMedalShape(raw.medal_shape),
    presetNo: raw.preset_no ?? 0,
    presets,
  };
}
