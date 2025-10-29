import { BasicInfo } from '../types';
import { BasicInfoDTO } from '../dto';

export function toBasicInfo(dto: BasicInfoDTO): BasicInfo {
  return {
    date: dto.date,
    name: dto.character_name,
    world: dto.world_name,
    gender: dto.gender,
    class: dto.class_name,
    classLevel: dto.class_level,
    level: dto.level,
    exp: dto.exp,
    expRate: dto.exp_rate,
    guild: dto.guild_name,
    image: dto.character_image,
    createdAt: dto.character_create_date,
    accessFlag: dto.access_flag,
    liberationFlag: dto.liberation_flag,
    liberationQuestClear: dto.liberation_quest_clear,
  };
}
