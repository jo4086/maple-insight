import type { DeepNullable } from '@/types/deep-nullable';

interface DojangRawBase {
  date: string | null;
  character_class: string;
  world_name: string;
  dojang_best_floor: number;
  date_dojang_record: string | null;
  dojang_best_time: number;
}

export type DojangRaw = DeepNullable<DojangRawBase>;
