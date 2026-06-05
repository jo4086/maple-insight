import type { RingReserveSkillEquipmentRaw } from '@maple/api-character';
import type { CharacterSpecialRing, RingInfo } from '@maple/contracts';

function toSpecialRing(raw: RingReserveSkillEquipmentRaw): RingInfo {
  return {
    name: raw.special_ring_reserve_name ?? '',
    level: raw.special_ring_reserve_level ?? 0,
    icon: raw.special_ring_reserve_icon ?? '',
    description: raw.special_ring_reserve_description ?? '',
  };
}

export function toCharacterSpecialRing(raw: RingReserveSkillEquipmentRaw): CharacterSpecialRing {
  return {
    date: raw.date,
    specialRing: toSpecialRing(raw),
  };
}
