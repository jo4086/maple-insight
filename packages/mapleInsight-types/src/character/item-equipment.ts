export interface ItemOption {
  str?: number;
  dex?: number;
  int?: number;
  luk?: number;
  maxHp?: number;
  maxMp?: number;
  attackPower?: number;
  magicPower?: number;
  armor?: number;
  speed?: number;
  jump?: number;
  bossDamage?: number;
  ignoreMonsterArmor?: number;
  allStat?: number;
  damage?: number;
  equipmentLevelDecrease?: number;
  maxHpRate?: number;
  maxMpRate?: number;
}

export interface ItemBaseOption extends ItemOption {
  baseEquipmentLevel: number;
}

export interface ItemExceptionalOption extends ItemOption {
  exceptionalUpgrade: number;
}

export interface ItemMetadata {
  part: string;
  slot: string;
  name: string;
  icon: string;
  description: string | null;
  shapeName: string;
  shapeIcon: string;
  gender: string | null;
}

export interface ItemUpgradeInfo {
  growthExp: number;
  growthLevel: number;
  scrollUpgrade: number;
  cuttableCount: number;
  goldenHammerFlag: boolean;
  scrollResilienceCount: number;
  scrollUpgradableCount: number;
  soulName: string | null;
  soulOption: string | null;
  starforce: number;
  starforceScrollFlag: string;
}

export interface MainItemPotentials {
  potential: {
    grade: string | null;
    flag: boolean;
    option1: string | null;
    option2: string | null;
    option3: string | null;
  };
  additional: {
    grade: string | null;
    flag: boolean;
    option1: string | null;
    option2: string | null;
    option3: string | null;
  };
}

export interface PresetItemPotentials {
  potential: {
    grade: string | null;
    option1: string | null;
    option2: string | null;
    option3: string | null;
  };
  additional: {
    grade: string | null;
    option1: string | null;
    option2: string | null;
    option3: string | null;
  };
}

export interface ItemOptionSet<TExceptional = ItemExceptionalOption> {
  total: ItemOption;
  base: ItemBaseOption;
  exceptional: TExceptional;
  add: ItemOption;
  etc: ItemOption;
  starforce: ItemOption;
}

export interface MainItemEquipment extends ItemMetadata {
  itemOptions: ItemOptionSet;
  potentials: MainItemPotentials;
  upgrade: ItemUpgradeInfo;
  equipmentLevelIncrease: number;
  specialRingLevel: number;
  dateExpire: string | null;
  freestyleFlag: boolean;
}

export interface PresetItemEquipment extends ItemMetadata {
  itemOptions: ItemOptionSet;
  potentials: PresetItemPotentials;
  upgrade: ItemUpgradeInfo;
  equipmentLevelIncrease: number;
  specialRingLevel: number;
  dateExpire: string | null;
  freestyleFlag: boolean;
}

export interface ClassExclusiveItemEquipment extends ItemMetadata {
  itemOptions: ItemOptionSet<ItemOption>;
  upgrade: ItemUpgradeInfo;
  equipmentLevelIncrease: number;
  specialRingLevel: number;
  dateExpire: string | null;
  freestyleFlag: boolean;
}

export type ItemEquipment = MainItemEquipment;

export interface Title {
  name: string;
  icon: string;
  description: string | null;
  dateExpire: string | null;
  dateOptionExpire: string;
  shapeName: string;
  shapeIcon: string;
  shapeDescription: string | null;
}

export interface MedalShape {
  name: string;
  icon: string;
  description: string | null;
  changedName: string;
  changedIcon: string;
  changedDescription: string | null;
}

export interface CharacterItem {
  date: string | null;
  characterGender: string;
  characterClass: string;
  presetNo: number;
  itemEquipment: MainItemEquipment[];
  presets: {
    no: number;
    info: PresetItemEquipment[];
  }[];
  title: Title | null;
  medalShape: MedalShape | null;
  dragonEquipment: ClassExclusiveItemEquipment[];
  mechanicEquipment: ClassExclusiveItemEquipment[];
}
