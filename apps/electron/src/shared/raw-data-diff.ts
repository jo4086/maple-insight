export type RawDataValue =
  | null
  | boolean
  | number
  | string
  | readonly RawDataValue[]
  | { readonly [key: string]: RawDataValue }

export type RawDataRecord = Readonly<Record<string, RawDataValue>>

export type RawDataFieldValue =
  { readonly kind: 'absent' } | { readonly kind: 'value'; readonly value: RawDataValue }

export type RawDataFieldChange = {
  readonly field: string
  readonly before: RawDataFieldValue
  readonly after: RawDataFieldValue
}

export type RawDataModifiedRecord = {
  readonly identity: Readonly<Record<string, string>>
  readonly fields: readonly RawDataFieldChange[]
  readonly before?: RawDataRecord
  readonly after?: RawDataRecord
}

export type RawDataComparison = {
  readonly baseVersion: string
  readonly compareVersion: string
  readonly filename: string
  readonly inputHash: string
  readonly add: readonly RawDataRecord[]
  readonly modify: readonly RawDataModifiedRecord[]
  readonly delete: readonly RawDataRecord[]
}

export type ListComparableFilesRequest = {
  baseVersion: string
  compareVersion: string
}

export type CompareRawDataRequest = ListComparableFilesRequest & {
  filename: string
}

export type SaveRawDataDiffRequest = CompareRawDataRequest & {
  inputHash: string
  replaceExisting?: boolean
}
