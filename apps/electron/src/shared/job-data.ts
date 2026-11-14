export type JobSummary = {
  jobId: string
  jobName: string
}

export type JobAdvancement = JobSummary & {
  stage: 0 | 1 | 1.5 | 2 | 2.5 | 3 | 4 | 6
  displayName?: string
  requiresReview: boolean
}

export type JobGroup = {
  classKey: string
  representativeJobId: string
  representativeName: string
  advancements: JobAdvancement[]
}

export const jobStats = ['STR', 'LUK', 'INT', 'DEX'] as const

export type JobStat = (typeof jobStats)[number]

const jobStatSet = new Set<string>(jobStats)

export function parseJobStats(value: string): JobStat[] | null {
  if (value === '') return []
  const stats = value.split(',').map((stat) => stat.trim())
  if (stats.some((stat) => !jobStatSet.has(stat)) || new Set(stats).size !== stats.length)
    return null
  return stats as JobStat[]
}

export function formatJobStats(stats: readonly JobStat[]): string {
  return stats.join(', ')
}

export type WeaponTypeOption = {
  key: string
  category: 'weapon' | 'subWeapon'
  part: string
  classGroupKeys: string[]
  handType: string | null
  weaponConstant: string | null
}

export type NewWeaponType = {
  key: string
  category: 'weapon' | 'subWeapon'
  part: string
  englishName: string
  classGroupKeys: string[]
  handType: string | null
  weaponConstant: string | null
}

export type JobDraft = {
  jobId: string
  jobName: string
  englishName: string
  classGroup: string
  affiliation: string
  mainStat: string
  subStat: string
  primaryWeapons: string[]
  secondaryWeapons: string[]
  newWeaponTypes: NewWeaponType[]
  advancementJobIds?: string[]
  revision: number
}

export type JobDataSnapshot = {
  jobs: JobSummary[]
  jobGroups: JobGroup[]
  weaponTypes: WeaponTypeOption[]
  drafts: JobDraft[]
  changeSetId: string | null
  editorAvailable: boolean
}

export type SaveJobDraftRequest = {
  version: string
  expectedChangeSetId: string
  draft: JobDraft
}

export type CopySelectedJobDraftRecoveryRequest = {
  version: string
  recoveryId: string
  sourceSha256: string
  jobId: string
}

export type CopySelectedJobDraftRecoveryResult = {
  changeSetId: string
  recordId: string
  revision: number
}

export type JobDraftRecoveryPreview = {
  recoveryId: string | null
  sourceSha256: string | null
  drafts: {
    jobId: string
    jobName: string
    revision: number
    proposedAfter: {
      englishName: string
      classGroup: string
      affiliation: string
      mainStat: string
      subStat: string
      primaryWeapons: string[]
      secondaryWeapons: string[]
    }
    excluded: {
      jobName: string
      newWeaponTypes: NewWeaponType[]
      advancementJobIds: { present: boolean; value: string[] | null }
    }
    blockedForCopy: boolean
    blockingNewWeaponTypeKeys: string[]
  }[]
}
