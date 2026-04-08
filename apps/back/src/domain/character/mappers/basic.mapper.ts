import type { CharacterBasic } from '@maple/types';

import type { BasicRaw } from '../types/basic.raw';

import { toBooleanByFlag } from '@/utils/boolean';

function toLiberationQuestClear(value: string): 0 | 1 | 2 {
  if (value === '0') return 0;
  if (value === '1') return 1;
  if (value === '2') return 2;
  return 0;
}

export function toCharacterBasic(raw: BasicRaw): CharacterBasic {
  return {
    date: raw.date,
    info: {
      name: raw.character_name ?? '',
      worldName: raw.world_name ?? '',
      gender: raw.character_gender ?? '',
      class: raw.character_class ?? '',
      classLevel: raw.character_class_level ?? '',
      level: raw.character_level ?? 0,
      exp: raw.character_exp ?? 0,
      expRate: raw.character_exp_rate ?? '',
      guildName: raw.character_guild_name ?? '',
      imageUrl: raw.character_image ?? '',
      createdAt: raw.character_date_create ?? '',
      accessFlag: toBooleanByFlag(raw.access_flag ?? '0'),
      liberationQuestClear: toLiberationQuestClear(raw.liberation_quest_clear ?? '0'),
    },
  };
}
