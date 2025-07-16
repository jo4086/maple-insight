export interface Formatting {
  name: string;
  class: string;
  tier: string;
  gender: string;
  level: number;
  exp: number;
  exp_rate: string;
  guild: null | string;
  image: string;
  created: string;
  access_flag: 'true' | 'false';
  liberation_flag: 'true' | 'false';
}
