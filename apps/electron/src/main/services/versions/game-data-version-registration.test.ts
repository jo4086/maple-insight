import { beforeEach, describe, expect, it, vi } from 'vitest'

const repository = vi.hoisted(() => ({
  startGameDataVersionImport: vi.fn(),
  failGameDataVersionImport: vi.fn()
}))

vi.mock('@maple/db/admin/game-data-version', () => repository)

import {
  markGameDataVersionImportFailed,
  registerGameDataVersionImport
} from './game-data-version-registration'

describe('game data version registration boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers a converted version as an import with its release date', async () => {
    await registerGameDataVersionImport({ version: '1.2.419', releasedOn: '2026-10-08' })

    expect(repository.startGameDataVersionImport).toHaveBeenCalledWith('1.2.419', {
      releasedOn: '2026-10-08'
    })
  })

  it('omits the release date when it was not supplied', async () => {
    await registerGameDataVersionImport({ version: '1.2.419', releasedOn: null })

    expect(repository.startGameDataVersionImport).toHaveBeenCalledWith('1.2.419', {})
  })

  it('marks an import as failed when the workspace cannot be committed', async () => {
    await markGameDataVersionImportFailed('1.2.419')

    expect(repository.failGameDataVersionImport).toHaveBeenCalledWith('1.2.419')
  })
})
