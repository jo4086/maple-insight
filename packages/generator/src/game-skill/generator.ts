import {
  fifthAdventurerClassGroupSkillMap,
  fifthClassEnhancementMap,
  fifthClassGroupSkillMap,
  fifthClassSkillMap,
  fifthCommonSkills,
  fifthLineageBlessingSkillMap,
  fifthLineageCommonSkillMap,
  filterZeroJobSkillsByClass,
  getSkillRawJobCategory,
  rawCommonZeroSkillNames,
  sixthLineageClassGroupSkillIdOverrides,
  sixthSpecialEnhancementExtendRules,
  sixthSpecialEnhancementReplaceRules,
  getClassNamesByJobId,
} from '@maple/data-skill';
import { findGameSkillsByJobIds } from '@maple/db/admin';

import { finalClassSkillContextMap, fifthClassGroupJobIdMap } from './class-skill-context';
import { categoryJobIdFileNameMap, finalClassJobIdMap } from './job-id-map';
import { createSixthClassEnhancementMap } from './sixth-enhancement';
import { resolveSixthLineageClassGroupSkillRule } from './sixth-lineage-class-group';
import type { GeneratedRawJobSkillPayload, GeneratedRawSkill } from './types';

function getTargetJobIds(): string[] {
  return [...new Set([...Object.values(finalClassJobIdMap).flat(), ...Object.keys(categoryJobIdFileNameMap)])].sort((left, right) => Number(left) - Number(right));
}

function toRawSkill(skill: Awaited<ReturnType<typeof findGameSkillsByJobIds>>[number]): GeneratedRawSkill {
  return {
    jobID: skill.jobId,
    skillID: skill.skillId,
    skillName: skill.skillName,
    skillDesc: skill.skillDesc ?? '',
    maxLevel: skill.maxLevel?.toString() ?? '',
    invisible: skill.invisible === true ? 'True' : skill.invisible === false ? 'False' : '',
    hyper: skill.hyper?.toString() ?? '',
    reqSkill: skill.reqSkill ?? '',
    reqSkillLevel: skill.reqSkillLevel?.toString() ?? '',
    reqLevel: skill.reqLevel?.toString() ?? '',
  };
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

function collectLinkedSkillNames(rule?: {
  skills?: readonly string[];
  internalSkills?: readonly string[];
  linkedGroups?: readonly { source: string; linkedSkills: readonly string[] }[];
}): string[] {
  if (!rule) {
    return [];
  }

  return unique([...(rule.skills ?? []), ...(rule.internalSkills ?? []), ...(rule.linkedGroups ?? []).flatMap((group) => [group.source, ...group.linkedSkills])]);
}

function toFifthEnhancementSkillNames(classKey: keyof typeof fifthClassEnhancementMap): string[] {
  const enhancement = fifthClassEnhancementMap[classKey];

  return enhancement ? enhancement.skills.map((skill) => `${skill} 강화`) : [];
}

const sixthCommonSkillNames = [
  '솔 야누스',
  '솔 야누스 : 황혼',
  '솔 야누스 : 새벽',
  '솔 헤카테',
  '솔 헤카테 : 스틱스',
  '솔 헤카테 : 카론',
  '솔 헤카테 : 플레게톤',
  '솔 헤카테 : 팩텀',
] as const;

function pickSkillsByName(skills: readonly GeneratedRawSkill[], names: readonly string[]): GeneratedRawSkill[] {
  const nameSet = new Set(names);
  return skills.filter((skill) => nameSet.has(skill.skillName));
}

function pickSkillsById(skills: readonly GeneratedRawSkill[], skillIds: readonly string[]): GeneratedRawSkill[] {
  const skillIdSet = new Set(skillIds);
  return skills.filter((skill) => skillIdSet.has(skill.skillID));
}

function resolveFifthCommonSkillNames(className: keyof typeof finalClassSkillContextMap): string[] {
  const context = finalClassSkillContextMap[className];
  const lineageClassGroupSkills = context.lineage === 'adventurer' ? (fifthAdventurerClassGroupSkillMap[context.classGroup] ?? []) : [];
  const classKey = context.classKey as keyof typeof fifthClassEnhancementMap;

  return unique([
    ...fifthCommonSkills,
    ...(fifthLineageBlessingSkillMap[context.lineage] ?? []),
    ...(fifthLineageCommonSkillMap[context.lineage] ?? []),
    ...lineageClassGroupSkills,
    ...toFifthEnhancementSkillNames(classKey),
  ]);
}

function resolveFifthClassGroupSkillNames(className: keyof typeof finalClassSkillContextMap): string[] {
  const context = finalClassSkillContextMap[className];
  const classKey = context.classKey as keyof typeof fifthClassSkillMap;

  return unique([...collectLinkedSkillNames(fifthClassSkillMap[classKey]), ...(fifthClassGroupSkillMap[context.classGroup] ?? [])]);
}

function resolveSixthCommonSkillNames(className: keyof typeof finalClassSkillContextMap): string[] {
  const context = finalClassSkillContextMap[className];
  const sixthClassEnhancementMap = createSixthClassEnhancementMap();
  const classKey = context.classKey as keyof typeof sixthClassEnhancementMap;
  const fifthLineageClassGroupSkills = [
    ...(fifthLineageCommonSkillMap[context.lineage] ?? []),
    ...(context.lineage === 'adventurer' ? (fifthAdventurerClassGroupSkillMap[context.classGroup] ?? []) : []),
  ];
  const lineageClassGroupSixthSkills = fifthLineageClassGroupSkills.flatMap((skill) => collectLinkedSkillNames(resolveSixthLineageClassGroupSkillRule(skill)));
  const idOverrideSkillNames = Object.keys(sixthLineageClassGroupSkillIdOverrides[context.classKey as keyof typeof sixthLineageClassGroupSkillIdOverrides] ?? {});

  return unique([...sixthCommonSkillNames, ...lineageClassGroupSixthSkills, ...collectLinkedSkillNames(sixthClassEnhancementMap[classKey])]).filter(
    (skillName) => !idOverrideSkillNames.includes(skillName),
  );
}

function resolveSixthCommonSkillIds(className: keyof typeof finalClassSkillContextMap): string[] {
  const context = finalClassSkillContextMap[className];
  const idOverrides = sixthLineageClassGroupSkillIdOverrides[context.classKey as keyof typeof sixthLineageClassGroupSkillIdOverrides] ?? {};

  return unique(Object.values(idOverrides).flat());
}

function excludeSkillNames(skills: readonly GeneratedRawSkill[], skillNames: readonly string[]): GeneratedRawSkill[] {
  const skillNameSet = new Set(skillNames);

  return skills.filter((skill) => !skillNameSet.has(skill.skillName));
}

function resolveSixthSpecialEnhancementSkillIds(className: keyof typeof finalClassSkillContextMap): string[] {
  const context = finalClassSkillContextMap[className];
  const classKey = context.classKey as keyof typeof fifthClassSkillMap;
  const fifthClassSkillNames = new Set(collectLinkedSkillNames(fifthClassSkillMap[classKey]));
  const extendSkillIds = Object.entries(sixthSpecialEnhancementExtendRules)
    .filter(([skillName]) => fifthClassSkillNames.has(skillName))
    .flatMap(([, rule]) => [rule.enhancementSkillId]);
  const replaceSkillIds = Object.entries(sixthSpecialEnhancementReplaceRules)
    .filter(([skillName]) => fifthClassSkillNames.has(skillName))
    .flatMap(([, rule]) => [rule.replacementSkillId, ...('replacementInternalSkillIds' in rule ? rule.replacementInternalSkillIds : [])]);

  return unique([...extendSkillIds, ...replaceSkillIds]);
}

function appendGeneratedCommonSkillGroups(
  className: keyof typeof finalClassSkillContextMap,
  skillGroups: Record<string, GeneratedRawSkill[]>,
  skillsByJobId: Record<string, GeneratedRawSkill[]>,
): Record<string, GeneratedRawSkill[]> {
  const context = finalClassSkillContextMap[className];
  const fifthClassGroupJobId = fifthClassGroupJobIdMap[context.classGroup];
  const fifthCommonSkillsForClass = pickSkillsByName(skillsByJobId['40000'] ?? [], resolveFifthCommonSkillNames(className));
  const fifthClassGroupSkillsForClass = pickSkillsByName(skillsByJobId[fifthClassGroupJobId] ?? [], resolveFifthClassGroupSkillNames(className));
  const sixthCommonSkillIdOverrides = pickSkillsById(skillsByJobId['50000'] ?? [], resolveSixthCommonSkillIds(className));
  const sixthCommonSkillIdOverrideNames = unique(sixthCommonSkillIdOverrides.map((skill) => skill.skillName));
  const sixthCommonSkillsForClass = [
    ...excludeSkillNames(pickSkillsByName(skillsByJobId['50000'] ?? [], resolveSixthCommonSkillNames(className)), sixthCommonSkillIdOverrideNames),
    ...sixthCommonSkillIdOverrides,
  ];
  const sixthSpecialEnhancementSkillsForClass = pickSkillsById(skillsByJobId['50006'] ?? [], resolveSixthSpecialEnhancementSkillIds(className));

  return {
    ...skillGroups,
    ...(fifthCommonSkillsForClass.length > 0 ? { '40000': fifthCommonSkillsForClass } : {}),
    ...(fifthClassGroupSkillsForClass.length > 0 ? { [fifthClassGroupJobId]: fifthClassGroupSkillsForClass } : {}),
    ...(sixthCommonSkillsForClass.length > 0 ? { '50000': sixthCommonSkillsForClass } : {}),
    ...(sixthSpecialEnhancementSkillsForClass.length > 0 ? { '50006': sixthSpecialEnhancementSkillsForClass } : {}),
  };
}

export async function createGeneratedRawSkillMapByJobId(version: string): Promise<Record<string, GeneratedRawSkill[]>> {
  const jobIds = getTargetJobIds();
  const skills = await findGameSkillsByJobIds({
    version,
    jobIds,
  });
  const skillsByJobId: Record<string, GeneratedRawSkill[]> = Object.fromEntries(jobIds.map((jobId) => [jobId, []]));

  for (const skill of skills) {
    skillsByJobId[skill.jobId]?.push(toRawSkill(skill));
  }

  return skillsByJobId;
}

export async function createGeneratedRawJobSkills(version: string): Promise<GeneratedRawJobSkillPayload> {
  const jobIds = getTargetJobIds();
  const skillsByJobId = await createGeneratedRawSkillMapByJobId(version);

  const groups = jobIds.map((jobId) => {
    const classNames = getClassNamesByJobId(jobId);
    const category = getSkillRawJobCategory(jobId);

    return {
      jobId,
      ...(classNames.length > 0 ? { classNames } : {}),
      ...(category ? { category } : {}),
      skills: skillsByJobId[jobId] ?? [],
    };
  });

  return {
    version,
    jobCount: groups.length,
    skillCount: Object.values(skillsByJobId).reduce((sum, skills) => sum + skills.length, 0),
    groups,
  };
}

export async function createGeneratedRawSkillGroupsByFinalClass(version: string) {
  const skillsByJobId = await createGeneratedRawSkillMapByJobId(version);

  return Object.fromEntries(
    Object.entries(finalClassJobIdMap).map(([className, jobIds]) => {
      const skillGroups = Object.fromEntries(jobIds.map((jobId) => [jobId, skillsByJobId[jobId] ?? []]));
      const filteredSkillGroups = filterZeroJobSkillsByClass(skillGroups, {
        className,
        zeroJobIDs: [jobIds[0]],
        additionalAllowedSkillNames: rawCommonZeroSkillNames,
      });

      return [className, appendGeneratedCommonSkillGroups(className as keyof typeof finalClassSkillContextMap, filteredSkillGroups, skillsByJobId)];
    }),
  );
}

export async function createGeneratedRawSkillGroupsByCategory(version: string) {
  const skillsByJobId = await createGeneratedRawSkillMapByJobId(version);

  return Object.fromEntries(
    Object.entries(categoryJobIdFileNameMap).map(([jobId, fileName]) => [
      fileName,
      {
        jobId,
        category: getSkillRawJobCategory(jobId),
        skills: skillsByJobId[jobId] ?? [],
      },
    ]),
  );
}
