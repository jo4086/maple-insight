import type { DataRecord, JsonValue } from './data-import'

export type ValidationSeverity = 'error' | 'warning'
export type ValidationSource = 'common' | 'domain'
export type ValidationDataDomain = 'class' | 'skill' | 'equipment' | 'monster' | 'unknown'
export type ValidationWorkspaceStatus =
  | 'pending'
  | 'validating'
  | 'invalid'
  | 'review'
  | 'ready'
  | 'failed'

export type ValidationIssueLocation = {
  file: string
  record?: number
  field?: string
}

export type ValidationValueChange = {
  before?: JsonValue
  after?: JsonValue
}

export type ValidationIssueAcknowledgement = {
  acknowledged: boolean
  exceptionReason?: string
}

export type ValidationIssue = {
  id: string
  validator: string
  source: ValidationSource
  domain?: string
  severity: ValidationSeverity
  code: string
  message: string
  location: ValidationIssueLocation
  value?: ValidationValueChange
  acknowledgement?: ValidationIssueAcknowledgement
}

export type ValidationIssueDraft = Omit<
  ValidationIssue,
  'id' | 'validator' | 'source' | 'domain' | 'location' | 'acknowledgement'
> & {
  location?: Omit<ValidationIssueLocation, 'file'>
}

export type DataValidatorInput = {
  version: string
  environment: 'test' | 'production'
  file: string
  domain?: ValidationDataDomain
  records: readonly DataRecord[]
  signal?: AbortSignal
}

export type DataValidatorOutput = {
  records?: readonly DataRecord[]
  issues: readonly ValidationIssueDraft[]
}

export type DataValidator = {
  key: string
  validate: (input: DataValidatorInput) => DataValidatorOutput | Promise<DataValidatorOutput>
}

export type ValidationFileInput = Omit<DataValidatorInput, 'records'> & {
  records: readonly DataRecord[]
}

export type ValidationFileResult = {
  file: string
  domain?: ValidationDataDomain
  records: readonly DataRecord[]
  issues: readonly ValidationIssue[]
}

export type ValidationSummary = {
  files: number
  records: number
  errors: number
  warnings: number
  unresolvedWarnings: number
}

export type DataValidationResult = {
  status: Exclude<ValidationWorkspaceStatus, 'pending' | 'validating' | 'failed'>
  publishable: boolean
  summary: ValidationSummary
  files: readonly ValidationFileResult[]
  issues: readonly ValidationIssue[]
}

export type ValidationWorkspaceFile = {
  source: string
  workspace: string
  records: number
  sha256: string
}

export type ValidationWorkspaceManifest = {
  schemaVersion: 1
  version: string
  environment: 'test' | 'production'
  status: ValidationWorkspaceStatus
  input: {
    manifest: string
    manifestSha256: string
    inputSha256: string
  }
  files: readonly ValidationWorkspaceFile[]
}

export type DataValidationRequest = {
  sessionId: string
  version: string
  conflictPolicy?: 'error' | 'reuse' | 'replace'
}

export type DataValidationWarningAcknowledgementRequest = {
  version: string
  issueId: string
  acknowledged: boolean
  exceptionReason?: string
}

export type DataValidationProgress = {
  sessionId: string
  stage: 'preparing' | 'validating' | 'writing' | 'completed'
  currentFile?: string
  processedFiles: number
  totalFiles: number
  percent: number
}

export type ValidationReportFile = {
  file: string
  domain: ValidationDataDomain
  records: number
  errors: number
  warnings: number
}

export type DataValidationSummary = {
  sessionId: string
  version: string
  environment: 'test' | 'production'
  workspacePath: string
  status: DataValidationResult['status']
  publishable: boolean
  summary: ValidationSummary
  files: readonly ValidationReportFile[]
  issues: readonly ValidationIssue[]
}

export type DataValidationReportUpdate = Omit<DataValidationSummary, 'sessionId'>

export type DataValidationRunResult =
  | { status: 'success'; validation: DataValidationSummary }
  | { status: 'failed' | 'cancelled'; sessionId: string; message: string }
