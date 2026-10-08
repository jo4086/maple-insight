import { describe, expect, it } from 'vitest'

import {
  formatLocalDate,
  getReleaseDateDayCount,
  parseReleaseDate,
  serializeReleaseDate
} from './release-date'

describe('release date', () => {
  it('formats a date using local calendar values', () => {
    expect(formatLocalDate(new Date(2026, 9, 8, 23, 30))).toBe('2026-10-08')
  })

  it('handles leap years and serializes selected parts', () => {
    expect(getReleaseDateDayCount('2024', '2')).toBe(29)
    expect(getReleaseDateDayCount('2025', '2')).toBe(28)
    expect(serializeReleaseDate(parseReleaseDate('2026-10-08'))).toBe('2026-10-08')
  })
})
