export interface SymbolOption {
  name: string;
  icon: string;
  description: string;
  otherEffectDescription: string | null;
  force: number;
  level: number;
  str: number;
  dex: number;
  int: number;
  luk: number;
  hp: number;
  dropRate: string;
  mesoRate: string;
  expRate: string;
  growthCount: number;
  requireGrowthCount: number;
}

export interface CharacterSymbol {
  date: string | null;
  symbols: SymbolOption[];
}
