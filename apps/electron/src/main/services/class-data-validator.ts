import { classifyJobId } from '@maple/data-core'

import type { DataValidator, ValidationIssueDraft } from '../../shared/data-validation'

const classFields = new Set(['jobID', 'jobName'])
const validationChunkSize = 1024

function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve))
}

export const classDataValidator: DataValidator = {
  key: 'class.job-definition',
  async validate(input) {
    const issues: ValidationIssueDraft[] = []
    const seenJobIds = new Map<string, number>()
    const records: (typeof input.records)[number][] = []

    for (let index = 0; index < input.records.length; index += 1) {
      if (index > 0 && index % validationChunkSize === 0) await yieldToEventLoop()
      input.signal?.throwIfAborted()

      const record = input.records[index]
      const jobId = record.jobID
      const jobName = record.jobName

      if (typeof jobId !== 'string') {
        issues.push({
          severity: 'error',
          code: 'INVALID_JOB_ID',
          message: 'jobID는 앞자리 0을 보존한 숫자 문자열이어야 합니다.',
          location: { record: index, field: 'jobID' },
          value: { before: jobId }
        })
      } else {
        const classification = classifyJobId(jobId)

        if (classification.kind === 'invalid') {
          issues.push({
            severity: 'error',
            code: 'INVALID_JOB_ID',
            message: 'jobID는 5자리 이하의 숫자 문자열 또는 6자리 시스템 ID여야 합니다.',
            location: { record: index, field: 'jobID' },
            value: { before: jobId }
          })
        } else if (classification.kind === 'unknown') {
          issues.push({
            severity: 'warning',
            code: 'UNCLASSIFIED_JOB_ID',
            message: `jobID ${jobId}는 알려진 직업 분류에 속하지 않습니다.`,
            location: { record: index, field: 'jobID' },
            value: { before: jobId }
          })
        } else if (classification.kind === 'dummy') {
          issues.push({
            severity: 'warning',
            code: 'DUMMY_JOB_ID',
            message: `jobID ${jobId}는 사용하지 않는 더미 직업 코드입니다.`,
            location: { record: index, field: 'jobID' },
            value: { before: jobId }
          })
        } else if (classification.kind === 'skillGroup') {
          issues.push({
            severity: 'warning',
            code: 'SKILL_GROUP_JOB_ID',
            message: `jobID ${jobId}는 직업이 아닌 스킬 그룹 코드입니다.`,
            location: { record: index, field: 'jobID' },
            value: { before: jobId }
          })
        } else if (classification.kind === 'system') {
          issues.push({
            severity: 'warning',
            code: 'SYSTEM_JOB_ID',
            message: `jobID ${jobId}는 6자리 시스템 ID입니다.`,
            location: { record: index, field: 'jobID' },
            value: { before: jobId }
          })
        } else if (classification.ambiguous) {
          const classNames = classification.matches.map((match) => match.className).join(', ')
          issues.push({
            severity: 'warning',
            code: 'AMBIGUOUS_JOB_ID',
            message: `jobID ${jobId}는 여러 직업과 일치합니다: ${classNames}.`,
            location: { record: index, field: 'jobID' },
            value: { before: jobId }
          })
        }

        if (
          classification.kind === 'job' &&
          classification.stage === 6 &&
          classification.matches.some((match) => match.classKey === 'evan') &&
          jobName === ''
        ) {
          issues.push({
            severity: 'warning',
            code: 'EMPTY_EVAN_SIXTH_JOB_NAME',
            message: '에반 6차 직업의 빈 jobName을 원본 값으로 유지합니다.',
            location: { record: index, field: 'jobName' },
            value: { before: jobName }
          })
        }

        if (/^\d+$/.test(jobId)) {
          const firstRecord = seenJobIds.get(jobId)
          if (firstRecord !== undefined) {
            issues.push({
              severity: 'error',
              code: 'DUPLICATE_JOB_ID',
              message: `jobID ${jobId}가 레코드 ${firstRecord}와 중복됩니다.`,
              location: { record: index, field: 'jobID' },
              value: { before: jobId }
            })
          } else {
            seenJobIds.set(jobId, index)
          }
        }
      }

      if (typeof jobName !== 'string') {
        issues.push({
          severity: 'error',
          code: 'INVALID_JOB_NAME',
          message: 'jobName은 문자열이어야 합니다.',
          location: { record: index, field: 'jobName' },
          value: { before: jobName }
        })
      }

      for (const field of Object.keys(record)) {
        if (classFields.has(field)) continue
        issues.push({
          severity: 'warning',
          code: 'UNKNOWN_JOB_FIELD',
          message: `정의되지 않은 직업 필드 ${field}가 있습니다.`,
          location: { record: index, field },
          value: { before: record[field] }
        })
      }

      if (typeof jobName !== 'string' || jobName === jobName.trim()) {
        records.push(record)
        continue
      }

      const normalizedName = jobName.trim()
      issues.push({
        severity: 'warning',
        code: 'TRIMMED_JOB_NAME',
        message: 'jobName의 바깥쪽 공백을 제거했습니다.',
        location: { record: index, field: 'jobName' },
        value: { before: jobName, after: normalizedName }
      })
      records.push({ ...record, jobName: normalizedName })
    }

    input.signal?.throwIfAborted()
    return { records, issues }
  }
}
