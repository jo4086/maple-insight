// INFO: ranking/overall 응답의 개별 랭킹 행 타입이다.
export type RankingItem = {
  /** 랭킹 업데이트 일자 (KST)
   *  example: 2024-12-22 */
  date: string;
  /** 종합 랭킹 순위 */
  ranking: number;
  /** 캐릭터 명 */
  character_name: string;
  /** 월드 명 */
  world_name: string;
  /** 직업 명 */
  class_name: string;
  /** 전직 직업 명 */
  sub_class_name: string;
  /** 캐릭터 레벨 */
  character_level: number;
  /** 캐릭터 경험치 */
  character_exp: number;
  /** 캐릭터 인기도 */
  character_popularity: number;
  /** 캐릭터 길드 명 */
  character_guildname: string;
};

// INFO: ranking/overall은 랭킹 행 배열로 다룬다.
export type RankingOverall = RankingItem[];

// INFO: ranking 응답에서 우선 추려서 볼 핵심 필드 목록이다.
export const extractData = ['date', 'ranking', 'character_name', 'class_name', 'sub_class_name', 'character_level', 'character_guildname'] as const;

/* export interface UnionRankingParams {
  'x-nxopen-api-key': string;
  date: string;
  world_name: string;
  ocid: string;
  page: string;
} */

export interface UnionRanking {
  ranking: {
    /** 랭킹 업데이트 일자 (KST)
     *  example: 2025-12-22*/
    date: string;
    /** 유니온 랭킹 순위 */
    ranking: number;
    /** 캐릭터 명 */
    character_name: string;
    /** 월드 명 */
    world_name: string;
    /** 직업 명 */
    class_name: string;
    /** 전직 직업 명 */
    sub_class_name: string;
    /** 유니온 레벨 */
    union_level: number;
    /** 유니온 파워 */
    union_power: number;
  }[];
}

// INFO: ranking/union 응답의 개별 랭킹 행 타입이다.
export type UnionRankingItem = UnionRanking['ranking'][number];

export interface UnionChampion {
  date: string | null;
  union_champion: {
    champion_name: string;
    champion_slot: number;
    champion_grade: string;
    champion_class: string;
    champion_badge_info: { stat: string }[];
  }[];
  champion_badge_total_info: {
    stat: string;
  }[];
}

export interface UnionRaiderBase {
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

export interface UnionRaider extends UnionRaiderBase {
  date: null | string;
  use_preset_no: number;
  union_raider_preset_1: UnionRaiderBase | null;
  union_raider_preset_2: UnionRaiderBase | null;
  union_raider_preset_3: UnionRaiderBase | null;
  union_raider_preset_4: UnionRaiderBase | null;
  union_raider_preset_5: UnionRaiderBase | null;
}
