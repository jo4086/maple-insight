import { classJobIdMap, rawJobCategoryMap } from './class-code';
import type { ClassJobStage, RawJobCategory } from './class-code';
import type { AllClassKey, AllClassName } from './class-group-map';

export const jobPrefixLabels = {
  '00': '모험가',
  '01': '시그너스 기사단',
  '02': '영웅',
  '03': '레지스탕스',
  '05': '미하일',
  '06': '노바',
  '10': '초월자',
  '14': '프렌즈 월드',
  '15': '레프',
  '16': '아니마',
  '19': '마족',
} as const;

export type JobPrefix = keyof typeof jobPrefixLabels;
export type JobPrefixLabel = (typeof jobPrefixLabels)[JobPrefix];
export type JobClassGroup = 'novice' | 'warrior' | 'mage' | 'archer' | 'thief' | 'pirate';

export interface JobIdMatch {
  classKey: AllClassKey;
  className: AllClassName;
  stage: ClassJobStage;
}

type NormalizedJobIdResult = {
  jobId: string;
  normalizedJobId: string;
};

export type JobIdClassification =
  | (NormalizedJobIdResult & {
      kind: 'job';
      prefix: JobPrefix;
      prefixLabel: JobPrefixLabel;
      matches: readonly JobIdMatch[];
      ambiguous: boolean;
      classGroup?: JobClassGroup | readonly JobClassGroup[];
      stage?: ClassJobStage;
      branch?: number;
      explicitException: boolean;
    })
  | (NormalizedJobIdResult & { kind: 'dummy' })
  | (NormalizedJobIdResult & { kind: 'unknown' })
  | (NormalizedJobIdResult & { kind: 'skillGroup'; category: RawJobCategory })
  | { kind: 'system'; jobId: string }
  | { kind: 'invalid'; jobId: string };

const classGroupByCode = {
  '0': 'novice',
  '1': 'warrior',
  '2': 'mage',
  '3': 'archer',
  '4': 'thief',
  '5': 'pirate',
} as const satisfies Record<string, JobClassGroup>;

const retiredEvanIds = new Set(['02210', '02212', '02213', '02215', '02216', '02218']);
const evanExceptionIds = new Set(['02200', '02211', '02214', '02217', '02220']);
const luminousExceptionIds = new Set(['02700', '02710', '02711', '02712', '02714']);
const dualBladeExceptionIds = new Set(['00430', '00432']);
const xenonExceptionIds = new Set(['03600', '03610', '03611', '03612', '03614']);

const jobMatchesByNormalizedId = buildJobMatches();

function buildJobMatches(): ReadonlyMap<string, readonly JobIdMatch[]> {
  const matches = new Map<string, JobIdMatch[]>();

  for (const [classKey, jobsByStage] of Object.entries(classJobIdMap)) {
    for (const [stage, jobsById] of Object.entries(jobsByStage)) {
      for (const [jobId, className] of Object.entries(jobsById)) {
        const normalizedJobId = jobId.padStart(5, '0');
        const current = matches.get(normalizedJobId) ?? [];
        current.push({
          classKey: classKey as AllClassKey,
          className: className as AllClassName,
          stage: Number(stage) as ClassJobStage,
        });
        matches.set(normalizedJobId, current);
      }
    }
  }

  return matches;
}

function getClassGroup(normalizedJobId: string): JobClassGroup | readonly JobClassGroup[] | undefined {
  if (luminousExceptionIds.has(normalizedJobId)) {
    return 'mage';
  }

  if (xenonExceptionIds.has(normalizedJobId)) {
    return ['thief', 'pirate'];
  }

  return classGroupByCode[normalizedJobId.at(-3) as keyof typeof classGroupByCode];
}

function isExplicitException(normalizedJobId: string): boolean {
  return (
    normalizedJobId === '03001' ||
    evanExceptionIds.has(normalizedJobId) ||
    luminousExceptionIds.has(normalizedJobId) ||
    dualBladeExceptionIds.has(normalizedJobId) ||
    xenonExceptionIds.has(normalizedJobId)
  );
}

export function classifyJobId(jobId: string): JobIdClassification {
  if (!/^\d+$/.test(jobId)) {
    return { kind: 'invalid', jobId };
  }

  if (jobId.length === 6) {
    return { kind: 'system', jobId };
  }

  if (jobId.length > 5) {
    return { kind: 'invalid', jobId };
  }

  const normalizedJobId = jobId.padStart(5, '0');
  const normalizedResult = { jobId, normalizedJobId };
  const category = rawJobCategoryMap[normalizedJobId as keyof typeof rawJobCategoryMap];

  if (category) {
    return { ...normalizedResult, kind: 'skillGroup', category };
  }

  const numericJobId = Number(normalizedJobId);
  if (retiredEvanIds.has(normalizedJobId) || (numericJobId >= 7000 && numericJobId <= 9999)) {
    return { ...normalizedResult, kind: 'dummy' };
  }

  const matches = jobMatchesByNormalizedId.get(normalizedJobId);
  const prefix = normalizedJobId.slice(0, 2) as JobPrefix;

  if (!matches || !(prefix in jobPrefixLabels) || prefix === '19') {
    return { ...normalizedResult, kind: 'unknown' };
  }

  const stages = new Set(matches.map((match) => match.stage));
  const stage = stages.size === 1 ? matches[0].stage : undefined;
  const classGroup = getClassGroup(normalizedJobId);
  const branchDigit = Number(normalizedJobId.at(-2));
  const branch = stage !== undefined && stage >= 2 && !evanExceptionIds.has(normalizedJobId) ? branchDigit : undefined;

  return {
    ...normalizedResult,
    kind: 'job',
    prefix,
    prefixLabel: jobPrefixLabels[prefix],
    matches,
    ambiguous: new Set(matches.map((match) => match.className)).size > 1 || new Set(matches.map((match) => match.stage)).size > 1,
    ...(classGroup ? { classGroup } : {}),
    ...(stage !== undefined ? { stage } : {}),
    ...(branch !== undefined ? { branch } : {}),
    explicitException: isExplicitException(normalizedJobId),
  };
}
