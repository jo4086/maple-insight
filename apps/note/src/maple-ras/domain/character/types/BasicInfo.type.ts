export interface BasicInfo {
  date: string | null;
  name: string;
  world: string;
  gender: string;
  class: string;
  classLevel: number;
  level: number;
  exp: number;
  expRate: string;
  guild: string;
  image: string;
  createdAt: string;
  accessFlag: boolean;
  liberationFlag: boolean; // soon deprecated
  liberationQuestClear: number;
}
