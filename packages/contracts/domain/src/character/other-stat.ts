export interface OtherStat {
  type: string;
  info: {
    name: string;
    value: string;
  }[];
}

export interface CharacterOtherStat {
  date: string | null;
  otherStats: OtherStat[];
}
