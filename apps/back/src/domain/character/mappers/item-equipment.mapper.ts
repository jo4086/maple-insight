import type {
  CharacterItem,
  ClassExclusiveItemEquipment,
  ItemBaseOption,
  ItemExceptionalOption,
  ItemMetadata,
  ItemOption,
  ItemOptionSet,
  ItemUpgradeInfo,
  MainItemEquipment,
  MainItemPotentials,
  MedalShape,
  ItemPresets,
  PresetItemEquipment,
  PresetItemPotentials,
  Title,
} from '@maple/types';
import { toBooleanByFlag } from 'src/utils/boolean';
import { toNumberSafe } from 'src/utils/number';

import type { ItemEquipmentRaw } from '../types/item-equipment.raw';

type MainItemRaw = NonNullable<ItemEquipmentRaw['item_equipment']>[number];
type PresetItemRaw = NonNullable<ItemEquipmentRaw['item_equipment_preset_1']>[number];
type ClassExclusiveItemRaw = NonNullable<ItemEquipmentRaw['dragon_equipment']>[number];
type FullItemOptionRaw = MainItemRaw['item_total_option'];
type PartialItemOptionRaw = MainItemRaw['item_add_option'] | MainItemRaw['item_etc_option'] | MainItemRaw['item_starforce_option'];
type PresetKey = 'item_equipment_preset_1' | 'item_equipment_preset_2' | 'item_equipment_preset_3';
const PRESET_KEYS: PresetKey[] = ['item_equipment_preset_1', 'item_equipment_preset_2', 'item_equipment_preset_3'];

function toItemOption(raw: FullItemOptionRaw | PartialItemOptionRaw | null): ItemOption {
  return {
    str: toNumberSafe(raw?.str ?? '0'),
    dex: toNumberSafe(raw?.dex ?? '0'),
    int: toNumberSafe(raw?.int ?? '0'),
    luk: toNumberSafe(raw?.luk ?? '0'),
    maxHp: toNumberSafe(raw?.max_hp ?? '0'),
    maxMp: toNumberSafe(raw?.max_mp ?? '0'),
    attackPower: toNumberSafe(raw?.attack_power ?? '0'),
    magicPower: toNumberSafe(raw?.magic_power ?? '0'),
    armor: toNumberSafe(raw?.armor ?? '0'),
    speed: toNumberSafe(raw?.speed ?? '0'),
    jump: toNumberSafe(raw?.jump ?? '0'),
    bossDamage: raw && 'boss_damage' in raw ? toNumberSafe(raw.boss_damage ?? '0') : undefined,
    ignoreMonsterArmor: raw && 'ignore_monster_armor' in raw ? toNumberSafe(raw.ignore_monster_armor ?? '0') : undefined,
    allStat: raw && 'all_stat' in raw ? toNumberSafe(raw.all_stat ?? '0') : undefined,
    damage: raw && 'damage' in raw ? toNumberSafe(raw.damage ?? '0') : undefined,
    equipmentLevelDecrease: raw && 'equipment_level_decrease' in raw ? (raw.equipment_level_decrease ?? 0) : undefined,
    maxHpRate: raw && 'max_hp_rate' in raw ? toNumberSafe(raw.max_hp_rate ?? '0') : undefined,
    maxMpRate: raw && 'max_mp_rate' in raw ? toNumberSafe(raw.max_mp_rate ?? '0') : undefined,
  };
}

function toItemBaseOption(raw: MainItemRaw['item_base_option'] | null): ItemBaseOption {
  return {
    ...toItemOption(raw),
    baseEquipmentLevel: raw?.base_equipment_level ?? 0,
  };
}

function toItemExceptionalOption(raw: MainItemRaw['item_exceptional_option'] | null): ItemExceptionalOption {
  return {
    str: toNumberSafe(raw?.str ?? '0'),
    dex: toNumberSafe(raw?.dex ?? '0'),
    int: toNumberSafe(raw?.int ?? '0'),
    luk: toNumberSafe(raw?.luk ?? '0'),
    maxHp: toNumberSafe(raw?.max_hp ?? '0'),
    maxMp: toNumberSafe(raw?.max_mp ?? '0'),
    attackPower: toNumberSafe(raw?.attack_power ?? '0'),
    magicPower: toNumberSafe(raw?.magic_power ?? '0'),
    exceptionalUpgrade: raw?.exceptional_upgrade ?? 0,
  };
}

function toClassExclusiveExceptionalOption(raw: ClassExclusiveItemRaw['item_exceptional_option'] | null): ItemOption {
  return {
    str: toNumberSafe(raw?.str ?? '0'),
    dex: toNumberSafe(raw?.dex ?? '0'),
    int: toNumberSafe(raw?.int ?? '0'),
    luk: toNumberSafe(raw?.luk ?? '0'),
    maxHp: toNumberSafe(raw?.max_hp ?? '0'),
    maxMp: toNumberSafe(raw?.max_mp ?? '0'),
    attackPower: toNumberSafe(raw?.attack_power ?? '0'),
    magicPower: toNumberSafe(raw?.magic_power ?? '0'),
  };
}

function toMainItemOptions(raw: MainItemRaw): ItemOptionSet {
  return {
    total: toItemOption(raw.item_total_option),
    base: toItemBaseOption(raw.item_base_option),
    exceptional: toItemExceptionalOption(raw.item_exceptional_option),
    add: toItemOption(raw.item_add_option),
    etc: toItemOption(raw.item_etc_option),
    starforce: toItemOption(raw.item_starforce_option),
  };
}

function toPresetItemOptions(raw: PresetItemRaw): ItemOptionSet {
  return {
    total: toItemOption(raw.item_total_option),
    base: toItemBaseOption(raw.item_base_option),
    exceptional: toItemExceptionalOption(raw.item_exceptional_option),
    add: toItemOption(raw.item_add_option),
    etc: toItemOption(raw.item_etc_option),
    starforce: toItemOption(raw.item_starforce_option),
  };
}

function toClassExclusiveItemOptions(raw: ClassExclusiveItemRaw): ItemOptionSet<ItemOption> {
  return {
    total: toItemOption(raw.item_total_option),
    base: toItemBaseOption(raw.item_base_option),
    exceptional: toClassExclusiveExceptionalOption(raw.item_exceptional_option),
    add: toItemOption(raw.item_add_option),
    etc: toItemOption(raw.item_etc_option),
    starforce: toItemOption(raw.item_starforce_option),
  };
}

function toMainItemPotentials(raw: MainItemRaw): MainItemPotentials {
  return {
    potential: {
      grade: raw.potential_option_grade,
      flag: toBooleanByFlag(raw.potential_option_flag ?? '0'),
      option1: raw.potential_option_1,
      option2: raw.potential_option_2,
      option3: raw.potential_option_3,
    },
    additional: {
      grade: raw.additional_potential_option_grade,
      flag: toBooleanByFlag(raw.additional_potential_option_flag ?? '0'),
      option1: raw.additional_potential_option_1,
      option2: raw.additional_potential_option_2,
      option3: raw.additional_potential_option_3,
    },
  };
}

function toPresetItemPotentials(raw: PresetItemRaw): PresetItemPotentials {
  return {
    potential: {
      grade: raw.potential_option_grade,
      option1: raw.potential_option_1,
      option2: raw.potential_option_2,
      option3: raw.potential_option_3,
    },
    additional: {
      grade: raw.additional_potential_option_grade,
      option1: raw.additional_potential_option_1,
      option2: raw.additional_potential_option_2,
      option3: raw.additional_potential_option_3,
    },
  };
}

function toUpgradeInfo(raw: MainItemRaw | PresetItemRaw | ClassExclusiveItemRaw): ItemUpgradeInfo {
  return {
    growthExp: raw.growth_exp ?? 0,
    growthLevel: raw.growth_level ?? 0,
    scrollUpgrade: toNumberSafe(raw.scroll_upgrade ?? '0'),
    cuttableCount: toNumberSafe(raw.cuttable_count ?? '0'),
    goldenHammerFlag: toBooleanByFlag(raw.golden_hammer_flag ?? '0'),
    scrollResilienceCount: toNumberSafe(raw.scroll_resilience_count ?? '0'),
    scrollUpgradableCount: toNumberSafe(raw.scroll_upgradable_count ?? '0'),
    soulName: raw.soul_name,
    soulOption: raw.soul_option,
    starforce: toNumberSafe(raw.starforce ?? '0'),
    starforceScrollFlag: raw.starforce_scroll_flag ?? '0',
  };
}

function toMainMetadata(raw: MainItemRaw): ItemMetadata {
  return {
    part: raw.item_equipment_part ?? '',
    slot: raw.item_equipment_slot ?? '',
    name: raw.item_name ?? '',
    icon: raw.item_icon ?? '',
    description: raw.item_description,
    shapeName: raw.item_shape_name ?? '',
    shapeIcon: raw.item_shape_icon ?? '',
    gender: raw.item_gender,
  };
}

function toSecondaryMetadata(raw: PresetItemRaw | ClassExclusiveItemRaw): ItemMetadata {
  return {
    part: raw.item_equipment_part ?? '',
    slot: raw.item_equipment_slot ?? '',
    name: raw.item_name ?? '',
    icon: raw.item_icon ?? '',
    description: raw.item_description,
    shapeName: raw.item_shape_name ?? '',
    shapeIcon: raw.item_shape_icon ?? '',
    gender: raw.item_gender,
  };
}

function toMainItemEquipment(raw: MainItemRaw): MainItemEquipment {
  return {
    ...toMainMetadata(raw),
    itemOptions: toMainItemOptions(raw),
    potentials: toMainItemPotentials(raw),
    upgrade: toUpgradeInfo(raw),
    equipmentLevelIncrease: raw.equipment_level_increase ?? 0,
    specialRingLevel: raw.special_ring_level ?? 0,
    dateExpire: raw.date_expire,
    freestyleFlag: toBooleanByFlag(raw.freestyle_flag ?? '0'),
  };
}

function toPresetItemEquipment(raw: PresetItemRaw): PresetItemEquipment {
  return {
    ...toSecondaryMetadata(raw),
    itemOptions: toPresetItemOptions(raw),
    potentials: toPresetItemPotentials(raw),
    upgrade: toUpgradeInfo(raw),
    equipmentLevelIncrease: raw.equipment_level_increase ?? 0,
    specialRingLevel: raw.special_ring_level ?? 0,
    dateExpire: raw.date_expire,
    freestyleFlag: toBooleanByFlag(raw.freestyle_flag ?? '0'),
  };
}

function toClassExclusiveItemEquipment(raw: ClassExclusiveItemRaw): ClassExclusiveItemEquipment {
  return {
    ...toSecondaryMetadata(raw),
    itemOptions: toClassExclusiveItemOptions(raw),
    upgrade: toUpgradeInfo(raw),
    equipmentLevelIncrease: raw.equipment_level_increase ?? 0,
    specialRingLevel: raw.special_ring_level ?? 0,
    dateExpire: raw.date_expire,
    freestyleFlag: toBooleanByFlag(raw.freestyle_flag ?? '0'),
  };
}

function toTitle(raw: ItemEquipmentRaw['title']): Title | null {
  if (!raw) return null;
  return {
    name: raw.title_name ?? '',
    icon: raw.title_icon ?? '',
    description: raw.title_description,
    dateExpire: raw.date_expire,
    dateOptionExpire: raw.date_option_expire ?? '',
    shapeName: raw.title_shape_name ?? '',
    shapeIcon: raw.title_shape_icon ?? '',
    shapeDescription: raw.title_shape_description,
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

export function toCharacterItem(raw: ItemEquipmentRaw): CharacterItem {
  const presets: ItemPresets[] = PRESET_KEYS.map((presetKey, index) => {
    return {
      no: index + 1,
      info: (raw[presetKey] ?? []).map(toPresetItemEquipment),
    };
  });

  return {
    date: raw.date,
    characterGender: raw.character_gender ?? '',
    characterClass: raw.character_class ?? '',
    presetNo: raw.preset_no ?? 0,
    itemEquipment: (raw.item_equipment ?? []).map(toMainItemEquipment),
    presets,
    title: toTitle(raw.title),
    medalShape: toMedalShape(raw.medal_shape),
    dragonEquipment: (raw.dragon_equipment ?? []).map(toClassExclusiveItemEquipment),
    mechanicEquipment: (raw.mechanic_equipment ?? []).map(toClassExclusiveItemEquipment),
  };
}
