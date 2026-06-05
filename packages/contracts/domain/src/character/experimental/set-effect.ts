type DateType = string | null;

export interface SetEffectOptionProps {
  set_count: number;
  set_option: string;
}

export interface SetEffectProps {
  set_name: string;
  total_set_count: number;
  set_effect_info: SetEffectOptionProps[];
  set_option_full: SetEffectOptionProps[];
}

export interface CharacterSetEffect {
  date: DateType;
  set_effect: SetEffectProps[];
}
