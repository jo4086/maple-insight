import type { DataRecord } from '../../shared/data-import'
import type {
  DataValidator,
  DataValidatorInput,
  ValidationIssueDraft
} from '../../shared/data-validation'

import { resolveSkillValidationFileName, type SkillValidationFileName } from './validation-domain'

type SkillFileSchema = {
  requiredStringFields: readonly string[]
  optionalStringFields: readonly string[]
  numericStringFields: readonly string[]
  keyFields: readonly string[]
}

const schemas: Record<SkillValidationFileName, SkillFileSchema> = {
  'ms_skill.json': {
    requiredStringFields: [
      'jobID',
      'skillID',
      'skillName',
      'skillDesc',
      'maxLevel',
      'invisible',
      'hyper',
      'reqSkill',
      'reqSkillLevel',
      'reqLevel'
    ],
    optionalStringFields: ['skillName', 'skillDesc', 'reqSkill'],
    numericStringFields: ['jobID', 'skillID', 'maxLevel', 'hyper', 'reqSkillLevel', 'reqLevel'],
    keyFields: ['skillID']
  },
  'ms_skillH.json': {
    requiredStringFields: ['skillID', 'desc', 'pdesc', 'h', 'ph', 'hch'],
    optionalStringFields: ['desc', 'pdesc', 'h', 'ph', 'hch'],
    numericStringFields: ['skillID'],
    keyFields: ['skillID']
  },
  'ms_skillCommon.json': {
    requiredStringFields: ['skillID', 'commonName', 'commonValue'],
    optionalStringFields: ['commonValue'],
    numericStringFields: ['skillID'],
    keyFields: ['skillID', 'commonName']
  },
  'ms_skillLevel.json': {
    requiredStringFields: ['skillID', 'level', 'levelDesc'],
    optionalStringFields: ['levelDesc'],
    numericStringFields: ['skillID', 'level'],
    keyFields: ['skillID', 'level']
  },
  'ms_skillPVPCommon.json': {
    requiredStringFields: ['skillID', 'commonName', 'commonValue'],
    optionalStringFields: ['commonValue'],
    numericStringFields: ['skillID'],
    keyFields: ['skillID', 'commonName']
  }
}

function issue(
  issues: ValidationIssueDraft[],
  record: number,
  field: string,
  code: string,
  message: string,
  value: DataRecord[string]
): void {
  issues.push({
    severity: 'error',
    code,
    message,
    location: { record, field },
    value: { before: value }
  })
}

function validateRecord(
  record: DataRecord,
  index: number,
  schema: SkillFileSchema,
  issues: ValidationIssueDraft[]
): string | undefined {
  for (const field of schema.requiredStringFields) {
    const value = record[field]
    if (typeof value !== 'string') {
      issue(issues, index, field, 'INVALID_SKILL_FIELD', `${field}은 문자열이어야 합니다.`, value)
      continue
    }

    if (!schema.optionalStringFields.includes(field) && value === '') {
      issue(issues, index, field, 'MISSING_SKILL_FIELD', `${field}은 비어 있을 수 없습니다.`, value)
    }
  }

  for (const field of schema.numericStringFields) {
    const value = record[field]
    if (typeof value !== 'string' || !/^\d+$/.test(value)) {
      issue(
        issues,
        index,
        field,
        field === 'skillID' ? 'INVALID_SKILL_ID' : 'INVALID_SKILL_NUMBER',
        `${field}은 앞자리 0을 보존한 숫자 문자열이어야 합니다.`,
        value
      )
    }
  }

  const keyValues = schema.keyFields.map((field) => record[field])
  return keyValues.every((value) => typeof value === 'string' && value !== '')
    ? keyValues.join('\u0000')
    : undefined
}

const validationChunkSize = 1024

function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve))
}

function createSkillDataValidator(fileName: SkillValidationFileName): DataValidator {
  const schema = schemas[fileName]

  return {
    key: `skill.${fileName}`,
    async validate(input: DataValidatorInput) {
      if (resolveSkillValidationFileName(input.file) !== fileName)
        return { records: input.records, issues: [] }

      const issues: ValidationIssueDraft[] = []
      const firstRecords = new Map<string, number>()

      for (let index = 0; index < input.records.length; index += 1) {
        if (index > 0 && index % validationChunkSize === 0) {
          await yieldToEventLoop()
        }
        input.signal?.throwIfAborted()

        const record = input.records[index]
        const key = validateRecord(record, index, schema, issues)
        if (!key) continue

        const firstRecord = firstRecords.get(key)
        if (firstRecord === undefined) {
          firstRecords.set(key, index)
          continue
        }

        const keyField = schema.keyFields[schema.keyFields.length - 1]
        issue(
          issues,
          index,
          keyField,
          'DUPLICATE_SKILL_KEY',
          `${schema.keyFields.join('+')} ${key.split('\u0000').join('+')}가 레코드 ${firstRecord}와 중복됩니다.`,
          record[keyField]
        )
      }

      return { records: input.records, issues }
    }
  }
}

export const skillDataValidatorsByFileName: Readonly<
  Record<SkillValidationFileName, DataValidator>
> = Object.fromEntries(
  Object.keys(schemas).map((fileName) => [
    fileName,
    createSkillDataValidator(fileName as SkillValidationFileName)
  ])
) as Record<SkillValidationFileName, DataValidator>

export function resolveSkillDataValidator(filePath: string): DataValidator | undefined {
  const fileName = resolveSkillValidationFileName(filePath)
  return fileName ? skillDataValidatorsByFileName[fileName] : undefined
}
