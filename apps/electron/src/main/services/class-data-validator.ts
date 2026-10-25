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

      if (typeof jobId !== 'string' || !/^\d+$/.test(jobId)) {
        issues.push({
          severity: 'error',
          code: 'INVALID_JOB_ID',
          message: 'jobID는 앞자리 0을 보존한 숫자 문자열이어야 합니다.',
          location: { record: index, field: 'jobID' },
          value: { before: jobId }
        })
      } else {
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
