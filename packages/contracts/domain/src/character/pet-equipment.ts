export interface PetEquipmentOption {
  type: string;
  value: string;
}

export interface PetEquipment {
  name: string | null;
  icon: string | null;
  description: string | null;
  option: PetEquipmentOption[];
  scrollUpgrade: number;
  scrollUpgradable: number;
  shape: string | null;
  shapeIcon: string | null;
  dateExpire: string | null;
}

export interface PetAutoSkill {
  skill1: string | null;
  skill1Icon: string | null;
  skill2: string | null;
  skill2Icon: string | null;
}

export interface PetInfo {
  name: string | null;
  nickname: string | null;
  icon: string | null;
  description: string | null;
  equipment: PetEquipment | null;
  autoSkill: PetAutoSkill | null;
  type: string | null;
  skill: string[];
  dateExpire: string | null;
  appearance: string | null;
  appearanceIcon: string | null;
}

export interface CharacterPet {
  date: string | null;
  pets: {
    no: number;
    info: PetInfo | null;
  }[];
}
