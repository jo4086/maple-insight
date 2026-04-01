import { classTree, type ClassTreeJobMeta } from './classTree';

type ProgressionLevel = string;

export interface ClassLookupMeta {
  className: string;
  finalJob: string;
  affiliation: ClassTreeJobMeta['affiliation'];
  primaryGroup: ClassTreeJobMeta['primaryGroup'];
  secondaryGroups: ClassTreeJobMeta['secondaryGroups'];
  progressionLevel: ProgressionLevel;
}

function mergeSecondaryGroups(
  current: ClassLookupMeta['secondaryGroups'],
  next: ClassLookupMeta['secondaryGroups'],
): ClassLookupMeta['secondaryGroups'] {
  const merged = new Set([...(current ?? []), ...(next ?? [])]);

  return merged.size > 0 ? [...merged] : undefined;
}

function createClassMetaMap() {
  const classMetaMap = new Map<string, ClassLookupMeta>();

  for (const groups of Object.values(classTree)) {
    for (const jobs of Object.values(groups)) {
      for (const [finalJob, meta] of Object.entries(jobs)) {
        for (const [progressionLevel, className] of Object.entries(meta.progression)) {
          const existing = classMetaMap.get(className);
          const nextMeta: ClassLookupMeta = {
            className,
            finalJob,
            affiliation: meta.affiliation,
            primaryGroup: meta.primaryGroup,
            secondaryGroups: meta.secondaryGroups,
            progressionLevel,
          };

          if (!existing) {
            classMetaMap.set(className, nextMeta);
            continue;
          }

          classMetaMap.set(className, {
            ...existing,
            secondaryGroups: mergeSecondaryGroups(existing.secondaryGroups, [
              nextMeta.primaryGroup,
              ...(nextMeta.secondaryGroups ?? []),
            ]),
          });
        }
      }
    }
  }

  return classMetaMap;
}

export const classMetaMap = createClassMetaMap();

export function getClassMeta(className: string) {
  return classMetaMap.get(className) ?? null;
}
