export type DataFileInfo = {
  name: string
  path: string
  format: 'csv' | 'json'
  size: number
  modifiedAt: string
}

export type {
  DataDirectoryConversionProgress,
  DataDirectoryConversionResult,
  DataDirectoryInfo,
  DataFileConversionProgress,
  DataFileConversionResult
} from '../../../../shared/data-import'

export type DataFileKind = 'equipment' | 'skill' | 'class' | 'monster' | 'unknown'

export type DataFileClassification = {
  kind: DataFileKind
  confidence: number
  probabilities: Record<DataFileKind, number>
  model: string
  usage: {
    inputTokens: number
    outputTokens: number
  }
}
