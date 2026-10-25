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

  it('restores a saved current version without selecting a comparison version', () => {
    expect(
      resolveVersionSelection(
        ['1.2.419', '1.2.418'],
        { versions: [], currentVersion: '', compareVersion: '' },
        undefined,
        '1.2.418'
      )
    ).toEqual({
      versions: ['1.2.419', '1.2.418'],
      currentVersion: '1.2.418',
      compareVersion: ''
    })
  })

  it('falls back when a saved version is no longer registered', () => {
    expect(
      resolveVersionSelection(
        ['1.2.419', '1.2.418'],
        { versions: [], currentVersion: '', compareVersion: '' },
        undefined,
        '1.2.417'
      )
    ).toEqual({
      versions: ['1.2.419', '1.2.418'],
      currentVersion: '1.2.419',
      compareVersion: ''
    })
  })

  it.each(['1.2.419', '1.2.417'])('clears an invalid comparison version %s', (compareVersion) => {
    expect(
      resolveVersionSelection(['1.2.419', '1.2.418'], {
        versions: ['1.2.419', '1.2.418'],
        currentVersion: '1.2.419',
        compareVersion
      })
    ).toEqual({
      versions: ['1.2.419', '1.2.418'],
      currentVersion: '1.2.419',
      compareVersion: ''
    })
  })

  it('keeps an explicit changed selection on a later refresh', () => {
    const afterExplicitChange = {
      versions: ['1.2.419', '1.2.418'],
      currentVersion: '1.2.418',
      compareVersion: '1.2.419'
    }

    expect(
      resolveVersionSelection(
        afterExplicitChange.versions,
        afterExplicitChange,
        undefined,
        '1.2.419'
      )
    ).toEqual(afterExplicitChange)
  })
})
