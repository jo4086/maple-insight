export interface OtherStatRawData {
  date: string | null;
  other_stat: {
    other_stat_type: string;
    stat_info: {
      stat_name: string;
      stat_value: string;
    }[];
  }[];
}
