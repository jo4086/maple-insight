import { expect, it } from 'vitest'

import { highlightChangedTokens } from './skill-level-text'

it('highlights only the level-dependent value', () => {
  const result = highlightChangedTokens(
    'MP 70 소비, 모든 능력치 16% 증가',
    'MP 70 소비, 모든 능력치 15% 증가'
  )

  expect(result.filter(({ changed }) => changed).map(({ text }) => text)).toEqual(['16%'])
  expect(result.map(({ text }) => text).join('')).toBe('MP 70 소비, 모든 능력치 16% 증가')
})
