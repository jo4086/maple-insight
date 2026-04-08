import { ClassType } from '@maple/types';

import { AndroidEquipment } from './android-equipment2';

interface EquipmentOption {
  str: number;
  dex: number;
  int: number;
  luk: number;
  maxHp: number;
  maxMp: number;
  attackPower: number;
  magicPower: number;
  armor: number;
  speed: number;
  jump: number;
  bossDamage: number;
  ignoreMonsterArmor: number;
  allStat: number;
  damage: number;
  equipmentLevelDecrease: number;
  maxHpRate: number;
  maxMpRate: number;
}

interface PotentialOption {
  potentialGrade: string | null;
  potentialFlag: boolean;
  potential1: string | null;
  potential2: string | null;
  potential3: string | null;

  additionalGrade: string | null;
  additionalFlag: boolean;
  additional1: string | null;
  additional2: string | null;
  additional3: string | null;
}

interface BaseEquipment {
  /**
   * 착용 레벨
   * */
  baseLevel: number;
  name: string;
  part: string;
  category: string;
  classType: ClassType;
  slot: string;
  icon: string;
  description: string | null;
  shapeName: string;
  shapeIcon: string;
  gender: string | null;
  dateExpire: string | null;
  freestyleFlag: boolean;
  /**
   * 스타포스
   * */
  starforce: number;
  /**
   * 스타포스 상한치
   * */
  starforceLimit: number;
  /**
   * 가위 사용 가능 횟수 (교환 불가 장비, 가위 횟수가 없는 교환 가능 장비는 255)
   * */
  cuttableCount: number;
  /**
   * 주문서 횟수
   * */
  scrollUpgrade: number;
  /**
   * 주문서 잔여 횟수
   */
  scrollUpgradableCount: number;
  soulName: string | null;
  soulOption: string | null;
  /**
   * 놀라운 장비 강화 주문서 사용 여부 (false:미사용, true:사용)
   * */
  starforceScrollFlag: boolean;
  specialRingLevel: number;
  // equipmentLevelIncrease: number; 안쓰는 옵션
  /**
   * 성장 경험치
   */
  growthExp: number;
  /**
   * 성장 레벨
   * */
  growthLevel: number;
  options: {
    /** 종합 옵션 */
    total: EquipmentOption;
    /** 기본 옵션 */
    base: EquipmentOption;
    /** 추가  옵션 */
    add: EquipmentOption;
    /** 스타포스 옵션 */
    starforce: EquipmentOption;
    /** 주문서 옵션 */
    scroll: EquipmentOption;
    /** 익셉셔널 옵션 */
    exceptional: EquipmentOption;
  };
}

export type ItemEquipment = BaseEquipment & PotentialOption;
export type DragonEquipment = BaseEquipment;
export type MechanicEquipment = BaseEquipment;

export interface Title {
  /** 칭호 장비명 */
  titleName: string;
  /** 칭호 아이콘 */
  titleIcon: string;
  /** 칭호 설명 */
  titleDescription: string;
  /** 칭호 유효 기간 (expired:만료, null:무제한) (KST) */
  dateExpire: string | null;
  /** 칭호 옵션 유효 기간 (expired:만료, null:무제한) (KST) */
  dateOptionExpire: string | null;
  /** 외형 설정에 등록한 칭호 장비 명 */
  titleShapeName: string;
  /** 외형 설정에 등록한 칭호 아이콘 */
  titleShapeIcon: string;
  /** 외형 설정에 등록한 칭호 설명 */
  titleShapeDescription: string;
}

export interface MedalShape {
  /** 외형 설정에 등록한 훈장 장비 명 */
  name: string;
  /** 외형 설정에 등록한 훈장 아이콘 */
  icon: string;
  /** 외형 설정에 등록한 훈장 외형 정보 */
  description: string | null;
  /** 외형 설정에 등록한 훈장의 모루 적용 장비 명 */
  changedName: string;
  /** 외형 설정에 등록한 훈장의 모루 적용 아이콘 */
  changedIcon: string;
  /** 외형 설정에 등록한 훈장의 모루 적용 훈장 설명 */
  changedDescription: string | null;
}

export interface BasePreset {
  itemEquipment: ItemEquipment[];
  dragonEquipment: DragonEquipment[];
  mechanicEquipment: MechanicEquipment[];
  androidEquipment: AndroidEquipment | null;
}

export interface EquipmentPreset extends BasePreset {
  no: number;
}

export interface CharacterEquipment extends BasePreset {
  title: Title | null;
  medalShape: MedalShape | null;
  presetNo: number;
  presets: EquipmentPreset[];
}
