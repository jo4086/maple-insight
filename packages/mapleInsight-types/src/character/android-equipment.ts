import type { BeautyState } from './beauty-equipment';
import type { CashItem } from './cashitem-equipment';

export interface AndroidInfo {
  name: string | null;
  nickname: string | null;
  icon: string | null;
  description: string | null;
  style: BeautyState | null;
  cashItemInfo: Omit<CashItem, 'effectPrism' | 'skills' | 'emotionName'>[];
  earSensorClipFlag: boolean;
  gender: string | null;
  grade: number | null;
  nonHumanoidFlag: string | null;
  shopUsableFlag: boolean | null;
}

export interface AndroidPresets {
  no: number;
  info: AndroidInfo | null;
}

export interface CharacterAndroid {
  date: string | null;
  equipped: AndroidInfo;
  presetNo: number;
  presets: AndroidPresets[];
}
