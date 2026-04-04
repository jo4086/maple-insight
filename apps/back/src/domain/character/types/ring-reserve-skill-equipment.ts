export interface RingInfo {
  name: string;
  level: number;
  icon: string;
  description: string;
}

export interface CharacterSpecialRing {
  date: string | null;
  specialRing: RingInfo;
}
