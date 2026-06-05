export interface HexaStat {
  id: string;
  main_stat_name: string;
  sub_stat_name_1: string;
  sub_stat_name_2: string;
  main_stat_level: number;
  sub_stat_level_1: number;
  sub_stat_level_2: number;
  stat_grade: number;
}

export interface HexaStatPreset {
  no: number;
  preset: HexaStat[];
}

export interface CharacterHexaStat {
  date: string | null;
  character_class: string;
  equipped: HexaStatPreset[];
  presets: HexaStatPreset[];
}

export interface HexaStatRawData {
  date: string | null;
  character_class: string;
  character_hexa_stat_core: {
    slot_id: string;
    main_stat_name: string;
    sub_stat_name_1: string;
    sub_stat_name_2: string;
    main_stat_level: number;
    sub_stat_level_1: number;
    sub_stat_level_2: number;
    stat_grade: number;
  }[];
  character_hexa_stat_core_2: {
    slot_id: string;
    main_stat_name: string;
    sub_stat_name_1: string;
    sub_stat_name_2: string;
    main_stat_level: number;
    sub_stat_level_1: number;
    sub_stat_level_2: number;
    stat_grade: number;
  }[];
  character_hexa_stat_core_3: {
    slot_id: string;
    main_stat_name: string;
    sub_stat_name_1: string;
    sub_stat_name_2: string;
    main_stat_level: number;
    sub_stat_level_1: number;
    sub_stat_level_2: number;
    stat_grade: number;
  }[];
  preset_hexa_stat_core: {
    slot_id: string;
    main_stat_name: string;
    sub_stat_name_1: string;
    sub_stat_name_2: string;
    main_stat_level: number;
    sub_stat_level_1: number;
    sub_stat_level_2: number;
    stat_grade: number;
  }[];
  preset_hexa_stat_core_2: {
    slot_id: string;
    main_stat_name: string;
    sub_stat_name_1: string;
    sub_stat_name_2: string;
    main_stat_level: number;
    sub_stat_level_1: number;
    sub_stat_level_2: number;
    stat_grade: number;
  }[];
  preset_hexa_stat_core_3: {
    slot_id: string;
    main_stat_name: string;
    sub_stat_name_1: string;
    sub_stat_name_2: string;
    main_stat_level: number;
    sub_stat_level_1: number;
    sub_stat_level_2: number;
    stat_grade: number;
  }[];
}
