import type { CharacterVmatrix, Core } from '../types/vmatrix';
import type { VmatrixRaw } from '../types/vmatrix.raw';

type CoreRaw = VmatrixRaw['character_v_core_equipment'][number];

function toCore(raw: CoreRaw): Core {
  return {
    slotId: raw.slot_id,
    slotLevel: raw.slot_level,
    coreName: raw.v_core_name,
    coreType: raw.v_core_type,
    coreLevel: raw.v_core_level,
  };
}

export function toCharacterVmatrix(raw: VmatrixRaw): CharacterVmatrix {
  return {
    date: raw.date,
    cores: raw.character_v_core_equipment.map(toCore),
    remainCoreSlotUpgradePoint: raw.character_v_matrix_remain_slot_upgrade_point,
  };
}
