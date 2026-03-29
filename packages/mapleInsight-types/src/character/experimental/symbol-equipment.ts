type DateType = string | null;

export interface SymbolProps {
  symbol_name: string;
  symbol_icon: string;
  symbol_description: string;
  symbol_other_effect_description: null | string;
  symbol_force: string;
  symbol_level: number;
  symbol_str: string;
  symbol_dex: string;
  symbol_int: string;
  symbol_luk: string;
  symbol_hp: string;
  symbol_drop_rate: string;
  symbol_meso_rate: string;
  symbol_exp_rate: string;
  symbol_growth_count: number;
  symbol_require_growth_count: number;
}

export interface CharacterSymbolEquipment {
  date: DateType;
  character_class: string;
  symbol: SymbolProps[];
}
