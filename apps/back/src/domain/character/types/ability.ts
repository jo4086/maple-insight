import type { RarityGrade } from './common';

export interface AbilityInfo {
  abilityNo: number;
  /** 개별 옵션 등급 */
  grade: RarityGrade;
  value: string;
}

export interface EquippedAbility {
  /** 장착중인 어빌리티 최종 등급 */
  grade: RarityGrade;
  /** 장착중인 어빌리티 정보 */
  info: AbilityInfo[];
}

export interface AbilityPreset {
  /** 프리셋 번호 */
  presetNo: number;
  /** 프리셋 최종 등급 */
  grade: RarityGrade;
  /** 번호별 프리셋 정보 */
  info: AbilityInfo[];
}

export interface CharacterAbility {
  date: string | null;
  /** 장착중인 어빌리티 정보 */
  equipped: EquippedAbility;
  /** 남은 명성치 */
  remainFame: number;
  /** 장착중인 어빌리티 프리셋 번호 */
  presetNo: number;
  /** 전체 프리셋 정보 */
  presets: AbilityPreset[];
}
