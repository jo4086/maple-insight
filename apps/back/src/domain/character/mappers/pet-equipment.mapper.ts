import type { PetRaw } from '@maple/api-character';
import type { CharacterPet, PetAutoSkill, PetEquipment, PetEquipmentOption, PetInfo } from '@maple/contracts';

type PetNo = 1 | 2 | 3;
type PetEquipmentRaw = NonNullable<PetRaw['pet_1_equipment']>;
type PetAutoSkillRaw = NonNullable<PetRaw['pet_1_auto_skill']>;

function toPetEquipmentOption(raw: NonNullable<PetEquipmentRaw['item_option']>[number]): PetEquipmentOption {
  return {
    type: raw.option_type ?? '',
    value: raw.option_value ?? '',
  };
}

function toPetEquipment(raw: PetEquipmentRaw | null): PetEquipment | null {
  if (!raw) return null;

  return {
    name: raw.item_name,
    icon: raw.item_icon,
    description: raw.item_description,
    option: (raw.item_option ?? []).map(toPetEquipmentOption),
    scrollUpgrade: raw.scroll_upgrade ?? 0,
    scrollUpgradable: raw.scroll_upgradable ?? 0,
    shape: raw.item_shape,
    shapeIcon: raw.item_shape_icon,
    dateExpire: raw.item_date_expire,
  };
}

function toPetAutoSkill(raw: PetAutoSkillRaw | null): PetAutoSkill | null {
  if (!raw) return null;

  return {
    skill1: raw.skill_1,
    skill1Icon: raw.skill_1_icon,
    skill2: raw.skill_2,
    skill2Icon: raw.skill_2_icon,
  };
}

function toPetInfo(raw: PetRaw, no: PetNo): PetInfo | null {
  const name = raw[`pet_${no}_name`];
  const nickname = raw[`pet_${no}_nickname`];
  const icon = raw[`pet_${no}_icon`];
  const description = raw[`pet_${no}_description`];
  const equipment = raw[`pet_${no}_equipment`];
  const autoSkill = raw[`pet_${no}_auto_skill`];
  const type = raw[`pet_${no}_pet_type`];
  const skill = raw[`pet_${no}_skill`];
  const dateExpire = raw[`pet_${no}_date_expire`];
  const appearance = raw[`pet_${no}_appearance`];
  const appearanceIcon = raw[`pet_${no}_appearance_icon`];

  const hasMeaningfulValue =
    name !== null ||
    nickname !== null ||
    icon !== null ||
    description !== null ||
    equipment !== null ||
    autoSkill !== null ||
    type !== null ||
    dateExpire !== null ||
    appearance !== null ||
    appearanceIcon !== null;

  if (!hasMeaningfulValue) {
    return null;
  }

  return {
    name,
    nickname,
    icon,
    description,
    equipment: toPetEquipment(equipment),
    autoSkill: toPetAutoSkill(autoSkill),
    type,
    skill: (skill ?? []).filter((item): item is string => item != null),
    dateExpire,
    appearance,
    appearanceIcon,
  };
}

export function toCharacterPet(raw: PetRaw): CharacterPet {
  return {
    date: raw.date,
    pets: [
      { no: 1, info: toPetInfo(raw, 1) },
      { no: 2, info: toPetInfo(raw, 2) },
      { no: 3, info: toPetInfo(raw, 3) },
    ],
  };
}
