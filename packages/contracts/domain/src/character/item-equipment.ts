import type { EquipmentClassType } from '@maple/data-core';
import type { SetNames } from '@maple/data-equipment';

import type { AndroidEquipment } from './android-equipment';

/** 아이템 스탯 옵션 */
export interface EquipmentOption {
  /** 힘 */
  str: number;
  /** 민첩 */
  dex: number;
  /** 지력 */
  int: number;
  /** 행운 */
  luk: number;
  /** HP */
  maxHp: number;
  /** MP */
  maxMp: number;
  /** HP (%) */
  maxHpRate: number;
  /** MP (%) */
  maxMpRate: number;
  /** 공격력 */
  attackPower: number;
  /** 마력 */
  magicPower: number;
  /** 방어력 */
  armor: number;
  /** 이동속도 */
  speed: number;
  /** 점프력 */
  jump: number;
  /** 보스 몬스터 데미지 (%) */
  bossDamage: number;
  /** 몬스터 방어율 무시 (%) */
  ignoreMonsterArmor: number;
  /** 올스탯 (%) */
  allStat: number;
  /** 데미지 (%) */
  damage: number;
  /** 장착 장비 레벨 감소 */
  equipmentLevelDecrease: number;
}

type PotentialLine = {
  option: string | null;
  grade: string | null;
};

type PotentialInfo = {
  grade: string | null;
  flag: boolean;
  options: [PotentialLine, PotentialLine, PotentialLine];
};

/** 잠재능력 & 에디셔널 잠재능력 정보 */
type PotentialOptionShape = {
  /** 잠재 */
  potential: PotentialInfo;
  /** 에디셔널 잠재 */
  additional: PotentialInfo;
};

type ItemOptionsShape = {
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

type Scroll = {
  /** 주문서 강화 성공 횟수 */
  scrollUpgrade: number;
  /** 주문서 강화 시도 여부 */
  scrollFlag: boolean;
  /** 주문서 강화 잔여 횟수 */
  scrollUpgradeableCount: number;
  /** 주문서 복구 가능 횟수 */
  scrollResilienceCount: number;
  /** 아이템의 총 주문서 강화 가능 횟수 */
  scrollCount: number;
};

type BaseEquipmentShape = Scroll & {
  /** 착용 레벨 */
  baseLevel: number;
  /** 아이템 이름 */
  name: string;
  /** 세트이름 */
  setName: SetNames | null;
  /** 장착 시 사용 가능해지는 장비 전용 스킬명 */
  grantedSkills: string[];
  /** 아이템 파츠 */
  part: string;
  /** 아이템 분류 */
  category: string;
  /** 착용가능 직업군 */
  classType: EquipmentClassType;
  /** 아이템 슬롯 */
  slot: string;
  /** 아이템 아이콘 */
  icon: string;
  /** 아이템 설명 */
  description: string | null;
  /** 아이템 외형 이름 */
  shapeName: string;
  /** 아이템 외형 아이콘 */
  shapeIcon: string;
  /** 아이템 성별 */
  gender: string | null;
  /** 장비 유효 기간 (expired:만료, null:무제한) (KST)
   *  example: 2023-12-21T17:28+09:00 */
  dateExpire: string | null;
  /** 프리스타일 쿠폰 적용 여부 (false:미적용, true적용) */
  freestyleFlag: boolean;
  /** 스타포스 */
  starforce: number;
  /** 스타포스 상한치 */
  starforceLimit: number;
  /** 스타포스 강화 가능 여부 */
  starforceEnabled: boolean;
  /** 잠재능력 가능 여부 */
  potentialEnabled: boolean;
  /** 주문서 강화 가능 여부 */
  scrollUpgradeEnabled: boolean;
  /** 추가 옵션 가능 여부 */
  addOptionEnabled: boolean;
  /** 가위 사용 가능 횟수 (교환 불가 장비, 가위 횟수가 없는 교환 가능 장비는 255) */
  cuttableCount: number;
  /** 소울 이름 */
  soulName: string | null;
  /** 소울 옵션 */
  soulOption: string | null;
  /** 놀라운 장비 강화 주문서 사용 여부 (false:미사용, true:사용) */
  starforceScrollFlag: boolean;
  /** 특수 반지 레벨 */
  specialRingLevel: number;
  // equipmentLevelIncrease: number; 안쓰는 옵션
  /** 성장 경험치 */
  growthExp: number;
  /** 성장 레벨 */
  growthLevel: number;
  /** 아이템 스탯정보 (total, base, add, starforce, scroll, exceptional) */
  options: ItemOptionsShape;
};

/** 아이템 정보 */
export type ItemEquipment = BaseEquipmentShape & PotentialOptionShape;
/** 드래곤 아이템 정보 */
export type DragonEquipment = BaseEquipmentShape;
/** 메카닉 아이템 정보 */
export type MechanicEquipment = BaseEquipmentShape;

/** 칭호 정보 */
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

/** 훈장 외형 정보 */
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

/** 프리셋 베이스 정보 */
type EquipmentPresetShape = {
  /** 장비 정보 */
  itemEquipment: ItemEquipment[];
  /** 드래곤 장비 정보 */
  dragonEquipment: DragonEquipment[];
  /** 메카닉 장비 정보 */
  mechanicEquipment: MechanicEquipment[];
  /** 안드로이드 장비 정보 */
  androidEquipment: AndroidEquipment | null;
};

/** 캐릭터 장비 정보 */
export interface CharacterEquipment extends EquipmentPresetShape {
  /** 칭호 */
  title: Title | null;
  /** 훈장 외향 */
  medalShape: MedalShape | null;
  /** 현재 장착중인 장비 프리셋 */
  presetNo: number;
  /** 장비 프리셋 */
  presets: (EquipmentPresetShape & { no: number })[];
}
