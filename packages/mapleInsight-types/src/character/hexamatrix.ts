export interface LinkedSkill {
  /** 연결된 스킬 이름 */
  skillId: string;
}

export interface HexaCore {
  name: string;
  level: number;
  type: string;
  linkedSkills: LinkedSkill[];
}

export interface CharacterHexamatrix {
  date: string | null;
  hexaCores: HexaCore[];
}
