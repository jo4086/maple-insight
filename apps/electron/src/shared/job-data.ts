export type JobSummary = {
  jobId: string
  jobName: string
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
  revision: number
}

export type JobDataSnapshot = {
  jobs: JobSummary[]
  weaponTypes: WeaponTypeOption[]
  drafts: JobDraft[]
}

export type SaveJobDraftRequest = {
  version: string
  draft: JobDraft
}
