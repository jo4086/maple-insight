import type { DeepNullable } from '@/types/deep-nullable';

interface StatRawBase {
  date: string | null;
  character_class: string;
  final_stat: {
    stat_name: string;
    stat_value: string;
  }[];
  remain_ap: number;
}

export type StatRaw = DeepNullable<StatRawBase>;
