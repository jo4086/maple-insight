import type { CharacterSpecialRing, RingInfo } from '../types/ring-reserve-skill-equipment';
import type { RingReserveSkillEquipmentRaw } from '../types/ring-reserve-skill-equipment.raw';

function toSpecialRing(raw: RingReserveSkillEquipmentRaw): RingInfo {
  return {
    name: raw.special_ring_reserve_name,
    level: raw.special_ring_reserve_level,
    icon: raw.special_ring_reserve_icon,
    description: raw.special_ring_reserve_description,
  };
}

export function toCharacterSpecialRing(raw: RingReserveSkillEquipmentRaw): CharacterSpecialRing {
  return {
    date: raw.date,
    specialRing: toSpecialRing(raw),
  };
}
