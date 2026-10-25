import type {
  RawDataComparison,
  RawDataFieldValue as FieldValue,
  RawDataModifiedRecord,
  RawDataRecord,
  RawDataValue as JsonValue
} from '../../../../shared/raw-data-diff'

export const comparisonFiles = [
  'ms_job.json',
  'ms_skill.json',
  'ms_skillH.json',
  'ms_skillCommon.json',
  'ms_skillLevel.json'
] as const

export type ComparisonFilename = (typeof comparisonFiles)[number]
export type ResultCategory = 'all' | 'add' | 'modify' | 'delete'
export type PreviewCategory = Exclude<ResultCategory, 'all'>

type CompareFileOutcome =
  | { kind: 'saved'; result: RawDataComparison; reused: boolean }
  | { kind: 'conflict'; result: RawDataComparison }
  | { kind: 'error'; result: RawDataComparison | null; error: unknown }

type CompareFileApi = Pick<
  typeof window.api,
  'compareRawData' | 'openRawDataDiff' | 'saveRawDataDiff'
>

type CompareFileRequest = {
  baseVersion: string
  compareVersion: string
  filename: ComparisonFilename
}

export type ResultItem =
  | { kind: 'add'; key: string; record: RawDataRecord }
  | { kind: 'modify'; key: string; change: RawDataModifiedRecord }
  | { kind: 'delete'; key: string; record: RawDataRecord }

type FullModifiedRecord = RawDataModifiedRecord & {
  readonly before?: RawDataRecord
  readonly after?: RawDataRecord
}

export function formatValue(value: JsonValue): string {
  return JSON.stringify(value, null, 2)
}

export function identityLabel(identity: Readonly<Record<string, string>>): string {
  return Object.entries(identity)
    .map(([field, value]) => `${field}: ${value}`)
    .join(' · ')
}

export function formatFieldValue(value: FieldValue): string {
  return value.kind === 'absent' ? '필드 없음' : formatValue(value.value)
}

export function isStaleInputHashError(error: unknown): boolean {
  return error instanceof Error && /raw data input hash is stale/i.test(error.message)
}

function isInvalidSavedDiffError(error: unknown): boolean {
  return error instanceof Error && /invalid saved raw data diff/i.test(error.message)
}

export function getCompareErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return '비교 작업 중 알 수 없는 오류가 발생했습니다.'

  const missingVersion = error.message.match(
    /(?:Missing input|Expected directory): .*[/\\](production|test)[/\\]([^/\\]+)[/\\]json/
  )
  if (missingVersion)
    return `데이터 루트에 등록된 버전 ${missingVersion[2]}의 관리 JSON 디렉터리(${missingVersion[1]}/${missingVersion[2]}/json)가 없습니다.`

  return error.message
}

export function comparisonCounts(result: RawDataComparison | null): {
  all: number
  add: number
  modify: number
  delete: number
} {
  const add = result?.add.length ?? 0
  const modify = result?.modify.length ?? 0
  const deleted = result?.delete.length ?? 0
  return { all: add + modify + deleted, add, modify, delete: deleted }
}

export async function compareAndSaveRawDataFile(
  api: CompareFileApi,
  request: CompareFileRequest,
  isCurrent: () => boolean = () => true
): Promise<CompareFileOutcome | null> {
  let comparison: RawDataComparison | null = null
  try {
    comparison = await api.compareRawData(request)
    if (!isCurrent()) return null

    let existing: RawDataComparison | null
    try {
      existing = await api.openRawDataDiff(request)
    } catch (error) {
      if (!isCurrent()) return null
      if (isInvalidSavedDiffError(error)) return { kind: 'conflict', result: comparison }
      throw error
    }
    if (!isCurrent()) return null
    if (existing && existing.inputHash !== comparison.inputHash) {
      return { kind: 'conflict', result: comparison }
    }

    const saved = await api.saveRawDataDiff({ ...request, inputHash: comparison.inputHash })
    if (!isCurrent()) return null
    return { kind: 'saved', result: saved.result, reused: saved.status === 'reused' }
  } catch (error) {
    return { kind: 'error', result: comparison, error }
  }
}

export function isComparisonForContext(
  result: RawDataComparison | null,
  baseVersion: string,
  targetVersion: string,
  filename: string
): result is RawDataComparison {
  return Boolean(
    result &&
      result.baseVersion === baseVersion &&
      result.compareVersion === targetVersion &&
      result.filename === filename
  )
}

export function filterResultItems(
  result: RawDataComparison,
  category: ResultCategory,
  query: string
): ResultItem[] {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const items: ResultItem[] = [
    ...result.add.map((record, index) => ({
      kind: 'add' as const,
      key: `add-${index}`,
      record
    })),
    ...result.modify.map((change, index) => ({
      kind: 'modify' as const,
      key: `modify-${index}`,
      change
    })),
    ...result.delete.map((record, index) => ({
      kind: 'delete' as const,
      key: `delete-${index}`,
      record
    }))
  ]

  return items.filter((item) => {
    if (category !== 'all' && item.kind !== category) return false
    if (!normalizedQuery) return true
    const text =
      item.kind === 'modify' ? modifiedRecordSearchText(item.change) : formatValue(item.record)
    return text.toLocaleLowerCase().includes(normalizedQuery)
  })
}

function modifiedRecordSearchText(change: RawDataModifiedRecord): string {
  const fullChange = change as FullModifiedRecord
  return `${identityLabel(change.identity)} ${
    fullChange.before ? formatValue(fullChange.before) : ''
  } ${fullChange.after ? formatValue(fullChange.after) : ''} ${change.fields
    .map(
      (field) => `${field.field} ${formatFieldValue(field.before)} ${formatFieldValue(field.after)}`
    )
    .join(' ')}`
}

export function getPreviewItems(
  result: RawDataComparison,
  category: PreviewCategory
): ResultItem[] {
  return filterResultItems(result, category, '')
}
