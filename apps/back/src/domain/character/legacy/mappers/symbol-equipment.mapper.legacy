import { toNumberSafe } from 'src/utils/number';

import type { SymbolOption, CharacterSymbol } from '../types/symbol-equipment';
import type { SymbolRaw } from '../types/symbol-equipment.raw';

type SymbolItemRaw = SymbolRaw['symbol'][number];

function toSymbolOption(raw: SymbolItemRaw): SymbolOption {
  return {
    name: raw.symbol_name,
    icon: raw.symbol_icon,
    description: raw.symbol_description,
    otherEffectDescription: raw.symbol_other_effect_description,
    force: toNumberSafe(raw.symbol_force),
    level: raw.symbol_level,
    str: toNumberSafe(raw.symbol_str),
    dex: toNumberSafe(raw.symbol_dex),
    int: toNumberSafe(raw.symbol_int),
    luk: toNumberSafe(raw.symbol_luk),
    hp: toNumberSafe(raw.symbol_hp),
    dropRate: raw.symbol_drop_rate,
    mesoRate: raw.symbol_meso_rate,
    expRate: raw.symbol_exp_rate,
    growthCount: raw.symbol_growth_count,
    requireGrowthCount: raw.symbol_require_growth_count,
  };
}

export function toCharacterSymbol(raw: SymbolRaw): CharacterSymbol {
  return {
    date: raw.date,
    symbols: raw.symbol.map(toSymbolOption),
  };
}
