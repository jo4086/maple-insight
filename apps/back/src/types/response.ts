const BasicApiResponseMap = {
  date: 'date',
  world_name: 'world',
  character_name: 'name',
  character_gender: 'gender',
  character_level: 'level',
  character_class: 'class',
  character_class_level: 'class_level',
  character_exp: 'exp',
  character_exp_rate: 'exp_percent',
  character_guild_name: 'guild',
  character_image: 'image_url',
  character_date_create: 'created_at',
  access_flag: 'recent_login',
  liberation_quest_clear_flag: 'is_genesis_owner',
} as const;

type BasicApiResponseMap = typeof BasicApiResponseMap;
type InputKeys = keyof BasicApiResponseMap;

type RenameMapped<T> = {
  [K in keyof T as K extends InputKeys ? BasicApiResponseMap[K] : K]: T[K];
};

export const renameBasicApiResponse = <T extends Record<string, unknown>>(obj: T): RenameMapped<T> => {
  const entries = Object.entries(obj) as [keyof T, T[keyof T]][];
  const mapped = entries.map(([key, value]) => {
    const mappedKey = (key in BasicApiResponseMap ? BasicApiResponseMap[key as InputKeys] : key) as keyof RenameMapped<T>;

    return [mappedKey, value] as const;
  });

  return Object.fromEntries(mapped) as RenameMapped<T>;
};
