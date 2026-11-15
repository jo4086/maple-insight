import { beforeEach, describe, expect, it, vi } from 'vitest'

import { registerSkillDataHandlers } from './skill-data'

const findGameSkillsByJobIds = vi.hoisted(() => vi.fn())
const findGameSkillLevels = vi.hoisted(() => vi.fn())
vi.mock('@maple/db/admin/game-skill-query', () => ({ findGameSkillsByJobIds, findGameSkillLevels }))

describe('skill-data:list', () => {
  let handlers: Record<string, (_event: unknown, request: unknown) => Promise<unknown>>

  beforeEach(() => {
    findGameSkillsByJobIds.mockReset()
    findGameSkillLevels.mockReset()
    handlers = {}
    const ipcMain = {
      handle: (channel: string, next: (_event: unknown, request: unknown) => Promise<unknown>) => {
        handlers[channel] = next
      }
    }
    registerSkillDataHandlers({ ipcMain } as Parameters<typeof registerSkillDataHandlers>[0])
  })

  it('rejects malformed version and job IDs before querying', async () => {
    await expect(
      handlers['skill-data:list'](null, { version: '../1.2.3', jobIds: ['112'] })
    ).rejects.toThrow('Invalid skill data request')
    await expect(
      handlers['skill-data:list'](null, { version: '1.2.419', jobIds: ['112', '../110'] })
    ).rejects.toThrow('Invalid skill data request')
    expect(findGameSkillsByJobIds).not.toHaveBeenCalled()
  })

  it('deduplicates IDs and returns serializable skill fields', async () => {
    findGameSkillsByJobIds.mockResolvedValue([
      {
        version: '1.2.419',
        jobId: '112',
        skillId: '1121000',
        skillName: '브랜디쉬',
        skillDesc: null,
        maxLevel: 20,
        invisible: false,
        hyper: null,
        reqSkill: null,
        reqSkillLevel: null,
        reqLevel: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])

    const result = await handlers['skill-data:list'](null, {
      version: '1.2.419',
      jobIds: ['112', '112']
    })

    expect(findGameSkillsByJobIds).toHaveBeenCalledWith({
      version: '1.2.419',
      jobIds: ['112']
    })
    expect(result).toMatchObject([{ skillId: '1121000', jobId: '112' }])
    expect(result).not.toHaveProperty('0.createdAt')
    expect(result).not.toHaveProperty('0.updatedAt')
  })

  it('loads only the requested version and skill levels', async () => {
    await expect(
      handlers['skill-levels:list'](null, { version: '../1.2.419', skillId: '1121000' })
    ).rejects.toThrow('Invalid skill level request')
    await expect(
      handlers['skill-levels:list'](null, { version: '1.2.419', skillId: '../1121000' })
    ).rejects.toThrow('Invalid skill level request')
    findGameSkillLevels.mockResolvedValue([
      { level: 1, levelDesc: '데미지 100%' },
      { level: 31, levelDesc: '데미지 200%' }
    ])

    const result = await handlers['skill-levels:list'](null, {
      version: '1.2.419',
      skillId: '1121000'
    })

    expect(findGameSkillLevels).toHaveBeenCalledWith({ version: '1.2.419', skillId: '1121000' })
    expect(result).toHaveLength(2)
  })
})
