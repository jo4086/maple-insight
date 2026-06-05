import type { FilterZeroJobSkillsOptions, RawSkillGroupMap, RawSkillRow, ResolveClassZeroSkillIDsOptions } from '@@types';
import {
  adventurerClassNames,
  animaClassNames,
  cygnusClassNames,
  demonClassNames,
  friendsWorldClassNames,
  heroesClassNames,
  lefClassNames,
  novaClassNames,
  resistanceSkillClassNames,
  transcendentClassNames,
} from '@maple/data-class';

import { rawZeroSkillInjectionRules } from './rule';

const lineageClassNames = {
  adventurer: adventurerClassNames,
  cygnus: cygnusClassNames,
  heroes: heroesClassNames,
  resistance: resistanceSkillClassNames,
  demon: demonClassNames,
  nova: novaClassNames,
  transcendent: transcendentClassNames,
  friendsWorld: friendsWorldClassNames,
  lef: lefClassNames,
  anima: animaClassNames,
} as const;

export function getDefaultAllowedZeroSkillIDs(): Set<string> {
  return new Set(rawZeroSkillInjectionRules.flatMap((rule) => rule.skills.map((skill) => skill.skillID)));
}

function isIncluded<T extends string>(items: readonly T[] | undefined, value: string): boolean {
  return items?.includes(value as T) ?? false;
}

function isLineageMatched(lineages: readonly string[] | undefined, className: string): boolean {
  return (
    lineages?.some((lineage) => {
      const classNames = lineageClassNames[lineage as keyof typeof lineageClassNames];
      return classNames ? isIncluded(classNames, className) : false;
    }) ?? false
  );
}

export function getAllowedZeroSkillIDsByClass(options: ResolveClassZeroSkillIDsOptions): Set<string> {
  const allowedSkillIDs = new Set(options.additionalAllowedSkillIDs ?? []);

  for (const rule of rawZeroSkillInjectionRules) {
    const isClassMatched = 'classes' in rule.appliesTo && isIncluded(rule.appliesTo.classes, options.className);
    const isLineageMatch = 'lineages' in rule.appliesTo && isLineageMatched(rule.appliesTo.lineages, options.className);

    if (!isClassMatched && !isLineageMatch) {
      continue;
    }

    for (const skill of rule.skills) {
      allowedSkillIDs.add(skill.skillID);
    }
  }

  return allowedSkillIDs;
}

export function filterZeroJobSkillsByClass<TSkill extends RawSkillRow>(
  skillGroups: RawSkillGroupMap<TSkill>,
  options: FilterZeroJobSkillsOptions & ResolveClassZeroSkillIDsOptions,
): Record<string, TSkill[]> {
  return filterZeroJobSkills(skillGroups, {
    zeroJobIDs: options.zeroJobIDs,
    includeDefaultAllowedZeroSkills: false,
    additionalAllowedSkillIDs: [...getAllowedZeroSkillIDsByClass(options)],
    additionalAllowedSkillNames: options.additionalAllowedSkillNames,
  });
}

export function filterZeroJobSkills<TSkill extends RawSkillRow>(skillGroups: RawSkillGroupMap<TSkill>, options: FilterZeroJobSkillsOptions): Record<string, TSkill[]> {
  const zeroJobIDs = new Set(options.zeroJobIDs);
  const allowedZeroSkillIDs = options.includeDefaultAllowedZeroSkills === false ? new Set<string>() : getDefaultAllowedZeroSkillIDs();

  for (const skillID of options.additionalAllowedSkillIDs ?? []) {
    allowedZeroSkillIDs.add(skillID);
  }
  const allowedZeroSkillNames = new Set(options.additionalAllowedSkillNames ?? []);

  return Object.fromEntries(
    Object.entries(skillGroups).map(([jobID, skills]) => [
      jobID,
      zeroJobIDs.has(jobID) ? skills.filter((skill) => allowedZeroSkillIDs.has(skill.skillID) || allowedZeroSkillNames.has(skill.skillName)) : [...skills],
    ]),
  );
}
