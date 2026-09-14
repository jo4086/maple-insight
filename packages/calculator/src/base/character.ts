import {
  classGroupStatMetaMap,
  resolveClassNameGroups,
  specialStatClassMetaMap,
  type AllClassName,
  type ClassJobStage,
  type SpecialStatClassName,
  type Stat,
} from '@maple/data-core';

export type CharacterBaseInput = {
  level: number;
  job: AllClassName;
  classLevel: ClassJobStage;
};

export type CharacterBaseResult = {
  mainStats: readonly Stat[];
  statValue: number;
};

type CharacterStatRule = {
  defaultValue: number;
  levelValue: number;
  classAdvancementValue: number;
};

const GENERAL_STAT_RULE = {
  defaultValue: 8,
  levelValue: 5,
  classAdvancementValue: 5,
} as const satisfies CharacterStatRule;

const DEMON_AVENGER_STAT_RULE = {
  defaultValue: 404,
  levelValue: 90,
  classAdvancementValue: 75,
} as const satisfies CharacterStatRule;

function resolveMainStats(job: AllClassName): readonly Stat[] {
  if (Object.hasOwn(specialStatClassMetaMap, job)) {
    return specialStatClassMetaMap[job as SpecialStatClassName].mainStat;
  }

  const [classGroup] = resolveClassNameGroups(job);

  return classGroup ? [classGroupStatMetaMap[classGroup].mainStat] : [];
}

function calculateClassAdvancementValue(classLevel: ClassJobStage, value: number): number {
  const thirdClassValue = classLevel >= 3 ? value : 0;
  const fourthClassValue = classLevel >= 4 ? value : 0;

  return thirdClassValue + fourthClassValue;
}

export function characterBase({ level, job, classLevel }: CharacterBaseInput): CharacterBaseResult {
  const rule = job === '데몬어벤져' ? DEMON_AVENGER_STAT_RULE : GENERAL_STAT_RULE;
  const statValue = level * rule.levelValue + rule.defaultValue + calculateClassAdvancementValue(classLevel, rule.classAdvancementValue);

  return {
    mainStats: resolveMainStats(job),
    statValue,
  };
}
