import type { DeepNullable } from '@/types/deep-nullable';

interface OtherStatRawBase {
  date: string | null;
  other_stat: {
    other_stat_type: string;
    stat_info: {
      stat_name: string;
      stat_value: string;
    }[];
  }[];
}

export type OtherStatRaw = DeepNullable<OtherStatRawBase>;
