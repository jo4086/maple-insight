export interface HexamatrixRaw {
  date: string | null;
  character_hexa_core_equipment: {
    hexa_core_name: string;
    hexa_core_level: number;
    hexa_core_type: string;
    linked_skill: {
      hexa_skill_id: string;
    }[];
  }[];
}
