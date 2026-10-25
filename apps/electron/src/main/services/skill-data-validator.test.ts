import { describe, expect, it } from 'vitest'

import type { DataRecord } from '../../shared/data-import'

import { DomainValidatorRegistry, runDataValidation } from './data-validation'
import { resolveSkillDataValidator, skillDataValidatorsByFileName } from './skill-data-validator'

async function validate(
  file: keyof typeof skillDataValidatorsByFileName,
  records: DataRecord[],
  signal?: AbortSignal
) {
  const registry = new DomainValidatorRegistry()
  registry.register('skill', skillDataValidatorsByFileName[file])

  return runDataValidation({
    files: [
      {
        version: '1.2.424',
        environment: 'production',
        file: `json/${file}`,
        domain: 'skill',
        records
      }
    ],
    domainValidators: registry,
    signal
  })
}

describe('skill data validators', () => {
  it('preserves zero-padded skill identifiers in skill data', async () => {
    const result = await validate('ms_skill.json', [
      {
        jobID: '000',
        skillID: '0001000',
        skillName: '달팽이 세마리',
        skillDesc: '',
        maxLevel: '3',
        invisible: 'False',
        hyper: '0',
        reqSkill: '',
        reqSkillLevel: '0',
        reqLevel: '0'
      }
    ])

    expect(result.status).toBe('ready')
    expect(result.files[0].records[0]).toMatchObject({ skillID: '0001000' })
  })

  it('reports duplicate composite keys and invalid identifiers', async () => {
    const result = await validate('ms_skillLevel.json', [
      { skillID: '0001000', level: '01', levelDesc: '' },
      { skillID: '0001000', level: '01', levelDesc: '중복' },
      { skillID: 1000 as unknown as string, level: '2', levelDesc: '' }
    ])

    expect(result.issues.map((issue) => issue.code)).toEqual([
      'DUPLICATE_SKILL_KEY',
      'INVALID_SKILL_FIELD',
      'INVALID_SKILL_ID'
    ])
    expect(result.issues[0].location).toEqual({
      file: 'json/ms_skillLevel.json',
      record: 1,
      field: 'level'
    })
  })

  it('validates PVP common data during Phase 2', async () => {
    const result = await validate('ms_skillPVPCommon.json', [
      { skillID: '0001075', commonName: 'mpCon', commonValue: '15+10*d(x/4)' },
      { skillID: '0001075', commonName: 'mpCon', commonValue: '20' }
    ])

    expect(result.status).toBe('invalid')
    expect(result.issues.map((issue) => issue.code)).toEqual(['DUPLICATE_SKILL_KEY'])
  })

  it.each(['ms_skillCommon.json', 'ms_skillPVPCommon.json'] as const)(
    'allows empty common values but preserves and reports invalid common values for %s',
    async (file) => {
      const records: DataRecord[] = [
        { skillID: '0001075', commonName: 'mpCon', commonValue: '' },
        { skillID: '0001076', commonName: 'hpCon', commonValue: 15 },
        { skillID: '0001077', commonName: 'x' }
      ]

      const result = await validate(file, records)

      expect(result.status).toBe('invalid')
      expect(result.issues.map((issue) => issue.code)).toEqual([
        'INVALID_SKILL_FIELD',
        'INVALID_SKILL_FIELD'
      ])
      expect(result.files[0].records).toEqual(records)
      expect(records).toEqual([
        { skillID: '0001075', commonName: 'mpCon', commonValue: '' },
        { skillID: '0001076', commonName: 'hpCon', commonValue: 15 },
        { skillID: '0001077', commonName: 'x' }
      ])
    }
  )

  it('stops a large file after yielding to cancellation', async () => {
    const controller = new AbortController()
    const records = Array.from({ length: 3_000 }, (_, index) => ({
      skillID: `${index}`.padStart(7, '0'),
      level: '1',
      levelDesc: ''
    }))
    const abort = new Promise<void>((resolve) => {
      setImmediate(() => {
        controller.abort()
        resolve()
      })
    })

    const validation = validate('ms_skillLevel.json', records, controller.signal)

    await abort
    await expect(validation).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('resolves validators only for exact supported basenames', () => {
    expect(resolveSkillDataValidator('json/ms_skillCommon.json')).toBe(
      skillDataValidatorsByFileName['ms_skillCommon.json']
    )
    expect(resolveSkillDataValidator('json/ms_skillExtra.json')).toBeUndefined()
  })
})
