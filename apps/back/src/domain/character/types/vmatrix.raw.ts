import type { DeepNullable } from '@/types/deep-nullable';

interface VmatrixRawBase {
  date: string | null;
  character_class: string;
  character_v_core_equipment: {
    slot_id: string;
    slot_level: number;
    v_core_name: string;
    v_core_type: string;
    v_core_level: number;
    // 아래 v_core_level_* 형식은 이제 쓰지 않음
    v_core_level_1: number | null;
    v_core_level_2: number | null;
    v_core_level_3: number | null;
  }[];
  character_v_matrix_remain_slot_upgrade_point: number;
}

export type VmatrixRaw = DeepNullable<VmatrixRawBase>;
