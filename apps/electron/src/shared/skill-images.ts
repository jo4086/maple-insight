export type SkillImageIdentity = {
  jobId: string
  skillId: string
}

export type ListSkillImagesRequest = {
  version: string
  identities: SkillImageIdentity[]
}

export type SkillImageData = SkillImageIdentity & {
  icon: string | null
  iconMouseOver: string | null
  iconDisabled: string | null
}

export type ExtractSkillImagesRequest = {
  version: string
  representativeJobId: string
}

export type ExtractSkillImagesResult = {
  jobs: number
  created: number
  reused: number
  missing: number
  failed: number
  missingJobs: number
}
