import type { SymbolRaw } from '@maple/api-character';
import type { SymbolOption, CharacterSymbol } from '@maple/contracts';

import { toNumberSafe } from '@/utils/number';

type SymbolItemRaw = NonNullable<SymbolRaw['symbol']>[number];

function toSymbolOption(raw: SymbolItemRaw): SymbolOption {
  return {
    name: raw.symbol_name ?? '',
    icon: raw.symbol_icon ?? '',
    description: raw.symbol_description ?? '',
    otherEffectDescription: raw.symbol_other_effect_description,
    force: toNumberSafe(raw.symbol_force ?? '0'),
    level: raw.symbol_level ?? 0,
    str: toNumberSafe(raw.symbol_str ?? '0'),
    dex: toNumberSafe(raw.symbol_dex ?? '0'),
    int: toNumberSafe(raw.symbol_int ?? '0'),
    luk: toNumberSafe(raw.symbol_luk ?? '0'),
    hp: toNumberSafe(raw.symbol_hp ?? '0'),
    dropRate: raw.symbol_drop_rate ?? '',
    mesoRate: raw.symbol_meso_rate ?? '',
    expRate: raw.symbol_exp_rate ?? '',
    growthCount: raw.symbol_growth_count ?? 0,
    requireGrowthCount: raw.symbol_require_growth_count ?? 0,
  };
}

export function toCharacterSymbol(raw: SymbolRaw): CharacterSymbol {
  return {
    date: raw.date,
    symbols: (raw.symbol ?? []).map(toSymbolOption),
  };
}
