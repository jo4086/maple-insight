export interface BasicInfo {
  date: string | null;
  name: string;
  world: string;
  gender: string;
  class: string;
  classLevel: number;
  level: number;
  exp: number;
  expRate: string; // % 형태 유지
  guild: string;
  image: string;
  createdAt: string;
  accessFlag: boolean;
  liberationFlag: boolean; // 구 flag, 곧 없어질 예정
  liberationQuestClear: number; // 신규 필드
}
