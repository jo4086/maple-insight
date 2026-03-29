import { toBooleanByFlag } from 'src/utils/boolean';
import { toNumberSafe } from 'src/utils/number';

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
  PresetItemEquipment,
  PresetItemPotentials,
  Title,
} from '../types/item-equipment';
import type { ItemEquipmentRaw } from '../types/item-equipment.raw';
import { mapPresets } from '../utils/preset';

type MainItemRaw = ItemEquipmentRaw['item_equipment'][number];
type PresetItemRaw = ItemEquipmentRaw['item_equipment_preset_1'][number];
type ClassExclusiveItemRaw = ItemEquipmentRaw['dragon_equipment'][number];
type FullItemOptionRaw = MainItemRaw['item_total_option'];
type PartialItemOptionRaw = MainItemRaw['item_add_option'] | MainItemRaw['item_etc_option'] | MainItemRaw['item_starforce_option'];
type PresetKey = 'item_equipment_preset_1' | 'item_equipment_preset_2' | 'item_equipment_preset_3';
const PRESET_KEYS: PresetKey[] = ['item_equipment_preset_1', 'item_equipment_preset_2', 'item_equipment_preset_3'];

function toItemOption(raw: FullItemOptionRaw | PartialItemOptionRaw): ItemOption {
  return {
    str: toNumberSafe(raw.str),
    dex: toNumberSafe(raw.dex),
    int: toNumberSafe(raw.int),
    luk: toNumberSafe(raw.luk),
    maxHp: toNumberSafe(raw.max_hp),
    maxMp: toNumberSafe(raw.max_mp),
    attackPower: toNumberSafe(raw.attack_power),
    magicPower: toNumberSafe(raw.magic_power),
    armor: toNumberSafe(raw.armor),
    speed: toNumberSafe(raw.speed),
    jump: toNumberSafe(raw.jump),
    bossDamage: 'boss_damage' in raw ? toNumberSafe(raw.boss_damage) : undefined,
    ignoreMonsterArmor: 'ignore_monster_armor' in raw ? toNumberSafe(raw.ignore_monster_armor) : undefined,
    allStat: 'all_stat' in raw ? toNumberSafe(raw.all_stat) : undefined,
    damage: 'damage' in raw ? toNumberSafe(raw.damage) : undefined,
    equipmentLevelDecrease:
      'equipment_level_decrease' in raw ? raw.equipment_level_decrease : undefined,
    maxHpRate: 'max_hp_rate' in raw ? toNumberSafe(raw.max_hp_rate) : undefined,
    maxMpRate: 'max_mp_rate' in raw ? toNumberSafe(raw.max_mp_rate) : undefined,
  };
}

function toItemBaseOption(raw: MainItemRaw['item_base_option']): ItemBaseOption {
  return {
    ...toItemOption(raw),
    baseEquipmentLevel: raw.base_equipment_level,
  };
}

function toItemExceptionalOption(raw: MainItemRaw['item_exceptional_option']): ItemExceptionalOption {
  return {
    str: toNumberSafe(raw.str),
    dex: toNumberSafe(raw.dex),
    int: toNumberSafe(raw.int),
    luk: toNumberSafe(raw.luk),
    maxHp: toNumberSafe(raw.max_hp),
    maxMp: toNumberSafe(raw.max_mp),
    attackPower: toNumberSafe(raw.attack_power),
    magicPower: toNumberSafe(raw.magic_power),
    exceptionalUpgrade: raw.exceptional_upgrade,
  };
}

function toClassExclusiveExceptionalOption(raw: ClassExclusiveItemRaw['item_exceptional_option']): ItemOption {
  return {
    str: toNumberSafe(raw.str),
    dex: toNumberSafe(raw.dex),
    int: toNumberSafe(raw.int),
    luk: toNumberSafe(raw.luk),
    maxHp: toNumberSafe(raw.max_hp),
    maxMp: toNumberSafe(raw.max_mp),
    attackPower: toNumberSafe(raw.attack_power),
    magicPower: toNumberSafe(raw.magic_power),
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
      flag: toBooleanByFlag(raw.potential_option_flag),
      option1: raw.potential_option_1,
      option2: raw.potential_option_2,
      option3: raw.potential_option_3,
    },
    additional: {
      grade: raw.additional_potential_option_grade,
      flag: toBooleanByFlag(raw.additional_potential_option_flag),
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

function toUpgradeInfo(
  raw:
    | MainItemRaw
    | PresetItemRaw
    | ClassExclusiveItemRaw,
): ItemUpgradeInfo {
  return {
    growthExp: raw.growth_exp,
    growthLevel: raw.growth_level,
    scrollUpgrade: toNumberSafe(raw.scroll_upgrade),
    cuttableCount: toNumberSafe(raw.cuttable_count),
    goldenHammerFlag: toBooleanByFlag(raw.golden_hammer_flag),
    scrollResilienceCount: toNumberSafe(raw.scroll_resilience_count),
    scrollUpgradableCount: toNumberSafe(raw.scroll_upgradable_count),
    soulName: raw.soul_name,
    soulOption: raw.soul_option,
    starforce: toNumberSafe(raw.starforce),
    starforceScrollFlag: raw.starforce_scroll_flag,
  };
}

function toMainMetadata(raw: MainItemRaw): ItemMetadata {
  return {
    part: raw.item_equipment_part,
    slot: raw.item_equipment_slot,
    name: raw.item_name,
    icon: raw.item_icon,
    description: raw.item_description,
    shapeName: raw.item_shape_name,
    shapeIcon: raw.item_shape_icon,
    gender: raw.item_gender,
  };
}

function toSecondaryMetadata(raw: PresetItemRaw | ClassExclusiveItemRaw): ItemMetadata {
  return {
    part: raw.item_equipment_part,
    slot: raw.equipment_slot,
    name: raw.item_name,
    icon: raw.item_icon,
    description: raw.item_description,
    shapeName: raw.item_shape_name,
    shapeIcon: raw.item_shape_icon,
    gender: raw.item_gender,
  };
}

function toMainItemEquipment(raw: MainItemRaw): MainItemEquipment {
  return {
    ...toMainMetadata(raw),
    itemOptions: toMainItemOptions(raw),
    potentials: toMainItemPotentials(raw),
    upgrade: toUpgradeInfo(raw),
    equipmentLevelIncrease: raw.equipment_level_increase,
    specialRingLevel: raw.special_ring_level,
    dateExpire: raw.date_expire,
    freestyleFlag: toBooleanByFlag(raw.freestyle_flag),
  };
}

function toPresetItemEquipment(raw: PresetItemRaw): PresetItemEquipment {
  return {
    ...toSecondaryMetadata(raw),
    itemOptions: toPresetItemOptions(raw),
    potentials: toPresetItemPotentials(raw),
    upgrade: toUpgradeInfo(raw),
    equipmentLevelIncrease: raw.equipment_level_increase,
    specialRingLevel: raw.special_ring_level,
    dateExpire: raw.date_expire,
    freestyleFlag: toBooleanByFlag(raw.freestyle_flag),
  };
}

function toClassExclusiveItemEquipment(raw: ClassExclusiveItemRaw): ClassExclusiveItemEquipment {
  return {
    ...toSecondaryMetadata(raw),
    itemOptions: toClassExclusiveItemOptions(raw),
    upgrade: toUpgradeInfo(raw),
    equipmentLevelIncrease: raw.equipment_level_increase,
    specialRingLevel: raw.special_ring_level,
    dateExpire: raw.date_expire,
    freestyleFlag: toBooleanByFlag(raw.freestyle_flag),
  };
}

function toTitle(raw: ItemEquipmentRaw['title']): Title {
  return {
    name: raw.title_name,
    icon: raw.title_icon,
    description: raw.title_description,
    dateExpire: raw.date_expire,
    dateOptionExpire: raw.date_option_expire,
    shapeName: raw.title_shape_name,
    shapeIcon: raw.title_shape_icon,
    shapeDescription: raw.title_shape_description,
  };
}

function toMedalShape(raw: ItemEquipmentRaw['medal_shape']): MedalShape {
  return {
    name: raw.medal_shape_name,
    icon: raw.medal_shape_icon,
    description: raw.medal_shape_description,
    changedName: raw.medal_shape_changed_name,
    changedIcon: raw.medal_shape_changed_icon,
    changedDescription: raw.medal_shape_changed_description,
  };
}

export function toCharacterItem(raw: ItemEquipmentRaw): CharacterItem {
  const presets = PRESET_KEYS.map((presetKey, index) => {
    return {
      no: index + 1,
      info: raw[presetKey].map(toPresetItemEquipment),
    };
  });

  return {
    date: raw.date,
    characterGender: raw.character_gender,
    characterClass: raw.character_class,
    presetNo: raw.preset_no,
    itemEquipment: raw.item_equipment.map(toMainItemEquipment),
    presets,
    title: toTitle(raw.title),
    medalShape: toMedalShape(raw.medal_shape),
    dragonEquipment: raw.dragon_equipment.map(toClassExclusiveItemEquipment),
    mechanicEquipment: raw.mechanic_equipment.map(toClassExclusiveItemEquipment),
  };
}
