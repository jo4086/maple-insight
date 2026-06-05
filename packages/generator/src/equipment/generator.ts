import {
  classParts,
  commonParts,
  type BaseEquipmentTemplateOption,
  type ClassPart,
  type ClassType,
  type CommonPart,
  type GenericEquipmentTemplate,
  type GeneratedEquipment,
  type Part,
  type Prefix,
  type PrefixEquipmentTemplate,
} from './types';

const commonPartSet = new Set<Part>(commonParts);
const classPartSet = new Set<Part>(classParts);

function isCommonPart(part: Part): part is CommonPart {
  return commonPartSet.has(part);
}

function isClassPart(part: Part): part is ClassPart {
  return classPartSet.has(part);
}

function resolvePartName(prefix: Prefix, part: Part, classType: ClassType): string {
  if (isCommonPart(part)) {
    const commonPartName = prefix.commonPartName[part];

    if (!commonPartName) {
      throw new Error(`Missing common part name for "${part}"`);
    }

    return commonPartName;
  }

  if (isClassPart(part)) {
    const classPartNames = prefix.classPartName[part];

    if (!classPartNames) {
      throw new Error(`Missing class part name map for "${part}"`);
    }

    const classPartName = classPartNames[classType];

    if (!classPartName) {
      throw new Error(`Missing class part name for "${part}" and class "${classType}"`);
    }

    return classPartName;
  }

  throw new Error(`Unsupported part "${part}"`);
}

function resolveEquipmentName(prefix: Prefix, template: PrefixEquipmentTemplate): string {
  const classPrefix = prefix.classPrefix[template.classType];
  const partName = resolvePartName(prefix, template.part, template.classType);

  return `${prefix.main} ${classPrefix}${partName}`;
}

type EquipmentTemplate = PrefixEquipmentTemplate | GenericEquipmentTemplate;

type GeneratedEquipmentOption = Omit<
  GeneratedEquipment,
  'id' | 'name' | 'part' | 'category' | 'classType' | 'setEffect'
>;

function normalizeTemplateOption(template: BaseEquipmentTemplateOption): Required<BaseEquipmentTemplateOption> {
  return {
    mainStat: template.mainStat,
    subStat: template.subStat,
    otherStat: template.otherStat,
    attackPower: template.attackPower ?? 0,
    bothPowerFlag: template.bothPowerFlag ?? false,
    armor: template.armor ?? 0,
    ignoreMonsterArmor: template.ignoreMonsterArmor ?? 0,
    bossDamage: template.bossDamage ?? 0,
    maxHp: template.maxHp ?? 0,
    maxMp: template.maxMp ?? 0,
    maxDf: template.maxDf ?? 0,
    maxHpRate: template.maxHpRate ?? 0,
    maxMpRate: template.maxMpRate ?? 0,
    jump: template.jump ?? 0,
    speed: template.speed ?? 0,
  };
}

function resolveStats(template: EquipmentTemplate): GeneratedEquipmentOption {
  const normalized = normalizeTemplateOption(template);
  const stats = {
    str: 0,
    dex: 0,
    int: 0,
    luk: 0,
    maxHp: normalized.maxHp,
    maxMp: normalized.maxMp,
    maxDf: normalized.maxDf,
    maxHpRate: normalized.maxHpRate,
    maxMpRate: normalized.maxMpRate,
    attackPower: 0,
    magicPower: 0,
    armor: normalized.armor,
    speed: normalized.speed,
    jump: normalized.jump,
    bossDamage: normalized.bossDamage,
    ignoreMonsterArmor: normalized.ignoreMonsterArmor,
    allStat: 0,
    damage: 0,
  };

  if (template.classType === '전사') {
    stats.str = normalized.mainStat;
    stats.dex = normalized.subStat;
    stats.int = normalized.otherStat;
    stats.luk = normalized.otherStat;
  } else if (template.classType === '궁수') {
    stats.dex = normalized.mainStat;
    stats.str = normalized.subStat;
    stats.int = normalized.otherStat;
    stats.luk = normalized.otherStat;
  } else if (template.classType === '마법사') {
    stats.int = normalized.mainStat;
    stats.luk = normalized.subStat;
    stats.str = normalized.otherStat;
    stats.dex = normalized.otherStat;
  } else if (template.classType === '도적') {
    stats.luk = normalized.mainStat;
    stats.dex = normalized.subStat;
    stats.str = normalized.otherStat;
    stats.int = normalized.otherStat;
  } else {
    stats.str = normalized.mainStat;
    stats.dex = normalized.subStat;
    stats.int = normalized.otherStat;
    stats.luk = normalized.otherStat;
  }

  if (normalized.bothPowerFlag) {
    stats.attackPower = normalized.attackPower;
    stats.magicPower = normalized.attackPower;
  } else if (template.classType === '마법사') {
    stats.magicPower = normalized.attackPower;
  } else {
    stats.attackPower = normalized.attackPower;
  }

  return stats;
}

function createEquipmentId(template: EquipmentTemplate): string {
  return [
    template.setEffect ?? 'no-set',
    template.classType,
    template.part,
    'baseLevel' in template ? template.baseLevel : 'generic',
  ]
    .join('-')
    .replaceAll(' ', '-')
    .toLowerCase();
}

export function createEquipment(
  template: EquipmentTemplate,
  prefix?: Prefix,
  category = '',
): GeneratedEquipment {
  const name = 'name' in template ? template.name : resolveEquipmentName(prefix as Prefix, template);

  return {
    id: createEquipmentId(template),
    name,
    part: template.part,
    category,
    classType: template.classType,
    setEffect: template.setEffect,
    ...resolveStats(template),
  };
}

export function createEquipments(
  templates: EquipmentTemplate[],
  prefix?: Prefix,
  category = '',
): GeneratedEquipment[] {
  return templates.map((template) => createEquipment(template, prefix, category));
}
