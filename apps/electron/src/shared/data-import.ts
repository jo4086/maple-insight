export type DataFileFormat = 'csv' | 'json'

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export type DataRecord = Record<string, JsonValue>

export type DataConversionIssue = {
  severity: 'error' | 'warning'
  code: string
  message: string
  file?: string
  row?: number
  column?: number | string
  field?: string
}

export type DataFileConversionRequest = {
  sessionId: string
  filePath: string
  targetVersion: string
}

export type DataFileConversionProgress = {
  sessionId: string
  stage: 'reading' | 'parsing' | 'writing' | 'completed'
  processedBytes: number
  totalBytes: number
  percent: number
  processedRecords: number
}

export type DataFileConversionSummary = {
  sessionId: string
  targetVersion: string
  source: {
    name: string
    format: DataFileFormat
    size: number
    modifiedAt: string
    sha256: string
  }
  outputPath: string
  totalRecords: number
  convertedRecords: number
  rejectedRecords: number
  previewRecords: DataRecord[]
  issues: DataConversionIssue[]
}

export type DataFileConversionResult =
  | {
      status: 'success'
      summary: DataFileConversionSummary
    }
  | {
      status: 'failed' | 'cancelled'
      sessionId: string
      issues: DataConversionIssue[]
    }

export type DataDirectoryFileInfo = {
  name: string
  relativePath: string
  size: number
  modifiedAt: string
}

export type DataDirectoryInfo = {
  name: string
  path: string
  size: number
  modifiedAt: string
  fileCount: number
  files: DataDirectoryFileInfo[]
  detectedVersion?: string
  environment?: 'test' | 'production'
}

export type DataDirectoryConversionRequest = {
  sessionId: string
  directoryPath: string
  targetVersion: string
  releasedOn: string | null
}

export type DataDirectoryConversionProgress = DataFileConversionProgress & {
  currentFile: string
  processedFiles: number
  totalFiles: number
}

export type DataDirectoryConversionFileSummary = {
  relativePath: string
  outputPath: string
  size: number
  sha256: string
  totalRecords: number
  convertedRecords: number
  rejectedRecords: number
  issues: DataConversionIssue[]
}

export type DataDirectoryConversionSummary = {
  sessionId: string
  targetVersion: string
  sourceDirectory: string
  outputPath: string
  totalFiles: number
  convertedFiles: number
  totalBytes: number
  totalRecords: number
  convertedRecords: number
  rejectedRecords: number
  files: DataDirectoryConversionFileSummary[]
  issues: DataConversionIssue[]
  managedData?: {
    versionDirectory: string
    csvDirectory: string
    jsonDirectory: string
    manifestPath: string
  }
  versionRegistration?: {
    environment: 'test' | 'production'
    releasedOn: string | null
    status: 'importing'
  }
}

export type DataDirectoryConversionResult =
  | {
      status: 'success'
      summary: DataDirectoryConversionSummary
    }
  | {
      status: 'failed' | 'cancelled'
      sessionId: string
      issues: DataConversionIssue[]
    }
