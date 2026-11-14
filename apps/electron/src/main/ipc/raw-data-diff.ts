import type {
  CompareRawDataRequest,
  ListComparableFilesRequest,
  RawDataComparison,
  SaveRawDataDiffRequest
} from '../../shared/raw-data-diff'
import {
  compareRawData,
  listComparableRawDataFiles,
  openRawDataDiff,
  saveRawDataDiff
} from '../services/diff/raw-data-diff-service'

import type { MainIpcContext } from './register'

const LIST_COMPARABLE_RAW_DATA_FILES_CHANNEL = 'raw-data-diff:list-comparable-files'
const COMPARE_RAW_DATA_CHANNEL = 'raw-data-diff:compare'
const SAVE_RAW_DATA_DIFF_CHANNEL = 'raw-data-diff:save'
const OPEN_RAW_DATA_DIFF_CHANNEL = 'raw-data-diff:open'

function isRawDataDiffRequest(value: unknown): value is CompareRawDataRequest {
  if (!value || typeof value !== 'object') return false
  const request = value as Partial<CompareRawDataRequest>
  return (
    typeof request.baseVersion === 'string' &&
    /^\d+\.\d+\.\d+$/.test(request.baseVersion) &&
    typeof request.compareVersion === 'string' &&
    /^\d+\.\d+\.\d+$/.test(request.compareVersion) &&
    request.baseVersion !== request.compareVersion &&
    typeof request.filename === 'string' &&
    [
      'ms_job.json',
      'ms_skill.json',
      'ms_skillH.json',
      'ms_skillCommon.json',
      'ms_skillLevel.json'
    ].includes(request.filename)
  )
}

function isListComparableRawDataFilesRequest(value: unknown): value is ListComparableFilesRequest {
  if (!value || typeof value !== 'object') return false
  const request = value as Partial<ListComparableFilesRequest>
  return (
    typeof request.baseVersion === 'string' &&
    /^\d+\.\d+\.\d+$/.test(request.baseVersion) &&
    typeof request.compareVersion === 'string' &&
    /^\d+\.\d+\.\d+$/.test(request.compareVersion) &&
    request.baseVersion !== request.compareVersion
  )
}

function isSaveRawDataDiffRequest(value: unknown): value is SaveRawDataDiffRequest {
  if (!isRawDataDiffRequest(value)) return false
  const request = value as Partial<SaveRawDataDiffRequest>
  return (
    typeof request.inputHash === 'string' &&
    /^[a-f0-9]{64}$/.test(request.inputHash) &&
    (request.replaceExisting === undefined || typeof request.replaceExisting === 'boolean')
  )
}

export function registerRawDataDiffHandlers(context: MainIpcContext): string[] {
  const { ipcMain, resolveManagedDataRoot, resolveVisibleVersion } = context

  ipcMain.handle(
    LIST_COMPARABLE_RAW_DATA_FILES_CHANNEL,
    async (_, request: unknown): Promise<string[]> => {
      if (!isListComparableRawDataFilesRequest(request))
        throw new Error('Raw data diff request format is invalid')
      return listComparableRawDataFiles(resolveManagedDataRoot(), request, resolveVisibleVersion)
    }
  )

  ipcMain.handle(
    COMPARE_RAW_DATA_CHANNEL,
    async (_, request: unknown): Promise<RawDataComparison> => {
      if (!isRawDataDiffRequest(request)) throw new Error('Raw data diff request format is invalid')
      return compareRawData(resolveManagedDataRoot(), request, resolveVisibleVersion)
    }
  )

  ipcMain.handle(
    SAVE_RAW_DATA_DIFF_CHANNEL,
    async (
      _,
      request: unknown
    ): Promise<{ status: 'created' | 'reused' | 'replaced'; result: RawDataComparison }> => {
      if (!isSaveRawDataDiffRequest(request))
        throw new Error('Raw data diff request format is invalid')
      return saveRawDataDiff(resolveManagedDataRoot(), request, resolveVisibleVersion)
    }
  )

  ipcMain.handle(
    OPEN_RAW_DATA_DIFF_CHANNEL,
    async (_, request: unknown): Promise<RawDataComparison | null> => {
      if (!isRawDataDiffRequest(request)) throw new Error('Raw data diff request format is invalid')
      return openRawDataDiff(resolveManagedDataRoot(), request, resolveVisibleVersion)
    }
  )

  return [
    LIST_COMPARABLE_RAW_DATA_FILES_CHANNEL,
    COMPARE_RAW_DATA_CHANNEL,
    SAVE_RAW_DATA_DIFF_CHANNEL,
    OPEN_RAW_DATA_DIFF_CHANNEL
  ]
}
