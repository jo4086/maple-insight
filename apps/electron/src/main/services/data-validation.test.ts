import { describe, expect, it } from 'vitest'

import type { DataValidator } from '../../shared/data-validation'

import { DomainValidatorRegistry, runDataValidation } from './data-validation'

const trimNames: DataValidator = {
  key: 'common.trim-name',
  validate(input) {
    return {
      records: input.records.map((record) => ({
        ...record,
        name: typeof record.name === 'string' ? record.name.trim() : record.name
      })),
      issues: input.records.flatMap((record, index) =>
        typeof record.name === 'string' && record.name !== record.name.trim()
          ? [
              {
                severity: 'warning' as const,
                code: 'TRIMMED_NAME',
                message: '이름의 바깥쪽 공백을 제거했습니다.',
                location: { record: index, field: 'name' },
                value: { before: record.name, after: record.name.trim() }
              }
            ]
          : []
      )
    }
  }
}

const requireJobId: DataValidator = {
  key: 'class.require-job-id',
  validate(input) {
    return {
      issues: input.records.flatMap((record, index) =>
        typeof record.jobID === 'string' && record.jobID.length > 0
          ? []
          : [
              {
                severity: 'error' as const,
                code: 'JOB_ID_REQUIRED',
                message: '직업 코드가 필요합니다.',
                location: { record: index, field: 'jobID' }
              }
            ]
      )
    }
  }
}

describe('data validation', () => {
  it('runs common normalization before registered domain validators', async () => {
    const registry = new DomainValidatorRegistry()
    registry.register('class', requireJobId)

    const result = await runDataValidation({
      commonValidators: [trimNames],
      domainValidators: registry,
      files: [
        {
          version: '1.2.419',
          environment: 'production',
          file: 'json/ms_job.json',
          domain: 'class',
          records: [{ jobID: '', name: ' 초보자 ' }]
        }
      ]
    })

    expect(result.status).toBe('invalid')
    expect(result.publishable).toBe(false)
    expect(result.summary).toEqual({
      files: 1,
      records: 1,
      errors: 1,
      warnings: 1,
      unresolvedWarnings: 1
    })
    expect(result.files[0].records).toEqual([{ jobID: '', name: '초보자' }])
    expect(result.issues).toEqual([
      expect.objectContaining({ source: 'common', code: 'TRIMMED_NAME' }),
      expect.objectContaining({ source: 'domain', domain: 'class', code: 'JOB_ID_REQUIRED' })
    ])
  })

  it('isolates input records from normalizing validators', async () => {
    const records = [{ jobID: '000', name: 'original' }]
    const mutatingNormalizer: DataValidator = {
      key: 'common.mutating-normalizer',
      validate(input) {
        ;(input.records[0] as { name: string }).name = 'normalized'
        return { records: input.records, issues: [] }
      }
    }

    const result = await runDataValidation({
      files: [
        {
          version: '1.2.419',
          environment: 'production',
          file: 'json/ms_job.json',
          domain: 'class',
          records
        }
      ],
      commonValidators: [mutatingNormalizer]
    })

    expect(records).toEqual([{ jobID: '000', name: 'original' }])
    expect(result.files[0].records).toEqual([{ jobID: '000', name: 'normalized' }])
  })

  it('allows publishing after every warning is acknowledged', async () => {
    const files = [
      {
        version: '1.2.419',
        environment: 'production' as const,
        file: 'json/ms_job.json',
        records: [{ jobID: '000', name: ' 초보자 ' }]
      }
    ]
    const pending = await runDataValidation({ files, commonValidators: [trimNames] })
    const warningId = pending.issues[0].id
    const acknowledged = await runDataValidation({
      files,
      commonValidators: [trimNames],
      acknowledgements: { [warningId]: { acknowledged: true } }
    })

    expect(pending.status).toBe('review')
    expect(pending.publishable).toBe(false)
    expect(acknowledged.status).toBe('ready')
    expect(acknowledged.publishable).toBe(true)
    expect(acknowledged.summary.unresolvedWarnings).toBe(0)
  })

  it('rejects duplicate validator keys within a domain', () => {
    const registry = new DomainValidatorRegistry()
    registry.register('class', requireJobId)

    expect(() => registry.register('class', requireJobId)).toThrow('Validator already registered')
  })

  it('stops between validators when validation is cancelled', async () => {
    const controller = new AbortController()
    controller.abort()

    await expect(
      runDataValidation({
        files: [
          {
            version: '1.2.419',
            environment: 'production',
            file: 'json/ms_job.json',
            records: []
          }
        ],
        commonValidators: [trimNames],
        signal: controller.signal
      })
    ).rejects.toMatchObject({ name: 'AbortError' })
  })
})
