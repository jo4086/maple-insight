export interface BasicData {
  /** 캐릭터 이름 */
  name: string;
  /** 월드 이름 */
  worldName: string;
  /** 성별 */
  gender: string;
  /** 직업 */
  class: string;
  /** 직업 레벨 */
  classLevel: string;
  /** 레벨 */
  level: number;
  /** 경험치 */
  exp: number;
  /** 경험치 비율 */
  expRate: string;
  /** 길드 이름 */
  guildName: string;
  /** 캐릭터 이미지 URL */
  imageUrl: string;
  /** 생성 날짜 */
  createdAt: string;
  /** 최근 7일 접속 여부 */
  accessFlag: boolean;
  /** 해방 퀘스트 상태 (0: 미완료, 1: 제네시스, 2: 데스티니) */
  liberationQuestClear: 0 | 1 | 2;
}

export interface CharacterBasic {
  /** 조회 기준일 */
  date: string | null;

  /** 기본 캐릭터 정보 */
  data: BasicData;
}
