import type { ItemEquipmentRaw, ItemOptionRaw, AndroidRaw } from '@maple/api-character';
import type { EquipmentSlot, AndroidEquipment, CharacterEquipment, DragonEquipment, ItemEquipment, MedalShape, MechanicEquipment, Title } from '@maple/contracts';
import type { EquipmentClassType } from '@maple/data-class';
import { specialRingBaseItemNames } from '@maple/data-equipment';
import {
  generatedAccessoryEquipment,
  generatedAdditionalPotentialOptionTextsByPartGrade,
  generatedArmorEquipment,
  generatedPotentialOptionTextsByPartGrade,
  generatedSubWeaponEquipment,
  generatedWeaponEquipment,
} from '@maple/generator/generated';

import { equipmentSlotMetaMap } from '../../equipment/equipment-slot-meta';
import { getClassMeta } from '../constants/classMetaMap';
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
type EquipmentOptionRaw =
  | {
      [K in keyof ItemOptionRaw]?: ItemOptionRaw[K] | null;
    }
  | null
  | undefined;

const ITEM_PRESET_KEYS: ItemPresetKey[] = ['item_equipment_preset_1', 'item_equipment_preset_2', 'item_equipment_preset_3'];
const ANDROID_PRESET_KEYS: AndroidPresetKey[] = ['android_preset_1', 'android_preset_2', 'android_preset_3'];
const EMPTY_BEAUTY_STATE: AndroidEquipment['style'] = {
  hair: null,
  face: null,
  skin: null,
};

const JOB_GROUP_CLASS_TYPE_MAP = {
  warrior: '전사',
  mage: '마법사',
  archer: '궁수',
  thief: '도적',
  pirate: '해적',
} as const;

const POTENTIAL_GRADE_ORDER = ['normal', 'rare', 'epic', 'unique', 'legendary'] as const;
const POTENTIAL_GRADE_KEY_MAP = {
  노멀: 'normal',
  레어: 'rare',
  에픽: 'epic',
  유니크: 'unique',
  레전드리: 'legendary',
} as const;

type PotentialGradeKey = (typeof POTENTIAL_GRADE_ORDER)[number];
type PotentialPartGradeMap = Record<string, Record<string, Partial<Record<PotentialGradeKey, readonly string[]>> | undefined> | undefined>;
type GeneratedEquipmentRow = {
  name: string;
  baseName?: string | null;
  setName: ItemEquipment['setName'];
  category: string;
  part: string;
  requiredClass: EquipmentClassType | readonly EquipmentClassType[];
  classGroup: EquipmentClassType | null;
  grantedSkills: string[];
  specialRingLevel: number;
  potentialEnabled: boolean;
  starforceEnabled: boolean;
  scrollUpgradeEnabled: boolean;
  addOptionEnabled: boolean;
};

const DEFAULT_EQUIPMENT_CAPABILITY = {
  potentialEnabled: true,
  starforceEnabled: true,
  scrollUpgradeEnabled: true,
  addOptionEnabled: true,
} as const;

const DISABLED_EQUIPMENT_CAPABILITY = {
  potentialEnabled: false,
  starforceEnabled: false,
  scrollUpgradeEnabled: false,
  addOptionEnabled: false,
} as const;

const equipmentMetaByItemName = new Map<string, GeneratedEquipmentRow>(
  [...generatedArmorEquipment, ...generatedWeaponEquipment, ...generatedAccessoryEquipment, ...generatedSubWeaponEquipment].map((item) => {
    const { name } = item as GeneratedEquipmentRow;

    return [name, item as GeneratedEquipmentRow];
  }),
);
const equipmentMetaByNormalizedItemName = new Map<string, GeneratedEquipmentRow>(
  [...generatedArmorEquipment, ...generatedWeaponEquipment, ...generatedAccessoryEquipment, ...generatedSubWeaponEquipment].map((item) => {
    const { name } = item as GeneratedEquipmentRow;

    return [normalizeEquipmentName(name), item as GeneratedEquipmentRow];
  }),
);
const specialRingMetaByBaseNameAndLevel = new Map<string, GeneratedEquipmentRow>(
  generatedAccessoryEquipment.flatMap((item) => {
    const row = item as GeneratedEquipmentRow;

    if (!row.baseName || row.specialRingLevel <= 0) return [];

    return [[createSpecialRingMetaKey(row.baseName, row.specialRingLevel), row]];
  }),
);
const specialRingBaseItemNameSet = new Set<string>(specialRingBaseItemNames.map(normalizeEquipmentName));

const potentialPartGradeMap = generatedPotentialOptionTextsByPartGrade as PotentialPartGradeMap;
const additionalPotentialPartGradeMap = generatedAdditionalPotentialOptionTextsByPartGrade as PotentialPartGradeMap;

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

function toClassType(characterClass: string | null | undefined): EquipmentClassType {
  if (!characterClass) return '공용';

  const classMeta = getClassMeta(characterClass);

  if (classMeta) return JOB_GROUP_CLASS_TYPE_MAP[classMeta.primaryGroup];

  return '공용';
}

function toEquipmentClassType(generatedMeta: GeneratedEquipmentRow | null, characterClass: string | null | undefined): EquipmentClassType {
  if (!generatedMeta) return toClassType(characterClass);

  if (typeof generatedMeta.requiredClass === 'string') {
    return generatedMeta.requiredClass;
  }

  if (generatedMeta.requiredClass.length === 1) {
    return generatedMeta.requiredClass[0];
  }

  return generatedMeta.classGroup ?? '공용';
}

function toEquipmentCategory(slot: string | null | undefined): string {
  if (!slot) return '';

  return equipmentSlotMetaMap[slot as EquipmentSlot]?.category ?? '';
}

function toPotentialPart(raw: Pick<ItemRaw, 'item_equipment_part' | 'item_equipment_slot'>): string {
  const slotMeta = equipmentSlotMetaMap[raw.item_equipment_slot as EquipmentSlot] ?? null;

  return slotMeta?.displayName ?? raw.item_equipment_part ?? raw.item_equipment_slot ?? '';
}

function toEquipmentDisplayPart(raw: Pick<ItemRaw, 'item_equipment_part' | 'item_equipment_slot'>): string {
  const slotMeta = equipmentSlotMetaMap[raw.item_equipment_slot as EquipmentSlot] ?? null;

  return slotMeta?.displayName ?? raw.item_equipment_part ?? raw.item_equipment_slot ?? '';
}

function isMedalEquipment(raw: Pick<ItemRaw, 'item_equipment_part' | 'item_equipment_slot'>) {
  return toEquipmentDisplayPart(raw) === '훈장';
}

function toPotentialPartKey(part: string): string {
  if (part === '기계 심장') return '기계심장';
  if (part === '목걸이') return '펜던트';

  return part;
}

function resolvePotentialPart(raw: ItemRaw, generatedMeta: GeneratedEquipmentRow | null): string {
  if (generatedMeta?.category === '무기') return '무기';
  if (generatedMeta?.category === '보조무기') return '보조무기';

  return toPotentialPartKey(generatedMeta?.part ?? toPotentialPart(raw));
}

function normalizePotentialGrade(grade: string | null | undefined): PotentialGradeKey | null {
  if (!grade) return null;

  const normalized = grade.trim();

  if (POTENTIAL_GRADE_ORDER.includes(normalized as PotentialGradeKey)) {
    return normalized as PotentialGradeKey;
  }

  return POTENTIAL_GRADE_KEY_MAP[normalized as keyof typeof POTENTIAL_GRADE_KEY_MAP] ?? null;
}

function getPotentialCandidateGrades(topGrade: PotentialGradeKey | null): PotentialGradeKey[] {
  if (!topGrade) return [...POTENTIAL_GRADE_ORDER].reverse();

  const topGradeIndex = POTENTIAL_GRADE_ORDER.indexOf(topGrade);
  const lowerGrade = POTENTIAL_GRADE_ORDER[topGradeIndex - 1] ?? null;

  return lowerGrade ? [topGrade, lowerGrade] : [topGrade];
}

function inferPotentialLineGrade({
  baseLevel,
  part,
  option,
  topGrade,
  partGradeMap,
}: {
  baseLevel: number;
  part: string;
  option: string | null | undefined;
  topGrade: string | null | undefined;
  partGradeMap: PotentialPartGradeMap;
}) {
  if (!option) return null;

  const normalizedTopGrade = normalizePotentialGrade(topGrade);
  const candidateGrades = getPotentialCandidateGrades(normalizedTopGrade);
  const gradeMap = partGradeMap[String(baseLevel)]?.[part];

  if (!gradeMap) return null;

  for (const candidateGrade of candidateGrades) {
    if (gradeMap[candidateGrade]?.includes(option)) {
      return candidateGrade;
    }
  }

  return null;
}

function toPotentialLine({
  baseLevel,
  part,
  option,
  topGrade,
  partGradeMap,
}: {
  baseLevel: number;
  part: string;
  option: string | null | undefined;
  topGrade: string | null | undefined;
  partGradeMap: PotentialPartGradeMap;
}) {
  return {
    option: option ?? null,
    grade: inferPotentialLineGrade({ baseLevel, part, option, topGrade, partGradeMap }),
  };
}

function toEquipmentGeneratedMetaByName(itemName: string | null | undefined) {
  if (!itemName) return null;

  return equipmentMetaByItemName.get(itemName) ?? equipmentMetaByNormalizedItemName.get(normalizeEquipmentName(itemName)) ?? null;
}

function toEquipmentGeneratedMeta(raw: Pick<ItemRaw, 'item_name' | 'special_ring_level'>) {
  const specialRingLevel = toNumberSafe(raw.special_ring_level, 0);

  if (raw.item_name && specialRingLevel > 0 && specialRingBaseItemNameSet.has(normalizeEquipmentName(raw.item_name))) {
    const specialRingMeta = specialRingMetaByBaseNameAndLevel.get(createSpecialRingMetaKey(raw.item_name, specialRingLevel));

    if (specialRingMeta) return specialRingMeta;
  }

  const exactMeta = toEquipmentGeneratedMetaByName(raw.item_name);

  if (exactMeta) return exactMeta;

  if (!raw.item_name || specialRingLevel <= 0) return null;

  return toEquipmentGeneratedMetaByName(`${raw.item_name} Lv.${specialRingLevel}`);
}

function normalizeEquipmentName(name: string) {
  return name.replace(/\s+/g, '');
}

function createSpecialRingMetaKey(baseName: string, level: number) {
  return `${normalizeEquipmentName(baseName)}:${level}`;
}

function toEquipmentCapability(raw: ItemRaw) {
  const generatedMeta = toEquipmentGeneratedMeta(raw);
  const fallbackCapability = toFallbackEquipmentCapability(raw);

  return {
    ...fallbackCapability,
    potentialEnabled: generatedMeta?.potentialEnabled ?? fallbackCapability.potentialEnabled,
    starforceEnabled: generatedMeta?.starforceEnabled ?? fallbackCapability.starforceEnabled,
    scrollUpgradeEnabled: generatedMeta?.scrollUpgradeEnabled ?? fallbackCapability.scrollUpgradeEnabled,
    addOptionEnabled: generatedMeta?.addOptionEnabled ?? fallbackCapability.addOptionEnabled,
  };
}

function toFallbackEquipmentCapability(raw: ItemRaw) {
  const part = toEquipmentDisplayPart(raw);

  if (part === '훈장' || part === '드래곤 장비' || part === '메카닉 장비') {
    return DISABLED_EQUIPMENT_CAPABILITY;
  }

  return DEFAULT_EQUIPMENT_CAPABILITY;
}

function toScrollInfo(raw: ItemRaw) {
  const scrollUpgrade = toNumberSafe(raw.scroll_upgrade, 0);
  const scrollUpgradeableCount = toNumberSafe(raw.scroll_upgradeable_count, 0);
  const scrollResilienceCount = toNumberSafe(raw.scroll_resilience_count, 0);

  return {
    scrollUpgrade,
    scrollFlag: !(scrollResilienceCount === 0 && scrollUpgrade === 0),
    scrollUpgradeableCount,
    scrollResilienceCount,
    scrollCount: scrollUpgrade + scrollUpgradeableCount + scrollResilienceCount,
  };
}

function toBaseEquipment(raw: ItemRaw, characterClass: string | null | undefined) {
  const baseLevel = raw.item_base_option?.base_equipment_level ?? 0;
  const generatedMeta = toEquipmentGeneratedMeta(raw);
  const capability = toEquipmentCapability(raw);

  return {
    baseLevel,
    name: raw.item_name ?? '',
    setName: generatedMeta?.setName ?? null,
    grantedSkills: generatedMeta?.grantedSkills ?? [],
    part: raw.item_equipment_part ?? '',
    category: toEquipmentCategory(raw.item_equipment_slot),
    classType: isMedalEquipment(raw) ? '공용' : toEquipmentClassType(generatedMeta, characterClass),
    slot: raw.item_equipment_slot ?? '',
    icon: raw.item_icon ?? '',
    description: raw.item_description,
    shapeName: raw.item_shape_name ?? '',
    shapeIcon: raw.item_shape_icon ?? '',
    gender: raw.item_gender,
    dateExpire: raw.date_expire,
    freestyleFlag: toBooleanByFlag(raw.freestyle_flag ?? '0'),
    starforce: toNumberSafe(raw.starforce, 0),
    starforceLimit: capability.starforceEnabled ? getMaxStarforceByBaseLevel(baseLevel) : 0,
    starforceEnabled: capability.starforceEnabled,
    potentialEnabled: capability.potentialEnabled,
    scrollUpgradeEnabled: capability.scrollUpgradeEnabled,
    addOptionEnabled: capability.addOptionEnabled,
    cuttableCount: toNumberSafe(raw.cuttable_count, 0),
    ...toScrollInfo(raw),
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
  const baseEquipment = toBaseEquipment(raw, characterClass);
  const generatedMeta = toEquipmentGeneratedMeta(raw);
  const potentialPart = resolvePotentialPart(raw, generatedMeta);

  return {
    ...baseEquipment,
    potential: {
      grade: raw.potential_option_grade,
      flag: potentialFlag,
      options: [
        toPotentialLine({
          baseLevel: baseEquipment.baseLevel,
          part: potentialPart,
          option: raw.potential_option_1,
          topGrade: raw.potential_option_grade,
          partGradeMap: potentialPartGradeMap,
        }),
        toPotentialLine({
          baseLevel: baseEquipment.baseLevel,
          part: potentialPart,
          option: raw.potential_option_2,
          topGrade: raw.potential_option_grade,
          partGradeMap: potentialPartGradeMap,
        }),
        toPotentialLine({
          baseLevel: baseEquipment.baseLevel,
          part: potentialPart,
          option: raw.potential_option_3,
          topGrade: raw.potential_option_grade,
          partGradeMap: potentialPartGradeMap,
        }),
      ],
    },
    additional: {
      grade: raw.additional_potential_option_grade,
      flag: additionalFlag,
      options: [
        toPotentialLine({
          baseLevel: baseEquipment.baseLevel,
          part: potentialPart,
          option: raw.additional_potential_option_1,
          topGrade: raw.additional_potential_option_grade,
          partGradeMap: additionalPotentialPartGradeMap,
        }),
        toPotentialLine({
          baseLevel: baseEquipment.baseLevel,
          part: potentialPart,
          option: raw.additional_potential_option_2,
          topGrade: raw.additional_potential_option_grade,
          partGradeMap: additionalPotentialPartGradeMap,
        }),
        toPotentialLine({
          baseLevel: baseEquipment.baseLevel,
          part: potentialPart,
          option: raw.additional_potential_option_3,
          topGrade: raw.additional_potential_option_grade,
          partGradeMap: additionalPotentialPartGradeMap,
        }),
      ],
    },
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

  const presets: CharacterEquipment['presets'] = ITEM_PRESET_KEYS.map((itemPresetKey, index) => {
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
