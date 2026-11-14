import type {
  ListSkillDataRequest,
  ListSkillLevelsRequest,
  SkillLevel,
  SkillSummary
} from '../../shared/skill-data'

import type { MainIpcContext } from './register'

const LIST_SKILL_DATA_CHANNEL = 'skill-data:list'
const LIST_SKILL_LEVELS_CHANNEL = 'skill-levels:list'

function isListSkillDataRequest(value: unknown): value is ListSkillDataRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const request = value as Record<string, unknown>
  return (
    Object.keys(request).length === 2 &&
    typeof request.version === 'string' &&
    /^\d+\.\d+\.\d+$/.test(request.version) &&
    Array.isArray(request.jobIds) &&
    request.jobIds.length <= 100 &&
    request.jobIds.every((id) => typeof id === 'string' && /^\d{1,7}$/.test(id))
  )
}

function isListSkillLevelsRequest(value: unknown): value is ListSkillLevelsRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const request = value as Record<string, unknown>
  return (
    Object.keys(request).length === 2 &&
    typeof request.version === 'string' &&
    /^\d+\.\d+\.\d+$/.test(request.version) &&
    typeof request.skillId === 'string' &&
    /^\d{1,10}$/.test(request.skillId)
  )
}

export function registerSkillDataHandlers(context: MainIpcContext): string[] {
  context.ipcMain.handle(
    LIST_SKILL_DATA_CHANNEL,
    async (_, value: unknown): Promise<SkillSummary[]> => {
      if (!isListSkillDataRequest(value)) throw new Error('Invalid skill data request')
      if (value.jobIds.length === 0) return []
      const { findGameSkillsByJobIds } = await import('@maple/db/admin/game-skill-query')
      const rows = await findGameSkillsByJobIds({
        version: value.version,
        jobIds: [...new Set(value.jobIds)]
      })
      return rows.map(
        ({ createdAt: _createdAt, updatedAt: _updatedAt, version: _version, ...skill }) => skill
      )
    }
  )
  context.ipcMain.handle(
    LIST_SKILL_LEVELS_CHANNEL,
    async (_, value: unknown): Promise<SkillLevel[]> => {
      if (!isListSkillLevelsRequest(value)) throw new Error('Invalid skill level request')
      const { findGameSkillLevels } = await import('@maple/db/admin/game-skill-query')
      return findGameSkillLevels(value)
    }
  )
  return [LIST_SKILL_DATA_CHANNEL, LIST_SKILL_LEVELS_CHANNEL]
}
