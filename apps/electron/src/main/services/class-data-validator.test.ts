import { describe, expect, it } from 'vitest'

import type { DataRecord } from '../../shared/data-import'

import { classDataValidator } from './class-data-validator'
import { DomainValidatorRegistry, runDataValidation } from './data-validation'

describe('class data validator', () => {
  it('preserves valid string job IDs including leading zeroes and six-digit IDs', async () => {
    const registry = new DomainValidatorRegistry()
    const records = [
      { jobID: '01234', jobName: '모험의 기술' },
      { jobID: '800000', jobName: '시스템 직업' },
      { jobID: '800001', jobName: '신규 직업' }
    ]
    registry.register('class', classDataValidator)

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
      domainValidators: registry
    })

    expect(result.status).toBe('ready')
    expect(result.files[0].records).toEqual([
      { jobID: '01234', jobName: '모험의 기술' },
      { jobID: '800000', jobName: '시스템 직업' },
      { jobID: '800001', jobName: '신규 직업' }
    ])
    expect(records).toEqual([
      { jobID: '01234', jobName: '모험의 기술' },
      { jobID: '800000', jobName: '시스템 직업' },
      { jobID: '800001', jobName: '신규 직업' }
    ])
  })

  it('reports invalid IDs, duplicates and unknown fields with field locations', async () => {
    const registry = new DomainValidatorRegistry()
    const records: DataRecord[] = [
      { jobID: '000', jobName: ' 모험의 기술 ', extra: true },
      { jobID: '000', jobName: '' },
      { jobID: 100, jobName: null }
    ]
    registry.register('class', classDataValidator)

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
      domainValidators: registry
    })

    expect(result.issues.map((issue) => issue.code)).toEqual([
      'UNKNOWN_JOB_FIELD',
      'TRIMMED_JOB_NAME',
      'DUPLICATE_JOB_ID',
      'INVALID_JOB_ID',
      'INVALID_JOB_NAME'
    ])
    expect(result.issues[2].location).toEqual({
      file: 'json/ms_job.json',
      record: 1,
      field: 'jobID'
    })
    expect(records[0].jobName).toBe(' 모험의 기술 ')
  })

  it('stops class validation after yielding to cancellation', async () => {
    const controller = new AbortController()
    const records = Array.from({ length: 3_000 }, (_, index) => ({
      jobID: `${index}`.padStart(3, '0'),
      jobName: `직업 ${index}`
    }))
    const abort = new Promise<void>((resolve) => {
      setImmediate(() => {
        controller.abort()
        resolve()
      })
    })
    const validation = classDataValidator.validate({
      version: '1.2.419',
      environment: 'production',
      file: 'json/ms_job.json',
      domain: 'class',
      records,
      signal: controller.signal
    })

    await abort
    await expect(validation).rejects.toMatchObject({ name: 'AbortError' })
  })
})
