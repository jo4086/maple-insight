import type {
  CopySelectedJobDraftRecoveryRequest,
  CopySelectedJobDraftRecoveryResult,
  JobDataSnapshot,
  JobDraft,
  JobDraftRecoveryPreview,
  SaveJobDraftRequest
} from '../../shared/job-data'
import {
  copySelectedJobDraftRecovery,
  listJobData,
  previewJobDraftRecovery,
  saveJobDraft
} from '../services/jobs/job-data'

import type { MainIpcContext } from './register'

const LIST_JOB_DATA_CHANNEL = 'job-data:list'
const PREVIEW_JOB_DRAFT_RECOVERY_CHANNEL = 'job-data:draft-recovery:preview'
const COPY_SELECTED_JOB_DRAFT_RECOVERY_CHANNEL = 'job-data:draft-recovery:copy-selected'
const SAVE_JOB_DRAFT_CHANNEL = 'job-data:draft:save'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SHA256_PATTERN = /^[a-f0-9]{64}$/
const JOB_ID_PATTERN = /^\d{1,5}$/

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isCopySelectedJobDraftRecoveryRequest(
  value: unknown
): value is CopySelectedJobDraftRecoveryRequest {
  if (!isObject(value)) return false
  const keys = Object.keys(value)
  return (
    keys.length === 4 &&
    keys.every((key) => ['version', 'recoveryId', 'sourceSha256', 'jobId'].includes(key)) &&
    isVersion(value.version) &&
    typeof value.recoveryId === 'string' &&
    UUID_PATTERN.test(value.recoveryId) &&
    typeof value.sourceSha256 === 'string' &&
    SHA256_PATTERN.test(value.sourceSha256) &&
    typeof value.jobId === 'string' &&
    JOB_ID_PATTERN.test(value.jobId)
  )
}

function isVersion(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d+\.\d+\.\d+$/.test(value) &&
    value.split('.').every((part) => Number.isSafeInteger(Number(part))) &&
    value ===
      value
        .split('.')
        .map((part) => String(Number(part)))
        .join('.')
  )
}

export function registerJobDataHandlers(context: MainIpcContext): string[] {
  const { ipcMain, resolveManagedDataRoot, resolveValidationEnvironment } = context

  ipcMain.handle(LIST_JOB_DATA_CHANNEL, async (_, version: unknown): Promise<JobDataSnapshot> => {
    if (typeof version !== 'string' || !isVersion(version))
      throw new Error('Invalid job data version')
    const environment = await resolveValidationEnvironment(version)
    return listJobData({ dataRoot: resolveManagedDataRoot(), environment, version })
  })

  ipcMain.handle(
    PREVIEW_JOB_DRAFT_RECOVERY_CHANNEL,
    async (_, version: unknown): Promise<JobDraftRecoveryPreview> => {
      if (typeof version !== 'string' || !isVersion(version))
        throw new Error('Invalid job data version')
      const environment = await resolveValidationEnvironment(version)
      return previewJobDraftRecovery({
        dataRoot: resolveManagedDataRoot(),
        environment,
        version
      })
    }
  )

  ipcMain.handle(
    COPY_SELECTED_JOB_DRAFT_RECOVERY_CHANNEL,
    async (_, request: unknown): Promise<CopySelectedJobDraftRecoveryResult> => {
      if (!isCopySelectedJobDraftRecoveryRequest(request))
        throw new Error('Invalid copy job draft recovery request')
      const environment = await resolveValidationEnvironment(request.version)
      const { changeSetId, record } = await copySelectedJobDraftRecovery(
        {
          dataRoot: resolveManagedDataRoot(),
          environment,
          version: request.version
        },
        request
      )
      return { changeSetId, recordId: record.recordId, revision: record.revision }
    }
  )

  ipcMain.handle(SAVE_JOB_DRAFT_CHANNEL, async (_, request: unknown): Promise<JobDraft> => {
    if (
      !isObject(request) ||
      !isVersion(request.version) ||
      !isObject(request.draft) ||
      Object.keys(request).some((key) => key !== 'version' && key !== 'draft')
    )
      throw new Error('Invalid save job draft request')
    const input = request as SaveJobDraftRequest
    const environment = await resolveValidationEnvironment(input.version)
    return saveJobDraft(
      { dataRoot: resolveManagedDataRoot(), environment, version: input.version },
      input
    )
  })

  return [
    LIST_JOB_DATA_CHANNEL,
    PREVIEW_JOB_DRAFT_RECOVERY_CHANNEL,
    COPY_SELECTED_JOB_DRAFT_RECOVERY_CHANNEL,
    SAVE_JOB_DRAFT_CHANNEL
  ]
}
