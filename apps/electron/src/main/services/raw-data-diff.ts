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

export type RawDataDiff = {
  readonly add: readonly RawDataRecord[]
  readonly modify: readonly RawDataModifiedRecord[]
  readonly delete: readonly RawDataRecord[]
}

const identityFieldsByFilename = {
  'ms_job.json': ['jobID'],
  'ms_skill.json': ['skillID'],
  'ms_skillH.json': ['skillID'],
  'ms_skillCommon.json': ['skillID', 'commonName'],
  'ms_skillLevel.json': ['skillID', 'level']
} as const

type RawDataDiffFilename = keyof typeof identityFieldsByFilename

type IndexedRecord = {
  record: RawDataRecord
  identity: Readonly<Record<string, string>>
}

function isRawDataDiffFilename(filename: string): filename is RawDataDiffFilename {
  return Object.hasOwn(identityFieldsByFilename, filename)
}

function formatIdentity(identity: Readonly<Record<string, string>>): string {
  return Object.entries(identity)
    .map(([field, value]) => `${field}=${JSON.stringify(value)}`)
    .join(', ')
}

function createIdentity(
  record: RawDataRecord,
  fields: readonly string[],
  side: string,
  index: number
): Readonly<Record<string, string>> {
  const identity: Record<string, string> = {}
  for (const field of fields) {
    const value = record[field]
    if (!Object.hasOwn(record, field) || typeof value !== 'string' || value.length === 0) {
      throw new Error(
        `Invalid ${side} record at index ${index}: missing or empty string identity field ${field}`
      )
    }
    identity[field] = value
  }
  return identity
}

function identityKey(
  identity: Readonly<Record<string, string>>,
  fields: readonly string[]
): string {
  return JSON.stringify(fields.map((field) => identity[field]))
}

function isJsonObject(value: object): boolean {
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function assertJsonValue(
  value: unknown,
  path: string,
  ancestors: Set<object>
): asserts value is RawDataValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return
  if (typeof value === 'number') {
    if (Number.isFinite(value)) return
    throw new Error(`Invalid JSON value at ${path}: number must be finite`)
  }
  if (typeof value !== 'object') {
    throw new Error(`Invalid JSON value at ${path}: expected a JSON-compatible value`)
  }
  if (ancestors.has(value)) {
    throw new Error(`Invalid JSON value at ${path}: circular values are not supported`)
  }

  if (!Array.isArray(value) && !isJsonObject(value)) {
    throw new Error(`Invalid JSON value at ${path}: expected a JSON-compatible value`)
  }

  ancestors.add(value)
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.hasOwn(value, index)) {
        throw new Error(`Invalid JSON value at ${path}[${index}]: sparse arrays are not supported`)
      }
      assertJsonValue(value[index], `${path}[${index}]`, ancestors)
    }
  } else {
    for (const [key, item] of Object.entries(value)) {
      assertJsonValue(item, `${path}.${key}`, ancestors)
    }
  }
  ancestors.delete(value)
}

function indexRecords(
  filename: RawDataDiffFilename,
  records: unknown,
  side: string
): Map<string, IndexedRecord> {
  if (!Array.isArray(records)) {
    throw new Error(`Invalid ${side} records: expected an array`)
  }

  const fields = identityFieldsByFilename[filename]
  const indexed = new Map<string, IndexedRecord>()
  for (const [index, candidate] of records.entries()) {
    if (
      candidate === null ||
      typeof candidate !== 'object' ||
      Array.isArray(candidate) ||
      !isJsonObject(candidate)
    ) {
      throw new Error(`Invalid ${side} record at index ${index}: expected a JSON object`)
    }
    assertJsonValue(candidate, `${side}[${index}]`, new Set())
    const record = candidate as RawDataRecord
    const identity = createIdentity(record, fields, side, index)
    const key = identityKey(identity, fields)
    if (indexed.has(key)) {
      throw new Error(`Duplicate ${side} identity for ${filename}: ${formatIdentity(identity)}`)
    }
    indexed.set(key, { record, identity })
  }
  return indexed
}

function jsonValuesEqual(left: RawDataValue, right: RawDataValue): boolean {
  if (left === right) return true
  if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object') {
    return false
  }
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => jsonValuesEqual(value, right[index]))
    )
  }

  const leftKeys = Object.keys(left).sort()
  const rightKeys = Object.keys(right).sort()
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key, index) =>
        key === rightKeys[index] &&
        Object.hasOwn(right, key) &&
        jsonValuesEqual(left[key], right[key])
    )
  )
}

function valueAt(record: RawDataRecord, field: string): RawDataFieldValue {
  return Object.hasOwn(record, field) ? { kind: 'value', value: record[field] } : { kind: 'absent' }
}

function changedFields(base: RawDataRecord, compare: RawDataRecord): RawDataFieldChange[] {
  const fields = [...new Set([...Object.keys(base), ...Object.keys(compare)])].sort()
  return fields.flatMap((field) => {
    const before = valueAt(base, field)
    const after = valueAt(compare, field)
    if (before.kind === 'absent' && after.kind === 'absent') return []
    if (
      before.kind === 'value' &&
      after.kind === 'value' &&
      jsonValuesEqual(before.value, after.value)
    ) {
      return []
    }
    return [{ field, before, after }]
  })
}

export function diffRawData(
  filename: string,
  baseRecords: unknown,
  compareRecords: unknown
): RawDataDiff {
  if (!isRawDataDiffFilename(filename)) {
    throw new Error(`Unsupported raw data diff filename: ${filename}`)
  }

  const base = indexRecords(filename, baseRecords, 'base')
  const compare = indexRecords(filename, compareRecords, 'compare')
  const fields = identityFieldsByFilename[filename]
  const orderedKeys = [...new Set([...base.keys(), ...compare.keys()])].sort()
  const add: RawDataRecord[] = []
  const modify: RawDataModifiedRecord[] = []
  const deleted: RawDataRecord[] = []

  for (const key of orderedKeys) {
    const before = base.get(key)
    const after = compare.get(key)
    if (!before && after) {
      add.push(after.record)
      continue
    }
    if (before && !after) {
      deleted.push(before.record)
      continue
    }
    if (!before || !after) continue

    const changed = changedFields(before.record, after.record)
    if (changed.length > 0) {
      modify.push({
        identity: Object.fromEntries(fields.map((field) => [field, before.identity[field]])),
        fields: changed,
        before: before.record,
        after: after.record
      })
    }
  }

  return { add, modify, delete: deleted }
}
