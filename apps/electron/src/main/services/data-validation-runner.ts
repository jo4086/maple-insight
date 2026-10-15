import { createReadStream } from 'node:fs'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { pipeline } from 'node:stream/promises'

import { streamArray } from 'stream-json/streamers/stream-array.js'

import type { DataRecord } from '../../shared/data-import'
import type {
  DataValidationProgress,
  DataValidationReportUpdate,
  DataValidationSummary,
  ValidationIssue,
  ValidationIssueAcknowledgement,
  ValidationReportFile,
  ValidationSummary,
  ValidationWorkspaceManifest
} from '../../shared/data-validation'

import { classDataValidator } from './class-data-validator'
import { DomainValidatorRegistry, runDataValidation } from './data-validation'
import { resolveSkillDataValidator } from './skill-data-validator'
import { resolveValidationDataDomain } from './validation-domain'
import {
  createValidationWorkspace,
  type ValidationWorkspaceConflictPolicy
} from './validation-workspace'

export type ValidateDataVersionOptions = {
  dataRoot: string
  sessionId: string
  version: string
  environment: 'test' | 'production'
  conflictPolicy?: ValidationWorkspaceConflictPolicy
  signal?: AbortSignal
  onProgress?: (progress: DataValidationProgress) => void
}

type StoredValidationReport = Omit<DataValidationSummary, 'sessionId' | 'workspacePath'>

type ValidationRunHistoryEntry = {
  id: string
  inputHash: string | null
  startedAt: string
  endedAt: string
  status: 'success' | 'failed' | 'cancelled'
  processed: { files: number; records: number }
  issues: { errors: number; warnings: number; unresolvedWarnings: number }
}

const historyWrites = new Map<string, Promise<void>>()

type ValidationUpdateMarker = {
  operation: 'validation-report-manifest-update'
  startedAt: string
}

class ValidationStateInconsistentError extends Error {}

export type UpdateValidationWarningAcknowledgementOptions = {
  dataRoot: string
  version: string
  environment: 'test' | 'production'
  issueId: string
  acknowledged: boolean
  exceptionReason?: string
}

function isDataRecord(value: unknown): value is DataRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

async function readDataRecords(path: string, signal?: AbortSignal): Promise<DataRecord[]> {
  const source = createReadStream(path)
  const parser = streamArray.withParserAsStream()
  const abort = (): void => {
    const error = new DOMException('The operation was aborted.', 'AbortError')
    source.destroy(error)
    parser.destroy(error)
  }
  signal?.addEventListener('abort', abort, { once: true })

  try {
    signal?.throwIfAborted()
    let pipelineError: unknown
    const completion = pipeline(source, parser).catch((error: unknown) => {
      pipelineError = error
    })
    const records: DataRecord[] = []
    let iterationError: unknown
    let recordCount = 0
    try {
      for await (const item of parser as AsyncIterable<{ key: number; value: unknown }>) {
        signal?.throwIfAborted()
        if (!isDataRecord(item.value)) {
          throw new Error(`작업본 JSON은 객체 배열이어야 합니다: ${path}`)
        }
        records.push(item.value)
        recordCount += 1
        if (recordCount % 1024 === 0) {
          await new Promise<void>((resolve) => setImmediate(resolve))
          signal?.throwIfAborted()
        }
      }
    } catch (error) {
      iterationError = error
      source.destroy(error as Error)
      parser.destroy(error as Error)
    }
    await completion
    signal?.throwIfAborted()
    if (iterationError) throw iterationError
    if (pipelineError) throw pipelineError
    return records
  } finally {
    signal?.removeEventListener('abort', abort)
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function emptyIssueSummary(): ValidationRunHistoryEntry['issues'] {
  return { errors: 0, warnings: 0, unresolvedWarnings: 0 }
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T
}

async function assertConsistentValidationState(
  reportPath: string,
  manifestPath: string,
  expected: Pick<ValidateDataVersionOptions, 'version' | 'environment'>
): Promise<StoredValidationReport | undefined> {
  try {
    await readFile(`${manifestPath}.validation-update`, 'utf8')
    throw new ValidationStateInconsistentError(
      '검증 저장이 중단되었습니다. 검증을 다시 실행하세요.'
    )
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }

  let report: StoredValidationReport
  try {
    report = await readJson<StoredValidationReport>(reportPath)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      try {
        const manifest = await readJson<ValidationWorkspaceManifest>(manifestPath)
        if (manifest.status !== 'pending') {
          throw new ValidationStateInconsistentError(
            '검증 보고서와 작업본 manifest 상태가 일치하지 않습니다. 검증을 다시 실행하세요.'
          )
        }
      } catch (manifestError) {
        if ((manifestError as NodeJS.ErrnoException).code !== 'ENOENT') throw manifestError
      }
      return undefined
    }
    throw error
  }
  const manifest = await readJson<ValidationWorkspaceManifest>(manifestPath)
  if (
    report.version !== expected.version ||
    report.environment !== expected.environment ||
    manifest.version !== expected.version ||
    manifest.environment !== expected.environment ||
    report.status !== manifest.status
  ) {
    throw new ValidationStateInconsistentError(
      '검증 보고서와 작업본 manifest 상태가 일치하지 않습니다. 검증을 다시 실행하세요.'
    )
  }
  return report
}

function validationRunHistoryPath(
  options: Pick<ValidateDataVersionOptions, 'dataRoot' | 'environment' | 'version'>
): string {
  return join(
    options.dataRoot,
    '.workspaces',
    options.environment,
    `${options.version}.validation-runs.json`
  )
}

async function readRunHistory(path: string): Promise<ValidationRunHistoryEntry[]> {
  try {
    const history = await readJson<unknown>(path)
    if (!Array.isArray(history)) throw new Error('검증 실행 이력 형식이 올바르지 않습니다.')
    return history as ValidationRunHistoryEntry[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

async function appendRunHistory(path: string, entry: ValidationRunHistoryEntry): Promise<void> {
  const previous = historyWrites.get(path) ?? Promise.resolve()
  const next = previous
    .catch(() => undefined)
    .then(async () => {
      await mkdir(dirname(path), { recursive: true })
      const entries = await readRunHistory(path)
      if (entries.some((existing) => existing.id === entry.id)) return
      await writeJsonAtomically(path, [...entries, entry])
    })
  historyWrites.set(path, next)
  try {
    await next
  } finally {
    if (historyWrites.get(path) === next) historyWrites.delete(path)
  }
}

async function prepareValidationWorkspace(options: ValidateDataVersionOptions): Promise<{
  workspace: Awaited<ReturnType<typeof createValidationWorkspace>>
  previousReport: StoredValidationReport | undefined
}> {
  let workspace = await createValidationWorkspace({
    dataRoot: options.dataRoot,
    sessionId: options.sessionId,
    version: options.version,
    environment: options.environment,
    conflictPolicy: options.conflictPolicy ?? 'reuse',
    signal: options.signal
  })
  const reportPath = join(workspace.directory, 'validation.json')
  try {
    return {
      workspace,
      previousReport: await assertConsistentValidationState(
        reportPath,
        workspace.manifestPath,
        options
      )
    }
  } catch (error) {
    if (
      !(error instanceof ValidationStateInconsistentError) ||
      options.conflictPolicy === 'error'
    ) {
      throw error
    }
    workspace = await createValidationWorkspace({
      dataRoot: options.dataRoot,
      sessionId: options.sessionId,
      version: options.version,
      environment: options.environment,
      conflictPolicy: 'replace',
      signal: options.signal
    })
    return { workspace, previousReport: undefined }
  }
}

async function migrateLegacyRunHistory(
  options: Pick<ValidateDataVersionOptions, 'dataRoot' | 'environment' | 'version'>,
  destinationPath: string
): Promise<void> {
  const legacyPath = join(
    options.dataRoot,
    '.workspaces',
    options.environment,
    options.version,
    'validation-runs.json'
  )
  for (const entry of await readRunHistory(legacyPath)) {
    await appendRunHistory(destinationPath, entry)
  }
}

async function readAcknowledgements(
  path: string
): Promise<Record<string, ValidationIssueAcknowledgement>> {
  try {
    const report = JSON.parse(await readFile(path, 'utf8')) as StoredValidationReport
    return Object.fromEntries(
      report.issues.flatMap((issue) =>
        issue.acknowledgement ? [[issue.id, issue.acknowledgement]] : []
      )
    )
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {}
    throw error
  }
}

function attachFailure(error: unknown, name: string, failure: unknown): void {
  if (error && typeof error === 'object') {
    Object.defineProperty(error, name, { value: failure, configurable: true })
  }
}

async function writeJsonAtomically(path: string, value: unknown): Promise<void> {
  const temporaryPath = `${path}.tmp`

  try {
    await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
    await rename(temporaryPath, path)
  } catch (error) {
    try {
      await rm(temporaryPath, { force: true })
    } catch (cleanupFailure) {
      attachFailure(error, 'temporaryFileCleanupError', cleanupFailure)
    }
    throw error
  }
}

async function writeConsistentValidationState(
  reportPath: string,
  manifestPath: string,
  previousReport: StoredValidationReport | undefined,
  previousManifest: ValidationWorkspaceManifest,
  nextReport: StoredValidationReport,
  nextManifest: ValidationWorkspaceManifest
): Promise<void> {
  const markerPath = `${manifestPath}.validation-update`
  await writeJsonAtomically(markerPath, {
    operation: 'validation-report-manifest-update',
    startedAt: new Date().toISOString()
  } satisfies ValidationUpdateMarker)
  let manifestWritten = false
  let preserveMarker = false
  try {
    await writeJsonAtomically(reportPath, nextReport)
    await writeJsonAtomically(manifestPath, nextManifest)
    manifestWritten = true
  } catch (error) {
    try {
      if (previousReport) await writeJsonAtomically(reportPath, previousReport)
      else await rm(reportPath, { force: true })
      if (manifestWritten) await writeJsonAtomically(manifestPath, previousManifest)
    } catch (rollbackFailure) {
      preserveMarker = true
      attachFailure(error, 'rollbackFailure', rollbackFailure)
    }
    throw error
  } finally {
    if (!preserveMarker) await rm(markerPath, { force: true })
  }
}

function createUnsupportedDomainIssue(
  file: string,
  domain: ValidationReportFile['domain']
): ValidationIssue {
  return {
    id: `unsupported-domain:${domain}:${file}`,
    validator: 'domain.unsupported',
    source: 'domain',
    domain,
    severity: 'error',
    code: 'UNSUPPORTED_VALIDATION_DOMAIN',
    message: `도메인 ${domain}의 validator가 등록되지 않았습니다.`,
    location: { file }
  }
}

function progress(
  options: ValidateDataVersionOptions,
  stage: DataValidationProgress['stage'],
  processedFiles: number,
  totalFiles: number,
  currentFile?: string
): void {
  options.onProgress?.({
    sessionId: options.sessionId,
    stage,
    ...(currentFile ? { currentFile } : {}),
    processedFiles,
    totalFiles,
    percent: totalFiles === 0 ? 100 : (processedFiles / totalFiles) * 100
  })
}

export async function validateDataVersion(
  options: ValidateDataVersionOptions
): Promise<DataValidationSummary> {
  const startedAt = new Date().toISOString()
  const runHistoryPath = validationRunHistoryPath(options)
  let workspace: Awaited<ReturnType<typeof createValidationWorkspace>> | undefined
  let processedFiles = 0
  let records = 0
  let issueSummary = emptyIssueSummary()

  try {
    await migrateLegacyRunHistory(options, runHistoryPath)
    progress(options, 'preparing', 0, 0)
    const prepared = await prepareValidationWorkspace(options)
    workspace = prepared.workspace
    const reportPath = join(workspace.directory, 'validation.json')
    const previousReport = prepared.previousReport
    const acknowledgements = previousReport ? await readAcknowledgements(reportPath) : {}

    const issues: ValidationIssue[] = []
    const files: ValidationReportFile[] = []
    for (const [index, file] of workspace.manifest.files.entries()) {
      options.signal?.throwIfAborted()
      progress(options, 'validating', index, workspace.manifest.files.length, file.workspace)
      const domain = resolveValidationDataDomain(file.workspace)
      const fileRecords = await readDataRecords(
        join(workspace.directory, ...file.workspace.split('/')),
        options.signal
      )
      if (fileRecords.length !== file.records) {
        throw new Error(`작업본 레코드 수가 manifest와 일치하지 않습니다: ${file.workspace}`)
      }
      const registry = new DomainValidatorRegistry()
      if (domain === 'class') registry.register('class', classDataValidator)
      const skillDataValidator =
        domain === 'skill' ? resolveSkillDataValidator(file.workspace) : undefined
      if (skillDataValidator) registry.register('skill', skillDataValidator)
      const result = await runDataValidation({
        files: [
          {
            version: options.version,
            environment: options.environment,
            file: file.workspace,
            domain,
            records: fileRecords
          }
        ],
        domainValidators: registry,
        acknowledgements,
        signal: options.signal
      })
      const fileIssues = [
        ...result.issues,
        ...(domain === 'class' || skillDataValidator
          ? []
          : [createUnsupportedDomainIssue(file.workspace, domain)])
      ]
      issues.push(...fileIssues)
      records += result.summary.records
      processedFiles = index + 1
      files.push({
        file: file.workspace,
        domain,
        records: result.summary.records,
        errors: fileIssues.filter((issue) => issue.severity === 'error').length,
        warnings: fileIssues.filter((issue) => issue.severity === 'warning').length
      })
    }

    const errors = issues.filter((issue) => issue.severity === 'error').length
    const warnings = issues.filter((issue) => issue.severity === 'warning')
    const unresolvedWarnings = warnings.filter(
      (issue) =>
        !issue.acknowledgement?.acknowledged && !issue.acknowledgement?.exceptionReason?.trim()
    ).length
    issueSummary = { errors, warnings: warnings.length, unresolvedWarnings }
    const summary: ValidationSummary = { files: files.length, records, ...issueSummary }
    const status = errors > 0 ? 'invalid' : unresolvedWarnings > 0 ? 'review' : 'ready'
    const report: StoredValidationReport = {
      version: options.version,
      environment: options.environment,
      status,
      publishable: errors === 0 && unresolvedWarnings === 0,
      summary,
      files,
      issues
    }

    options.signal?.throwIfAborted()
    progress(options, 'writing', files.length, files.length)
    options.signal?.throwIfAborted()
    await writeConsistentValidationState(
      reportPath,
      workspace.manifestPath,
      previousReport,
      workspace.manifest,
      report,
      { ...workspace.manifest, status }
    )
    await appendRunHistory(runHistoryPath, {
      id: options.sessionId,
      inputHash: workspace.manifest.input.inputSha256,
      startedAt,
      endedAt: new Date().toISOString(),
      status: 'success',
      processed: { files: processedFiles, records },
      issues: issueSummary
    })
    progress(options, 'completed', files.length, files.length)
    return { sessionId: options.sessionId, workspacePath: workspace.directory, ...report }
  } catch (error) {
    await appendRunHistory(runHistoryPath, {
      id: options.sessionId,
      inputHash: workspace?.manifest.input.inputSha256 ?? null,
      startedAt,
      endedAt: new Date().toISOString(),
      status: isAbortError(error) ? 'cancelled' : 'failed',
      processed: { files: processedFiles, records },
      issues: issueSummary
    })
    throw error
  }
}

export async function updateValidationWarningAcknowledgement(
  options: UpdateValidationWarningAcknowledgementOptions
): Promise<DataValidationReportUpdate> {
  const workspacePath = join(options.dataRoot, '.workspaces', options.environment, options.version)
  const reportPath = join(workspacePath, 'validation.json')
  const manifestPath = join(workspacePath, 'workspace.json')
  const report = await assertConsistentValidationState(reportPath, manifestPath, options)
  if (!report) throw new Error('검증 보고서를 찾을 수 없습니다. 먼저 현재 버전을 검증하세요.')

  const issueIndex = report.issues.findIndex((issue) => issue.id === options.issueId)
  if (issueIndex < 0) throw new Error('검증 보고서에 없는 issue ID입니다.')

  const issue = report.issues[issueIndex]
  if (issue.severity !== 'warning') throw new Error('오류 issue는 확인 처리할 수 없습니다.')

  const acknowledgement: ValidationIssueAcknowledgement | undefined = options.acknowledged
    ? {
        acknowledged: true,
        ...(options.exceptionReason ? { exceptionReason: options.exceptionReason } : {})
      }
    : undefined
  const issues = report.issues.map((entry, index) =>
    index === issueIndex ? { ...entry, ...(acknowledgement ? { acknowledgement } : {}) } : entry
  )
  if (!acknowledgement) delete issues[issueIndex].acknowledgement

  const errors = issues.filter((entry) => entry.severity === 'error').length
  const warnings = issues.filter((entry) => entry.severity === 'warning')
  const unresolvedWarnings = warnings.filter(
    (entry) =>
      !entry.acknowledgement?.acknowledged && !entry.acknowledgement?.exceptionReason?.trim()
  ).length
  const summary: ValidationSummary = {
    ...report.summary,
    errors,
    warnings: warnings.length,
    unresolvedWarnings
  }
  const status = errors > 0 ? 'invalid' : unresolvedWarnings > 0 ? 'review' : 'ready'
  const nextReport: StoredValidationReport = {
    ...report,
    status,
    publishable: errors === 0 && unresolvedWarnings === 0,
    summary,
    issues
  }

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as ValidationWorkspaceManifest
  if (manifest.version !== options.version || manifest.environment !== options.environment) {
    throw new Error('작업본 manifest 버전이 요청과 일치하지 않습니다.')
  }

  await writeConsistentValidationState(reportPath, manifestPath, report, manifest, nextReport, {
    ...manifest,
    status
  })

  return { workspacePath, ...nextReport }
}
