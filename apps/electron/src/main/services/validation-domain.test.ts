import { describe, expect, it } from 'vitest'

import { resolveSkillValidationFileName, resolveValidationDataDomain } from './validation-domain'

describe('validation data domain resolver', () => {
  it.each([
    ['json/ms_job.json', 'class'],
    ['json/ms_skillLevel.json', 'skill'],
    ['json/equipment.json', 'equipment'],
    ['json/boss_monster.json', 'monster'],
    ['json/version.json', 'unknown']
  ] as const)('resolves %s as %s', (file, expected) => {
    expect(resolveValidationDataDomain(file)).toBe(expected)
  })

  it.each([
    'ms_skill.json',
    'ms_skillH.json',
    'ms_skillCommon.json',
    'ms_skillLevel.json',
    'ms_skillPVPCommon.json'
  ] as const)('identifies %s as a supported skill file', (fileName) => {
    expect(resolveSkillValidationFileName(`json/${fileName}`)).toBe(fileName)
  })

  it('does not identify other skill files as a supported skill schema', () => {
    expect(resolveSkillValidationFileName('json/ms_skillExtra.json')).toBeUndefined()
  })
})
