export type SkillSummary = {
  skillId: string
  jobId: string
  skillName: string
  skillDesc: string | null
  maxLevel: number | null
  invisible: boolean | null
  hyper: number | null
  reqSkill: string | null
  reqSkillLevel: number | null
  reqLevel: number | null
}

export type ListSkillDataRequest = {
  version: string
  jobIds: string[]
}
