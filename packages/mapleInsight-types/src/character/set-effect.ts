export interface SetOption {
  setCount: number;
  setOption: string;
}

export type EquippedSetInfo = SetOption[];

export type SetFullInfo = SetOption[];

export interface SetEffect {
  setName: string;
  equippedSetCount: number;
  equippedSetInfo: EquippedSetInfo;
  setFullInfo: SetFullInfo;
}

export interface CharacterSetEffect {
  date: string | null;
  setEffects: SetEffect[];
}
