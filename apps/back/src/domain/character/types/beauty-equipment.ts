export type BeautyStyle = {
  /** 이름 */
  name: string;
  /** 베이스 컬러 */
  baseColor: string;
  /** 믹스 컬러 */
  mixColor: string;
  /** 믹스 컬러 염색 비율 */
  mixRate: number;
  /** 프리스타일 쿠폰 적용 여부(0: 미적용, 1: 적용) */
  freestyleFlag: boolean;
};

export type HairStyle = BeautyStyle;

export type FaceStyle = BeautyStyle;

export interface SkinStyle {
  name: string;
  colorStyle: string;
  hue: number;
  saturation: number;
  brightness: number;
}

export interface BeautyState {
  hair: HairStyle | null;
  face: FaceStyle | null;
  skin: SkinStyle | null;
}

export interface CharacterBeauty {
  date: string | null;
  characterGender: string;
  /** 현재 장착중인 (헤어, 성형, 피부)*/
  equipped: BeautyState;
  /** 제로인 경우 베타, 엔젤릭버스터인 경우 드레스 업 모드에 적용 중인 (헤어, 성형, 피부) 정보 */
  additional: BeautyState;
}
