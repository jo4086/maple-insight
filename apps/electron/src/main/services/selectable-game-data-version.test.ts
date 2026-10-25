import { describe, expect, it } from 'vitest'

import { isSelectableGameDataVersionStatus } from './selectable-game-data-version'

describe('selectable game data versions', () => {
  it.each(['importing', 'ready'] as const)('includes %s versions', (status) => {
    expect(isSelectableGameDataVersionStatus(status)).toBe(true)
  })

  it.each(['failed', 'copying', 'deleted'] as const)('excludes %s versions', (status) => {
    expect(isSelectableGameDataVersionStatus(status)).toBe(false)
  })
})
