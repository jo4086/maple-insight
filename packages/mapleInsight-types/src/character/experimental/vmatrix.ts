export interface VCore {
  id: string;
  name: string;
  type: string;
  level: number;
}

export interface CharacterVmatrix {
  date: string | null;
  character_class: string;
  cores: VCore[];
  remain_slot_upgrade_point: number;
}

export interface VmatrixRawData {
  date: string | null;
  character_class: string;
  character_v_core_equipment: {
    slot_id: string;
    v_core_name: string;
    v_core_type: string;
    v_core_level: number;
  }[];
  character_v_matrix_remain_slot_upgrade_point: number;
}
