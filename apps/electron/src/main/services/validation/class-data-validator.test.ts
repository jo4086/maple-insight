import { describe, expect, it } from 'vitest'

import type { DataRecord } from '../../../shared/data-import'

import { classDataValidator } from './class-data-validator'
import { DomainValidatorRegistry, runDataValidation } from './data-validation'

describe('class data validator', () => {
  it('preserves unclassified and system IDs while reporting their classifications', async () => {
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

    expect(result.status).toBe('review')
    expect(result.issues.map((issue) => [issue.code, issue.severity])).toEqual([
      ['UNCLASSIFIED_JOB_ID', 'warning'],
      ['SYSTEM_JOB_ID', 'warning'],
      ['SYSTEM_JOB_ID', 'warning']
    ])
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

  it('classifies known jobs, retired codes, skill groups, system IDs and ambiguous IDs', async () => {
    const registry = new DomainValidatorRegistry()
    const records = [
      { jobID: '2200', jobName: '에반' },
      { jobID: '2211', jobName: '에반 2차' },
      { jobID: '2214', jobName: '에반 3차' },
      { jobID: '2217', jobName: '에반 4차' },
      { jobID: '2220', jobName: '' },
      { jobID: '2210', jobName: '은퇴한 에반' },
      { jobID: '7000', jobName: '더미 직업' },
      { jobID: '40000', jobName: '5차 스킬 그룹' },
      { jobID: '50007', jobName: '헥사스탯 그룹' },
      { jobID: '800000', jobName: '시스템 직업' },
      { jobID: '30000', jobName: '미분류 직업' },
      { jobID: '3001', jobName: '데몬 공통 초보자' }
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

    expect(result.issues.map((issue) => [issue.code, issue.severity])).toEqual([
      ['EMPTY_EVAN_SIXTH_JOB_NAME', 'warning'],
      ['DUMMY_JOB_ID', 'warning'],
      ['DUMMY_JOB_ID', 'warning'],
      ['SKILL_GROUP_JOB_ID', 'warning'],
      ['SKILL_GROUP_JOB_ID', 'warning'],
      ['SYSTEM_JOB_ID', 'warning'],
      ['UNCLASSIFIED_JOB_ID', 'warning'],
      ['AMBIGUOUS_JOB_ID', 'warning']
    ])
    expect(result.issues).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'INVALID_JOB_NAME' })])
    )
    expect(result.issues[0].location).toEqual({
      file: 'json/ms_job.json',
      record: 4,
      field: 'jobName'
    })
    expect(result.files[0].records).toEqual(records)
    expect(records[4]).toEqual({ jobID: '2220', jobName: '' })
  })

  it('reports invalid IDs, duplicates and unknown fields with field locations', async () => {
    const registry = new DomainValidatorRegistry()
    const records: DataRecord[] = [
      { jobID: '2200', jobName: ' 모험의 기술 ', extra: true },
      { jobID: '2200', jobName: '' },
      { jobID: '1234567', jobName: '범위 밖 직업' },
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
      'INVALID_JOB_ID',
      'INVALID_JOB_NAME'
    ])
    expect(result.issues[2].location).toEqual({
      file: 'json/ms_job.json',
      record: 1,
      field: 'jobID'
    })
    expect(result.files[0].records[0].jobName).toBe('모험의 기술')
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
