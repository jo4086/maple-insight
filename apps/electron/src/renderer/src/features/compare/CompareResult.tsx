import { Fragment, type ReactNode } from 'react'

import type {
  RawDataComparison,
  RawDataFieldValue as FieldValue,
  RawDataModifiedRecord,
  RawDataRecord,
  RawDataValue as JsonValue
} from '../../../../shared/raw-data-diff'

import { formatValue, type ResultItem } from './CompareResultModel'

export function ResultHeader({ result }: { result: RawDataComparison }): React.JSX.Element {
  return (
    <div className="min-w-0">
      <strong className="block break-all font-mono text-small text-app-text">
        {result.filename}
      </strong>
      <span className="mt-1 block break-all text-caption text-app-muted">
        {result.baseVersion} → {result.compareVersion}
      </span>
    </div>
  )
}

export function ResultCard({ item }: { item: ResultItem }): React.JSX.Element {
  if (item.kind === 'modify') return <ModifyCard change={item.change} />
  return (
    <RecordCard
      title={item.kind === 'add' ? '추가' : '삭제'}
      record={item.record}
      tone={item.kind === 'add' ? 'text-app-accent' : 'text-app-danger'}
    />
  )
}

function RecordCard({
  title,
  record,
  tone
}: {
  title: string
  record: RawDataRecord
  tone: string
}): React.JSX.Element {
  return (
    <article className="min-w-0 rounded-md border border-app-border bg-app-input p-4">
      <strong className={`text-small ${tone}`}>{title}</strong>
      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all font-mono text-caption text-app-text">
        {formatValue(record)}
      </pre>
    </article>
  )
}

function ModifyCard({ change }: { change: RawDataModifiedRecord }): React.JSX.Element {
  const before = change.before ?? fallbackRecord(change, 'before')
  const after = change.after ?? fallbackRecord(change, 'after')
  const changedPaths = getChangedLeafPaths(change)

  return (
    <article className="min-w-0 rounded-md border border-app-warning-border bg-app-input p-4">
      <strong className="text-small text-app-warning">수정</strong>
      <div className="mt-2 grid min-w-0 gap-3 sm:grid-cols-2">
        <JsonCodeBox label="이전" record={before} changedPaths={changedPaths.before} />
        <JsonCodeBox label="이후" record={after} changedPaths={changedPaths.after} />
      </div>
    </article>
  )
}

function fallbackRecord(change: RawDataModifiedRecord, side: 'before' | 'after'): RawDataRecord {
  const record: Record<string, JsonValue> = { ...change.identity }
  for (const field of change.fields) {
    const value = field[side]
    if (value.kind === 'value') {
      Object.defineProperty(record, field.field, {
        value: value.value,
        enumerable: true,
        configurable: true,
        writable: true
      })
    }
  }
  return record
}

function JsonCodeBox({
  label,
  record,
  changedPaths
}: {
  label: string
  record: RawDataRecord
  changedPaths: ReadonlySet<string>
}): React.JSX.Element {
  return (
    <pre
      aria-label={label}
      className="min-w-0 overflow-x-auto whitespace-pre-wrap break-all rounded border border-app-border bg-app-surface p-3 font-mono text-caption text-app-text"
    >
      {renderJson(record, [], changedPaths)}
    </pre>
  )
}

function renderJson(
  value: JsonValue,
  path: readonly (string | number)[],
  changedPaths: ReadonlySet<string>,
  depth = 0
): ReactNode {
  if (Array.isArray(value)) {
    if (value.length === 0) return highlightChangedValue('[]', path, changedPaths)
    return (
      <>
        {'['}
        {value.map((item, index) => (
          <Fragment key={index}>
            {'\n'}
            {indent(depth + 1)}
            {renderJson(item, [...path, index], changedPaths, depth + 1)}
            {index < value.length - 1 ? ',' : ''}
          </Fragment>
        ))}
        {'\n'}
        {indent(depth)}
        {']'}
      </>
    )
  }

  if (isRecord(value)) {
    const entries = Object.entries(value)
    if (entries.length === 0) return highlightChangedValue('{}', path, changedPaths)
    return (
      <>
        {'{'}
        {entries.map(([key, item], index) => (
          <Fragment key={key}>
            {'\n'}
            {indent(depth + 1)}
            {formatValue(key)}: {renderJson(item, [...path, key], changedPaths, depth + 1)}
            {index < entries.length - 1 ? ',' : ''}
          </Fragment>
        ))}
        {'\n'}
        {indent(depth)}
        {'}'}
      </>
    )
  }

  return highlightChangedValue(formatValue(value), path, changedPaths)
}

function highlightChangedValue(
  text: string,
  path: readonly (string | number)[],
  changedPaths: ReadonlySet<string>
): ReactNode {
  if (!changedPaths.has(pathKey(path))) return text
  return (
    <mark
      className="rounded-sm bg-app-warning-bg text-app-text underline decoration-app-warning underline-offset-2"
      data-changed="true"
    >
      {text}
    </mark>
  )
}

function getChangedLeafPaths(change: RawDataModifiedRecord): {
  before: ReadonlySet<string>
  after: ReadonlySet<string>
} {
  const before = new Set<string>()
  const after = new Set<string>()

  for (const field of change.fields) {
    collectChangedLeafPaths(field.before, field.after, [field.field], before, after)
  }

  return { before, after }
}

function collectChangedLeafPaths(
  before: FieldValue,
  after: FieldValue,
  path: readonly (string | number)[],
  beforePaths: Set<string>,
  afterPaths: Set<string>
): void {
  if (
    before.kind === 'value' &&
    after.kind === 'value' &&
    formatValue(before.value) === formatValue(after.value)
  ) {
    return
  }

  if (before.kind === 'value' && after.kind === 'value') {
    const beforeValue = before.value
    const afterValue = after.value

    if (Array.isArray(beforeValue) && Array.isArray(afterValue)) {
      const length = Math.max(beforeValue.length, afterValue.length)
      for (let index = 0; index < length; index += 1) {
        collectChangedLeafPaths(
          fieldValue(beforeValue, index),
          fieldValue(afterValue, index),
          [...path, index],
          beforePaths,
          afterPaths
        )
      }
      return
    }

    if (isRecord(beforeValue) && isRecord(afterValue)) {
      const keys = new Set([...Object.keys(beforeValue), ...Object.keys(afterValue)])
      for (const key of keys) {
        collectChangedLeafPaths(
          fieldValue(beforeValue, key),
          fieldValue(afterValue, key),
          [...path, key],
          beforePaths,
          afterPaths
        )
      }
      return
    }
  }

  if (before.kind === 'value') markLeafPaths(before.value, path, beforePaths)
  if (after.kind === 'value') markLeafPaths(after.value, path, afterPaths)
}

function markLeafPaths(
  value: JsonValue,
  path: readonly (string | number)[],
  paths: Set<string>
): void {
  if (Array.isArray(value)) {
    if (value.length === 0) paths.add(pathKey(path))
    value.forEach((item, index) => markLeafPaths(item, [...path, index], paths))
    return
  }
  if (isRecord(value)) {
    const entries = Object.entries(value)
    if (entries.length === 0) paths.add(pathKey(path))
    for (const [key, item] of entries) {
      markLeafPaths(item, [...path, key], paths)
    }
    return
  }
  paths.add(pathKey(path))
}

function fieldValue(
  value: readonly JsonValue[] | Readonly<Record<string, JsonValue>>,
  key: number | string
): FieldValue {
  if (typeof key === 'number') {
    return key in value ? { kind: 'value', value: value[key] } : { kind: 'absent' }
  }
  return Object.prototype.hasOwnProperty.call(value, key)
    ? { kind: 'value', value: value[key] }
    : { kind: 'absent' }
}

function isRecord(value: JsonValue): value is Readonly<Record<string, JsonValue>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function pathKey(path: readonly (string | number)[]): string {
  return JSON.stringify(path)
}

function indent(depth: number): string {
  return '  '.repeat(depth)
}
