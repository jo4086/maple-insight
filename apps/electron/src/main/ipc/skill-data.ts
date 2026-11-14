import type { ListSkillDataRequest, SkillSummary } from '../../shared/skill-data'

import type { MainIpcContext } from './register'

const LIST_SKILL_DATA_CHANNEL = 'skill-data:list'

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
  return [LIST_SKILL_DATA_CHANNEL]
}
