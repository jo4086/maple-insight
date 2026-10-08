import { parseGameDataReleaseDate, resolveGameDataVersion } from '@maple/db/game-data-version'
import { describe, expect, it } from 'vitest'

describe('game data version rules', () => {
  it.each([
    ['1.2.100', 'test'],
    ['1.2.206', 'test'],
    ['1.2.299', 'test'],
    ['1.2.300', 'production'],
    ['1.2.419', 'production'],
    ['1.2.499', 'production']
  ] as const)('classifies %s as %s', (version, environment) => {
    expect(resolveGameDataVersion(version).environment).toBe(environment)
  })

  it.each(['1.2.099', '1.2.500', '1.2', 'latest'])('rejects unsupported version %s', (version) => {
    expect(() => resolveGameDataVersion(version)).toThrow()
  })

  it('validates a real calendar date', () => {
    expect(parseGameDataReleaseDate('2026-10-08').toISOString()).toBe('2026-10-08T00:00:00.000Z')
    expect(() => parseGameDataReleaseDate('2026-02-30')).toThrow()
  })
})
