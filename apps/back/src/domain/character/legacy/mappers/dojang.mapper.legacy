import type { CharacterDojang } from '../types/dojang';
import type { DojangRaw } from '../types/dojang.raw';

export function toCharacterDojang(raw: DojangRaw): CharacterDojang {
  return {
    date: raw.date,
    worldName: raw.world_name,
    bestFloor: raw.dojang_best_floor,
    dateRecord: raw.date_dojang_record,
    bestTime: raw.dojang_best_time,
  };
}
