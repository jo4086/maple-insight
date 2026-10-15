import { createHash } from 'node:crypto'

import type { DataRecord } from '../../shared/data-import'
import type {
  DataValidationResult,
  DataValidator,
  DataValidatorInput,
  ValidationFileInput,
  ValidationFileResult,
  ValidationIssue,
  ValidationIssueAcknowledgement,
  ValidationIssueDraft,
  ValidationSource
} from '../../shared/data-validation'

export class DomainValidatorRegistry {
  readonly #validators = new Map<string, DataValidator[]>()

  register(domain: string, validator: DataValidator): void {
    const validators = this.#validators.get(domain) ?? []
    if (validators.some((registered) => registered.key === validator.key)) {
      throw new Error(`Validator already registered for ${domain}: ${validator.key}`)
    }

    this.#validators.set(domain, [...validators, validator])
  }

  get(domain?: string): readonly DataValidator[] {
    return domain ? (this.#validators.get(domain) ?? []) : []
  }
}

export type RunDataValidationOptions = {
  files: readonly ValidationFileInput[]
  commonValidators?: readonly DataValidator[]
  domainValidators?: DomainValidatorRegistry
  acknowledgements?: Readonly<Record<string, ValidationIssueAcknowledgement>>
  signal?: AbortSignal
}

function createIssueId(
  source: ValidationSource,
  validator: string,
  input: Pick<DataValidatorInput, 'file' | 'domain'>,
  issue: ValidationIssueDraft,
  occurrence: number
): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        source,
        validator,
        domain: input.domain,
        file: input.file,
        occurrence,
        severity: issue.severity,
        code: issue.code,
        location: issue.location,
        value: issue.value
      })
    )
    .digest('hex')
}

function materializeIssues(
  validator: DataValidator,
  source: ValidationSource,
  input: DataValidatorInput,
  drafts: readonly ValidationIssueDraft[],
  acknowledgements: Readonly<Record<string, ValidationIssueAcknowledgement>>
): ValidationIssue[] {
  return drafts.map((draft, index) => {
    const id = createIssueId(source, validator.key, input, draft, index)
    const acknowledgement = acknowledgements[id]

    return {
      ...draft,
      id,
      validator: validator.key,
      source,
      ...(source === 'domain' && input.domain ? { domain: input.domain } : {}),
      location: { file: input.file, ...draft.location },
      ...(draft.severity === 'warning' && acknowledgement ? { acknowledgement } : {})
    }
  })
}

function isWarningResolved(issue: ValidationIssue): boolean {
  if (issue.severity !== 'warning') return true
  return Boolean(
    issue.acknowledgement?.acknowledged || issue.acknowledgement?.exceptionReason?.trim()
  )
}

async function cloneRecords(
  records: readonly DataRecord[],
  signal?: AbortSignal
): Promise<DataRecord[]> {
  const cloned: DataRecord[] = []
  for (let index = 0; index < records.length; index += 1024) {
    signal?.throwIfAborted()
    cloned.push(...structuredClone(records.slice(index, index + 1024)))
    await new Promise<void>((resolve) => setImmediate(resolve))
  }
  signal?.throwIfAborted()
  return cloned
}

async function runValidators(
  source: ValidationSource,
  validators: readonly DataValidator[],
  input: ValidationFileInput,
  acknowledgements: Readonly<Record<string, ValidationIssueAcknowledgement>>,
  signal?: AbortSignal
): Promise<ValidationFileResult> {
  if (validators.length === 0) {
    return {
      file: input.file,
      ...(input.domain ? { domain: input.domain } : {}),
      records: input.records,
      issues: []
    }
  }

  let records = await cloneRecords(input.records, signal)
  const issues: ValidationIssue[] = []

  for (const validator of validators) {
    signal?.throwIfAborted()
    const validatorInput = { ...input, records, signal }
    const output = await validator.validate(validatorInput)
    if (output.records && output.records !== records) {
      records = await cloneRecords(output.records, signal)
    }
    issues.push(
      ...materializeIssues(validator, source, validatorInput, output.issues, acknowledgements)
    )
  }

  return { file: input.file, ...(input.domain ? { domain: input.domain } : {}), records, issues }
}

export async function runDataValidation(
  options: RunDataValidationOptions
): Promise<DataValidationResult> {
  const acknowledgements = options.acknowledgements ?? {}
  const files: ValidationFileResult[] = []

  for (const input of options.files) {
    options.signal?.throwIfAborted()
    const commonResult = await runValidators(
      'common',
      options.commonValidators ?? [],
      input,
      acknowledgements,
      options.signal
    )
    const domainResult = await runValidators(
      'domain',
      options.domainValidators?.get(input.domain) ?? [],
      { ...input, records: commonResult.records },
      acknowledgements,
      options.signal
    )

    files.push({
      ...domainResult,
      issues: [...commonResult.issues, ...domainResult.issues]
    })
  }

  const issues = files.flatMap((file) => file.issues)
  const errors = issues.filter((issue) => issue.severity === 'error').length
  const warnings = issues.filter((issue) => issue.severity === 'warning')
  const unresolvedWarnings = warnings.filter((issue) => !isWarningResolved(issue)).length
  const publishable = errors === 0 && unresolvedWarnings === 0

  return {
    status: errors > 0 ? 'invalid' : unresolvedWarnings > 0 ? 'review' : 'ready',
    publishable,
    summary: {
      files: files.length,
      records: files.reduce((total, file) => total + file.records.length, 0),
      errors,
      warnings: warnings.length,
      unresolvedWarnings
    },
    files,
    issues
  }
}
