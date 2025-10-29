export interface BasicInfoDTO {
  date: string | null;
  character_name: string;
  world_name: string;
  gender: string;
  class_name: string;
  class_level: number;
  level: number;
  exp: number;
  exp_rate: string;
  guild_name: string;
  character_image: string;
  character_create_date: string;
  access_flag: boolean;
  liberation_flag: boolean; // soon deprecated
  liberation_quest_clear: number;
}
