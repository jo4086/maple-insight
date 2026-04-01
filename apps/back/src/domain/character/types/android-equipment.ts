import type { CashItem } from '@maple/types';

import type { BeautyState } from './beauty-equipment';

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

export interface CharacterAndroid {
  date: string | null;
  equipped: AndroidInfo;
  presetNo: number;
  presets: {
    no: number;
    info: AndroidInfo | null;
  }[];
}
