import type { BeautyState } from './beauty-equipment';
import type { CashItem } from './cashitem-equipment';

/** 안드로이드 정보 */
export interface AndroidEquipment {
  /** 안드로이드 명 */
  name: string;
  /** 안드로이드 닉네임 */
  nickname: string;
  /** 안드로이드 아이콘 */
  icon: string;
  /** 안드로이드 설명 */
  description: string;
  /** 안드로이드 뷰티 정보 */
  style: BeautyState;
  /** 안드로이드 캐시아이템 정보 */
  cashItemInfo: Omit<CashItem, 'effectPrism' | 'skills' | 'emotionName'>[];
  /** 이어클립센서 플래그 (false: 미사용, true: 사용) */
  earSensorClipFlag: boolean;
  /** 안드로이드 성별 */
  gender: string;
  /** 안드로이드 등급 */
  grade: number;
  /** 인간형/비인간형 */
  nonHumanoidFlag: string;
  /** 상점 이용 가능 플래그 (false: 불가능, true: 가능) */
  shopUsableFlag: boolean;
}
