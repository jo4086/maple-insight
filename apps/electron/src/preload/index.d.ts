type DataFileInfo = {
  name: string
  path: string
  format: 'csv' | 'json'
  size: number
  modifiedAt: string
}

type DataFileKind = 'equipment' | 'skill' | 'class' | 'monster' | 'unknown'

type DataFileClassification = {
  kind: DataFileKind
  confidence: number
  probabilities: Record<DataFileKind, number>
  model: string
  usage: {
    inputTokens: number
    outputTokens: number
  }
}

type MapleAdminApi = {
  openDataFile: () => Promise<DataFileInfo | null>
  openDataDirectory: () => Promise<DataDirectoryInfo | null>
  classifyDataFile: (filePath: string) => Promise<DataFileClassification>
  convertDataFile: (request: DataFileConversionRequest) => Promise<DataFileConversionResult>
  cancelDataFileConversion: (sessionId: string) => Promise<boolean>
  onDataFileConversionProgress: (
    listener: (progress: DataFileConversionProgress) => void
  ) => () => void
  convertDataDirectory: (
    request: DataDirectoryConversionRequest
  ) => Promise<DataDirectoryConversionResult>
  onDataDirectoryConversionProgress: (
    listener: (progress: DataDirectoryConversionProgress) => void
  ) => () => void
  listDataVersions: () => Promise<string[]>
  listRegisteredDataVersions: () => Promise<RegisteredDataVersion[]>
  updateDataVersionReleaseDate: (request: UpdateDataVersionReleaseDateRequest) => Promise<void>
  copyDataVersion: (request: CopyDataVersionRequest) => Promise<void>
  deleteDataVersion: (request: DeleteDataVersionRequest) => Promise<void>
  listComparableFiles: (request: ListComparableFilesRequest) => Promise<string[]>
  compareRawData: (request: CompareRawDataRequest) => Promise<RawDataComparison>
  saveRawDataDiff: (
    request: SaveRawDataDiffRequest
  ) => Promise<{ status: 'created' | 'reused' | 'replaced'; result: RawDataComparison }>
  openRawDataDiff: (request: CompareRawDataRequest) => Promise<RawDataComparison | null>
  validateDataVersion: (request: DataValidationRequest) => Promise<DataValidationRunResult>
  cancelDataValidation: (sessionId: string) => Promise<boolean>
  updateDataValidationWarning: (
    request: DataValidationWarningAcknowledgementRequest
  ) => Promise<DataValidationReportUpdate>
  onDataValidationProgress: (listener: (progress: DataValidationProgress) => void) => () => void
  captureScreenshot: () => Promise<ScreenshotCaptureResult>
  onScreenshotCaptured: (listener: (event: ScreenshotCaptureEvent) => void) => () => void
}

declare global {
  interface Window {
    api: MapleAdminApi
  }
}

export {}
import type {
  DataDirectoryConversionProgress,
  DataDirectoryConversionRequest,
  DataDirectoryConversionResult,
  DataDirectoryInfo,
  DataFileConversionProgress,
  DataFileConversionRequest,
  DataFileConversionResult
} from '../shared/data-import'
import type {
  CompareRawDataRequest,
  ListComparableFilesRequest,
  RawDataComparison,
  SaveRawDataDiffRequest
} from '../shared/raw-data-diff'
import type { ScreenshotCaptureEvent, ScreenshotCaptureResult } from '../shared/screenshot'
import type {
  CopyDataVersionRequest,
  DeleteDataVersionRequest,
  RegisteredDataVersion,
  UpdateDataVersionReleaseDateRequest
} from '../shared/data-versions'
import type {
  DataValidationProgress,
  DataValidationRequest,
  DataValidationRunResult,
  DataValidationReportUpdate,
  DataValidationWarningAcknowledgementRequest
} from '../shared/data-validation'
