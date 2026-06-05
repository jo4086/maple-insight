export interface UnionRaiderPresetRaw {
  union_raider_stat: string[];
  union_occupied_stat: string[];
  union_block: {
    block_type: string;
    block_class: string;
    block_level: string;
    block_control_point: { x: number; y: number };
    block_position: { x: number; y: number }[];
  }[];
  union_inner_stat: { stat_field_id: string; stat_field_effect: string }[];
}

export interface UnionRaiderResponseRaw extends UnionRaiderPresetRaw {
  date: null | string;
  use_preset_no: number;
  union_raider_preset_1: UnionRaiderPresetRaw | null;
  union_raider_preset_2: UnionRaiderPresetRaw | null;
  union_raider_preset_3: UnionRaiderPresetRaw | null;
  union_raider_preset_4: UnionRaiderPresetRaw | null;
  union_raider_preset_5: UnionRaiderPresetRaw | null;
}
