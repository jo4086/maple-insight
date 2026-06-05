import type { HexamatrixRaw } from '@maple/api-character';
import type { CharacterHexamatrix, HexaCore, LinkedSkill } from '@maple/contracts';

type HexaCoreRaw = NonNullable<HexamatrixRaw['character_hexa_core_equipment']>[number];
type LinkedSkillRaw = NonNullable<HexaCoreRaw['linked_skill']>[number];

function toLinkedSkill(raw: LinkedSkillRaw): LinkedSkill {
  return {
    skillId: raw.hexa_skill_id ?? '',
  };
}

function toHexaCore(raw: HexaCoreRaw): HexaCore {
  return {
    name: raw.hexa_core_name ?? '',
    level: raw.hexa_core_level ?? 0,
    type: raw.hexa_core_type ?? '',
    linkedSkills: (raw.linked_skill ?? []).map(toLinkedSkill),
  };
}

export function toCharacterHexamatrix(raw: HexamatrixRaw): CharacterHexamatrix {
  return {
    date: raw.date,
    hexaCores: (raw.character_hexa_core_equipment ?? []).map(toHexaCore),
  };
}
