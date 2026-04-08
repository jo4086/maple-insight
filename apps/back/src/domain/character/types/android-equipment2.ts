import type { CashItem } from '@maple/types';

import type { BeautyState } from './beauty-equipment';

export interface AndroidEquipment {
  name: string;
  nickname: string;
  icon: string;
  description: string;
  style: BeautyState;
  cashItemInfo: Omit<CashItem, 'effectPrism' | 'skills' | 'emotionName'>[];
  earSensorClipFlag: boolean;
  gender: string;
  grade: number;
  nonHumanoidFlag: string;
  shopUsableFlag: boolean;
}
//
// export interface AndroidEquipment {
//   equipped: AndroidInfo;
//   presetNo: number;
//   presets: {
//     no: number;
//     info: AndroidInfo;
//   }[];
// }
