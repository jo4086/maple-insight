import type { SetEffectRaw } from '@maple/api-character';
import type { CharacterSetEffect, SetEffect, SetOption } from '@maple/contracts';

type SetEffectItemRaw = NonNullable<SetEffectRaw['set_effect']>[number];
type SetOptionRaw = NonNullable<SetEffectItemRaw['set_effect_info']>[number];

function toSetOption(raw: SetOptionRaw): SetOption {
  return {
    setCount: raw.set_count ?? 0,
    setOption: raw.set_option ?? '',
  };
}

function toSetEffect(raw: SetEffectItemRaw): SetEffect {
  return {
    setName: raw.set_name ?? '',
    equippedSetCount: raw.total_set_count ?? 0,
    equippedSetInfo: (raw.set_effect_info ?? []).map(toSetOption),
    setFullInfo: (raw.set_option_full ?? []).map(toSetOption),
  };
}

export function toCharacterSetEffect(raw: SetEffectRaw): CharacterSetEffect {
  return {
    date: raw.date,
    setEffects: (raw.set_effect ?? []).map(toSetEffect),
  };
}
