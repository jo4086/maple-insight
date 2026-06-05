import { ClassGroup } from '@/class';

export interface ClassEquipmentNameTemplate {
  prefix?: string;
  classPrefixMap?: Partial<Record<ClassGroup, string>>;
  suffix: string;
}

export interface GeneralEquipmentNameTemplate {
  fullName: string;
}

export type EquipmentNameTemplate = ClassEquipmentNameTemplate | GeneralEquipmentNameTemplate;

export interface EquipmentTemplateBase {
  hp?: number;
  mp?: number;
  hpRate?: number;
  mpRate?: number;
  atk?: number;
  def?: number;
  imd?: number;
  reqLevel: number;
  reqClass?: ClassGroup;
  bossDamage?: number;
  setEffect?: string;
  useBothAttackAndMagicAttack: boolean;
}

export interface EquipmentTemplateStat extends EquipmentTemplateBase {
  nameTemplate: ClassEquipmentNameTemplate;
  mainStat: number;
  subStat?: number;
  otherStat?: number;
  reqClass: ClassGroup;
}

export interface GeneralEquipmentTemplateStat extends EquipmentTemplateBase {
  nameTemplate: GeneralEquipmentNameTemplate;
  stat: number;
}

export interface EquipmentTemplateBaseOption {
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
}
