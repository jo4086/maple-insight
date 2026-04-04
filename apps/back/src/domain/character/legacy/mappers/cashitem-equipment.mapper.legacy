import type { CashItem, CashItemOption, CharacterCashItem, PrismOption } from '@maple/types';
import { toBooleanByFlag } from 'src/utils/boolean';

import type { CashRawData } from '../types/cashitem-equipment.raw';

type CashItemRaw = CashRawData['cash_item_equipment_base'][number];
type NormalPresetKey = 'cash_item_equipment_preset_1' | 'cash_item_equipment_preset_2' | 'cash_item_equipment_preset_3';
type AdditionalPresetKey = 'additional_cash_item_equipment_preset_1' | 'additional_cash_item_equipment_preset_2' | 'additional_cash_item_equipment_preset_3';

const NORMAL_PRESET_KEYS: NormalPresetKey[] = ['cash_item_equipment_preset_1', 'cash_item_equipment_preset_2', 'cash_item_equipment_preset_3'];

const ADDITIONAL_PRESET_KEYS: AdditionalPresetKey[] = [
  'additional_cash_item_equipment_preset_1',
  'additional_cash_item_equipment_preset_2',
  'additional_cash_item_equipment_preset_3',
];

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

function toCashItem(raw: CashItemRaw): CashItem {
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
    effectPrism: toPrismOption(raw.cash_item_effect_prism),
    gender: raw.item_gender,
    skills: raw.skills,
    freestyleFlag: toBooleanByFlag(raw.freestyle_flag),
    emotionName: raw.emotion_name,
  };
}

export function toCharacterCashItem(raw: CashRawData): CharacterCashItem {
  const normalPresets = NORMAL_PRESET_KEYS.map((presetKey) => raw[presetKey].map(toCashItem));

  const additionalPresets = ADDITIONAL_PRESET_KEYS.map((presetKey) => raw[presetKey].map(toCashItem));

  return {
    date: raw.date,
    characterGender: raw.character_gender,
    characterClass: raw.character_class,
    characterLookMode: raw.character_look_mode,
    presetNo: raw.preset_no,
    normal: {
      base: raw.cash_item_equipment_base.map(toCashItem),
      presets: normalPresets,
    },
    additional: {
      base: raw.additional_cash_item_equipment_base.map(toCashItem),
      presets: additionalPresets,
    },
  };
}
