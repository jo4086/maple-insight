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
import type { ScreenshotCaptureEvent, ScreenshotCaptureResult } from '../shared/screenshot'
