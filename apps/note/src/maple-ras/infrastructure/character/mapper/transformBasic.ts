import { BasicInfo } from '@/domain/character';

interface RawBasic {
  date: string | null;
  character_name: string;
  world_name: string;
  character_gender: string;
  character_class: string;
  character_class_level: string;
  character_level: number;
  character_exp: number;
  character_exp_rate: string;
  character_guild_name: string;
  character_image: string;
  character_date_create: string;
  access_flag: string;
  liberation_quest_clear_flag?: string;
  liberation_quest_clear: string;
}

export function transformBasic(raw: RawBasic): BasicInfo {
  return {
    date: raw.date,
    name: raw.character_name,
    world: raw.world_name,
    gender: raw.character_gender,
    class: raw.character_class,
    classLevel: Number(raw.character_class_level),
    level: raw.character_level,
    exp: raw.character_exp,
    expRate: raw.character_exp_rate,
    guild: raw.character_guild_name,
    image: raw.character_image,
    createdAt: raw.character_date_create,
    accessFlag: raw.access_flag === 'true',
    liberationFlag: raw.liberation_quest_clear_flag === 'true',
    liberationQuestClear: Number(raw.liberation_quest_clear),
  };
}
