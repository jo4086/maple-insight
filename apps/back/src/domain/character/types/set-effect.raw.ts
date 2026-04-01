export interface SetEffectRaw {
  date: string | null;
  set_effect: {
    set_name: string;
    total_set_count: number;
    set_effect_info: {
      set_count: number;
      set_option: string;
    }[];
    set_option_full: {
      set_count: number;
      set_option: string;
    }[];
  }[];
}
