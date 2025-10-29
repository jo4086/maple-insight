type SymbolTypes = 'ARC' | 'AUT' | 'GrandAUT';

interface SymbolType {
  stat: {
    str: number;
    dex: number;
    int: number;
    luk: number;
    hp: number;

    dropRate: string;
    mesoRate: string;
    ExpRate: string;
  };
  info: {
    name: string;
    type: SymbolTypes;
    force: number;
    level: number;

    growthCount: number;
    requireGrowthCount: number;
    icon: string;
    desc: string;
  };
}

interface RawSymbol {
  symbol_name: string;
  symbol_icon: string;
  symbol_description: string;
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

function getSymbolTypeFromName(name: string): SymbolTypes {
  if (name.includes('아케인심볼')) return 'ARC';
  if (name.includes('어센틱심볼')) return 'AUT';
  if (name.includes('그랜드 어센틱심볼')) return 'GrandAUT';
  throw new Error(`알 수 없는 심볼 이름: ${name}`);
}

export function transformSymbol(raw: RawSymbol): SymbolType {
  return {
    stat: {
      str: Number(raw.symbol_str),
      dex: Number(raw.symbol_dex),
      int: Number(raw.symbol_int),
      luk: Number(raw.symbol_luk),
      hp: Number(raw.symbol_hp),

      dropRate: raw.symbol_drop_rate,
      mesoRate: raw.symbol_meso_rate,
      ExpRate: raw.symbol_exp_rate,
    },
    info: {
      name: raw.symbol_name,
      type: getSymbolTypeFromName(raw.symbol_name), // ← 여기서 자동 결정
      force: Number(raw.symbol_force),
      level: raw.symbol_level,

      growthCount: raw.symbol_growth_count,
      requireGrowthCount: raw.symbol_require_growth_count,
      icon: raw.symbol_icon,
      desc: raw.symbol_description,
    },
  };
}
