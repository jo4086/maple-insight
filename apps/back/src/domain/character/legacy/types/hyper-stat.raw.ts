export interface HyperStatItemRawLegacy {
  stat_type: string;
  stat_point: number | null;
  stat_level: number;
  stat_increase: string | null;
}

type HyperStatPresetFieldsLegacy = {
  [K in `hyper_stat_preset_${1 | 2 | 3}`]: HyperStatItemRawLegacy[];
};

type HyperStatRemainPointFieldsLegacy = {
  [K in `hyper_stat_preset_${1 | 2 | 3}_remain_point`]: number;
};

export interface HyperStatRawLegacy extends HyperStatPresetFieldsLegacy, HyperStatRemainPointFieldsLegacy {
  date: string | null;
  character_class: string;
  use_preset_no: string;
  use_available_hyper_stat: number;
}
