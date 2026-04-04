export interface Core {
  slotId: string;
  slotLevel: number;
  coreName: string;
  coreType: string;
  coreLevel: number;
}

export interface CharacterVmatrix {
  date: string | null;
  cores: Core[];
  remainCoreSlotUpgradePoint: number;
}
