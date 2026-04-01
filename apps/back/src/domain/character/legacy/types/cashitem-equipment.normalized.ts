export interface CashItemOption {
  type: string;
  value: string;
}

export interface PrismOption {
  colorRange: string;
  hue: number;
  saturation: number;
  value: number;
}

export interface CashItem {
  part: string;
  slot: string;
  name: string;
  icon: string;
  description: string | null;
  option: CashItemOption[];
  dateExpire: string | null;
  dateOptionExpire: string | null;
  label: string | null;
  coloringPrism: PrismOption | null;
  effectPrism: PrismOption | null;
  gender: string | null;
  skills: string[];
  freestyleFlag: boolean;
  emotionName: string | null;
}

export interface CharacterCashItem {
  date: string | null;
  characterGender: string;
  characterClass: string;
  characterLookMode: string;
  presetNo: number;
  normal: {
    base: CashItem[];
    presets: CashItem[][];
  };
  additional: {
    base: CashItem[];
    presets: CashItem[][];
  };
}
