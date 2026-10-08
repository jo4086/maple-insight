import { describe, expect, it } from 'vitest'

import { resolveVersionSelection } from './model'

describe('version selection', () => {
  it('selects a newly imported preferred version and keeps another version for comparison', () => {
    expect(
      resolveVersionSelection(
        ['1.2.419', '1.2.418'],
        {
          versions: ['1.2.418'],
          currentVersion: '1.2.418',
          compareVersion: '1.2.418'
        },
        '1.2.419'
      )
    ).toEqual({
      versions: ['1.2.419', '1.2.418'],
      currentVersion: '1.2.419',
      compareVersion: '1.2.418'
    })
  })

  it('preserves valid selections during a normal refresh', () => {
    const selection = {
      versions: ['1.2.419', '1.2.418'],
      currentVersion: '1.2.419',
      compareVersion: '1.2.418'
    }

    expect(resolveVersionSelection(selection.versions, selection)).toEqual(selection)
  })
})
