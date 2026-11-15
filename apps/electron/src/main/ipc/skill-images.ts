import type {
  ExtractSkillImagesRequest,
  ExtractSkillImagesResult,
  ListSkillImagesRequest,
  SkillImageData,
  SkillImageIdentity
} from '../../shared/skill-images'
import { listJobData } from '../services/jobs/job-data'
import { extractSkillImages, listSkillImageData } from '../services/skills/skill-images'

import type { MainIpcContext } from './register'

const listChannel = 'skill-images:list'
const extractChannel = 'skill-images:extract'
const versionPattern = /^\d+\.\d+\.\d+$/
const jobIdPattern = /^\d{1,5}$/
const skillIdPattern = /^\d{1,10}$/
let extractionActive = false

function isSkillImageIdentity(value: unknown): value is SkillImageIdentity {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const identity = value as Record<string, unknown>
  return (
    Object.keys(identity).length === 2 &&
    typeof identity.jobId === 'string' &&
    jobIdPattern.test(identity.jobId) &&
    typeof identity.skillId === 'string' &&
    skillIdPattern.test(identity.skillId)
  )
}

function isExtractRequest(value: unknown): value is ExtractSkillImagesRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const request = value as Record<string, unknown>
  return (
    Object.keys(request).length === 2 &&
    typeof request.version === 'string' &&
    versionPattern.test(request.version) &&
    typeof request.representativeJobId === 'string' &&
    jobIdPattern.test(request.representativeJobId)
  )
}

function isListRequest(value: unknown): value is ListSkillImagesRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const request = value as Record<string, unknown>
  return (
    Object.keys(request).length === 2 &&
    typeof request.version === 'string' &&
    versionPattern.test(request.version) &&
    Array.isArray(request.identities) &&
    request.identities.length <= 100 &&
    request.identities.every(isSkillImageIdentity)
  )
}

export function registerSkillImageHandlers(context: MainIpcContext): string[] {
  context.ipcMain.handle(listChannel, async (_, value: unknown): Promise<SkillImageData[]> => {
    if (!isListRequest(value)) throw new Error('Invalid skill image request')
    return listSkillImageData(value.version, value.identities)
  })

  context.ipcMain.handle(
    extractChannel,
    async (_, value: unknown): Promise<ExtractSkillImagesResult> => {
      if (!isExtractRequest(value)) throw new Error('Invalid skill image extraction request')
      if (extractionActive) throw new Error('이미 다른 스킬 이미지 추출 작업이 진행 중입니다.')
      extractionActive = true
      try {
        const environment = await context.resolveValidationEnvironment(value.version)
        const snapshot = await listJobData({
          dataRoot: context.resolveManagedDataRoot(),
          environment,
          version: value.version
        })
        const group = snapshot.jobGroups.find(
          ({ representativeJobId }) => representativeJobId === value.representativeJobId
        )
        if (!group) throw new Error('선택한 직업을 현재 버전에서 찾을 수 없습니다.')
        return await extractSkillImages(
          value.version,
          group.advancements.map(({ jobId }) => jobId)
        )
      } finally {
        extractionActive = false
      }
    }
  )

  return [listChannel, extractChannel]
}
