export interface LinkSkill {
  /** 링크 스킬 레벨 */
  name: string;
  /** 링크 스킬 설명 */
  description: string;
  /** 링크 스킬의 현재 레벨 (Max level: 3) */
  level: number;
  /** 링크 스킬의 현재 레벨 효과 */
  effect: string;
  /** 링크 스킬의 아이콘 */
  icon: string;
}

export interface EquippedLinkSkill extends LinkSkill {
  /** 링크 스킬의 다음 레벨 효과 */
  effectNext: string | null;
}

export interface CharacterLinkSkill {
  date: string | null;
  /** 현재 장착중인 링크스킬 리스트 */
  equipped: EquippedLinkSkill[];
  /** 링크 스킬 프리셋 목록 */
  presets: {
    no: number;
    info: LinkSkill[];
  }[];
  owned: LinkSkill;
  ownedPresets: LinkSkill[];
}
