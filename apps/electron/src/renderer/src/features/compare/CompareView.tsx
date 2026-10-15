import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'

import type {
  RawDataComparison,
  RawDataFieldValue as FieldValue,
  RawDataRecord as RawRecord,
  RawDataValue as JsonValue
} from '../../../../shared/raw-data-diff'
import { ArrowIcon } from '../../components/ui/ArrowIcon'
import { PageHeader } from '../../components/ui/PageHeader'
import { VersionSelect } from '../../components/ui/VersionSelect'
import type { VersionContextValue } from '../version/model'

const pageSize = 10

function formatValue(value: JsonValue): string {
  return JSON.stringify(value, null, 2)
}

function identityLabel(identity: Record<string, string>): string {
  return Object.entries(identity)
    .map(([field, value]) => `${field}: ${value}`)
    .join(' · ')
}

function getErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return '비교 작업 중 알 수 없는 오류가 발생했습니다.'

  const missingVersion = error.message.match(
    /(?:Missing input|Expected directory): .*[/\\](production|test)[/\\]([^/\\]+)[/\\]json/
  )
  if (missingVersion)
    return `데이터 루트에 등록된 버전 ${missingVersion[2]}의 관리 JSON 디렉터리(${missingVersion[1]}/${missingVersion[2]}/json)가 없습니다. 해당 버전을 다시 가져오거나 관리 JSON이 있는 버전을 선택하세요.`

  return error.message
}

export function CompareView({
  versions,
  currentVersion,
  compareVersion,
  changeCurrentVersion,
  changeCompareVersion
}: VersionContextValue): React.JSX.Element {
  const baseVersion = compareVersion
  const targetVersion = currentVersion
  const [files, setFiles] = useState<string[]>([])
  const [filename, setFilename] = useState('')
  const [result, setResult] = useState<RawDataComparison | null>(null)
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [changeQuery, setChangeQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'add' | 'modify'>('all')
  const [changePage, setChangePage] = useState(1)
  const [deleteQuery, setDeleteQuery] = useState('')
  const [deletePage, setDeletePage] = useState(1)
  const deferredChangeQuery = useDeferredValue(changeQuery)
  const deferredDeleteQuery = useDeferredValue(deleteQuery)
  const [replacement, setReplacement] = useState<RawDataComparison | null>(null)
  const requestId = useRef(0)
  const isMounted = useRef(true)
  const context = useRef({ baseVersion, targetVersion, filename })
  context.current = { baseVersion, targetVersion, filename }

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    let isCurrent = true
    const id = ++requestId.current
    setResult(null)
    setFiles([])
    setFilename('')
    setIsRunning(false)
    setIsSaving(false)
    setError('')
    setNotice('')
    setReplacement(null)
    setChangeQuery('')
    setFilter('all')
    setChangePage(1)
    setDeleteQuery('')
    setDeletePage(1)

    if (!baseVersion || !targetVersion || baseVersion === targetVersion) {
      setIsLoadingFiles(false)
      return
    }

    setIsLoadingFiles(true)
    void window.api
      .listComparableFiles({ baseVersion, compareVersion: targetVersion })
      .then((nextFiles) => {
        if (!isCurrent || !isMounted.current || requestId.current !== id) return
        setFiles(nextFiles)
        setFilename(nextFiles[0] ?? '')
      })
      .catch((caught) => {
        if (!isCurrent || !isMounted.current || requestId.current !== id) return
        setError(getErrorMessage(caught))
      })
      .finally(() => {
        if (isCurrent && isMounted.current && requestId.current === id) setIsLoadingFiles(false)
      })

    return () => {
      isCurrent = false
    }
  }, [baseVersion, targetVersion])

  const changes = useMemo(() => {
    if (!result) return []
    const normalizedQuery = deferredChangeQuery.trim().toLocaleLowerCase()
    return [
      ...result.add.map((record, index) => ({ kind: 'add' as const, key: `add-${index}`, record })),
      ...result.modify.map((change, index) => ({
        kind: 'modify' as const,
        key: `modify-${index}`,
        change
      }))
    ].filter((item) => {
      if (filter !== 'all' && item.kind !== filter) return false
      if (!normalizedQuery) return true
      const text =
        item.kind === 'add'
          ? formatValue(item.record)
          : `${identityLabel(item.change.identity)} ${item.change.fields
              .map(
                (field) =>
                  `${field.field} ${formatFieldValue(field.before)} ${formatFieldValue(field.after)}`
              )
              .join(' ')}`
      return text.toLocaleLowerCase().includes(normalizedQuery)
    })
  }, [deferredChangeQuery, filter, result])

  const deleteRecords = useMemo(() => {
    if (!result) return []
    const normalizedQuery = deferredDeleteQuery.trim().toLocaleLowerCase()
    if (!normalizedQuery) return result.delete
    return result.delete.filter((record) =>
      formatValue(record).toLocaleLowerCase().includes(normalizedQuery)
    )
  }, [deferredDeleteQuery, result])

  const changeTotalPages = Math.max(1, Math.ceil(changes.length / pageSize))
  const visibleChanges = changes.slice(
    (Math.min(changePage, changeTotalPages) - 1) * pageSize,
    Math.min(changePage, changeTotalPages) * pageSize
  )
  const deleteTotalPages = Math.max(1, Math.ceil(deleteRecords.length / pageSize))
  const visibleDeletes = deleteRecords.slice(
    (Math.min(deletePage, deleteTotalPages) - 1) * pageSize,
    Math.min(deletePage, deleteTotalPages) * pageSize
  )
  const canCompare = Boolean(
    filename && baseVersion && targetVersion && baseVersion !== targetVersion
  )

  const changeFilename = (nextFilename: string): void => {
    ++requestId.current
    setFilename(nextFilename)
    setResult(null)
    setIsRunning(false)
    setIsSaving(false)
    setError('')
    setNotice('')
    setReplacement(null)
    setChangeQuery('')
    setFilter('all')
    setChangePage(1)
    setDeleteQuery('')
    setDeletePage(1)
  }

  const isCurrentContext = (expected: {
    baseVersion: string
    targetVersion: string
    filename: string
  }): boolean =>
    context.current.baseVersion === expected.baseVersion &&
    context.current.targetVersion === expected.targetVersion &&
    context.current.filename === expected.filename

  const runComparison = async (): Promise<void> => {
    if (!canCompare) return
    const expected = { baseVersion, targetVersion, filename }
    const id = ++requestId.current
    setIsRunning(true)
    setResult(null)
    setError('')
    setNotice('')
    setReplacement(null)
    try {
      const comparison = await window.api.compareRawData({
        baseVersion: expected.baseVersion,
        compareVersion: expected.targetVersion,
        filename: expected.filename
      })
      if (!isMounted.current || requestId.current !== id || !isCurrentContext(expected)) return
      setResult(comparison)
    } catch (caught) {
      if (!isMounted.current || requestId.current !== id || !isCurrentContext(expected)) return
      setError(getErrorMessage(caught))
    } finally {
      if (isMounted.current && requestId.current === id && isCurrentContext(expected))
        setIsRunning(false)
    }
  }

  const openSavedComparison = async (): Promise<void> => {
    if (!canCompare) return
    const expected = { baseVersion, targetVersion, filename }
    const id = ++requestId.current
    setIsRunning(true)
    setError('')
    setNotice('')
    setReplacement(null)
    try {
      const saved = await window.api.openRawDataDiff({
        baseVersion: expected.baseVersion,
        compareVersion: expected.targetVersion,
        filename: expected.filename
      })
      if (!isMounted.current || requestId.current !== id || !isCurrentContext(expected)) return
      if (saved) {
        setResult(saved)
        setNotice('저장된 비교 결과를 열었습니다.')
      } else {
        setResult(null)
        setNotice('저장된 비교 결과가 없습니다.')
      }
    } catch (caught) {
      if (!isMounted.current || requestId.current !== id || !isCurrentContext(expected)) return
      setError(getErrorMessage(caught))
    } finally {
      if (isMounted.current && requestId.current === id && isCurrentContext(expected))
        setIsRunning(false)
    }
  }

  const saveComparison = async (replaceExisting = false): Promise<void> => {
    if (!result || !canCompare) return
    const expected = { baseVersion, targetVersion, filename }
    const id = ++requestId.current
    setIsSaving(true)
    setError('')
    try {
      if (!replaceExisting) {
        const saved = await window.api.openRawDataDiff({
          baseVersion: expected.baseVersion,
          compareVersion: expected.targetVersion,
          filename: expected.filename
        })
        if (!isMounted.current || requestId.current !== id || !isCurrentContext(expected)) return
        if (saved && saved.inputHash !== result.inputHash) {
          setReplacement(result)
          return
        }
      }
      const saved = await window.api.saveRawDataDiff({
        baseVersion: expected.baseVersion,
        compareVersion: expected.targetVersion,
        filename: expected.filename,
        inputHash: result.inputHash,
        ...(replaceExisting ? { replaceExisting: true } : {})
      })
      if (!isMounted.current || requestId.current !== id || !isCurrentContext(expected)) return
      setResult(saved.result)
      setReplacement(null)
      setNotice(
        saved.status === 'created'
          ? '비교 결과를 저장했습니다.'
          : saved.status === 'reused'
            ? '같은 입력의 저장 결과를 사용합니다.'
            : '기존 비교 결과를 교체했습니다.'
      )
    } catch (caught) {
      if (!isMounted.current || requestId.current !== id || !isCurrentContext(expected)) return
      setError(getErrorMessage(caught))
    } finally {
      if (isMounted.current && requestId.current === id && isCurrentContext(expected))
        setIsSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="VERSION DIFF"
        title="버전 비교"
        description="선택한 두 버전의 원본 JSON 추가, 수정, 삭제 데이터를 비교합니다."
      />
      <section className="mb-4 flex flex-wrap items-end justify-center gap-3 rounded-[10px] border border-app-border bg-app-surface p-5 max-md:justify-stretch [&_label]:min-w-[180px]">
        <VersionSelect
          label="비교 기준"
          value={baseVersion}
          versions={versions}
          excludedVersion={targetVersion}
          onChange={changeCompareVersion}
        />
        <div className="grid min-w-[76px] justify-items-center gap-1 pb-2 text-app-accent max-md:hidden">
          <span className="font-mono text-micro tracking-[0.13em] text-app-muted">DIFF</span>
          <ArrowIcon className="h-5 w-5" direction="right" />
        </div>
        <VersionSelect
          label="현재 작업 버전"
          value={targetVersion}
          versions={versions}
          excludedVersion={baseVersion}
          onChange={changeCurrentVersion}
        />
        <label className="grid min-w-[180px] flex-1 gap-1.5">
          <span className="field-label">공통 파일</span>
          <span className="relative">
            <select
              className="h-10 w-full appearance-none rounded-lg border border-app-border-strong bg-app-input px-3 pr-10 font-mono text-xs font-semibold text-app-text outline-none focus:border-app-accent"
              disabled={isLoadingFiles || files.length === 0}
              value={filename}
              onChange={(event) => changeFilename(event.target.value)}
            >
              {files.length === 0 && (
                <option value="">{isLoadingFiles ? '파일 목록 조회 중' : '공통 파일 없음'}</option>
              )}
              {files.map((file) => (
                <option key={file} value={file}>
                  {file}
                </option>
              ))}
            </select>
            <ArrowIcon
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted"
              direction="down"
            />
          </span>
        </label>
        <div className="flex flex-wrap gap-2 max-md:w-full">
          <button
            className="action-secondary"
            disabled={!canCompare || isRunning}
            onClick={() => void openSavedComparison()}
          >
            저장 결과 열기
          </button>
          <button
            className="action-primary"
            disabled={!canCompare || isRunning}
            onClick={() => void runComparison()}
          >
            {isRunning ? '비교 중...' : '비교 실행'}
          </button>
        </div>
      </section>

      {error && (
        <div
          className="mb-4 rounded-md border border-app-danger-border bg-app-danger-bg p-4 text-body text-app-danger"
          role="alert"
        >
          {error}
        </div>
      )}
      {notice && (
        <div
          className="mb-4 rounded-md border border-app-accent-border bg-app-accent-bg p-4 text-body text-app-accent"
          role="status"
        >
          {notice}
        </div>
      )}
      {replacement && (
        <section
          aria-labelledby="replacement-confirmation-title"
          aria-modal="true"
          className="mb-4 rounded-md border border-app-warning-border bg-app-warning-bg p-4"
          role="alertdialog"
        >
          <strong className="text-body" id="replacement-confirmation-title">
            입력 데이터가 달라 기존 저장 결과와 충돌합니다.
          </strong>
          <p className="mt-1 text-small text-app-muted">
            기존 결과를 이 비교 결과로 교체할지 확인하세요.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="action-secondary"
              disabled={isSaving}
              onClick={() => setReplacement(null)}
            >
              취소
            </button>
            <button
              className="action-primary"
              disabled={isSaving}
              onClick={() => void saveComparison(true)}
            >
              기존 결과 교체
            </button>
          </div>
        </section>
      )}

      {!result && !isLoadingFiles && !isRunning && !error && (
        <section className="rounded-[9px] border border-dashed border-app-border bg-app-surface p-8 text-center">
          <strong className="block text-body">
            {files.length === 0 && baseVersion && targetVersion && baseVersion !== targetVersion
              ? '두 버전에 공통으로 비교할 JSON 파일이 없습니다.'
              : '비교할 공통 파일을 선택하세요.'}
          </strong>
          <p className="mt-2 text-small text-app-muted">
            {files.length === 0 && baseVersion && targetVersion && baseVersion !== targetVersion
              ? '두 버전에 같은 관리 JSON 파일이 있는지 확인하세요.'
              : '버전이나 파일을 바꾸면 이전 비교 결과는 표시하지 않습니다.'}
          </p>
        </section>
      )}

      {result &&
        result.baseVersion === baseVersion &&
        result.compareVersion === targetVersion &&
        result.filename === filename && (
          <div className="grid gap-4">
            <section className="rounded-[9px] border border-app-border bg-app-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="page-eyebrow">{result.filename}</span>
                  <h2 className="section-title mt-2 inline-flex items-center gap-2">
                    <span>{result.baseVersion}</span>
                    <ArrowIcon className="h-4 w-4 text-app-accent" direction="right" />
                    <span>{result.compareVersion}</span>
                  </h2>
                </div>
                <button
                  className="action-primary"
                  disabled={isSaving || replacement !== null}
                  onClick={() => void saveComparison()}
                >
                  {isSaving ? '저장 중...' : '비교 결과 저장'}
                </button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
                <Summary label="추가" value={result.add.length} tone="text-app-accent" />
                <Summary label="수정" value={result.modify.length} tone="text-app-warning" />
                <Summary label="삭제" value={result.delete.length} tone="text-app-danger" />
              </div>
            </section>

            <section className="rounded-[9px] border border-app-border bg-app-surface p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="section-title">추가 · 수정</h2>
                  <p className="section-description">
                    추가 레코드와 필드별 변경 내용을 검토합니다.
                  </p>
                </div>
                <label className="grid gap-1 text-caption text-app-muted">
                  검색
                  <input
                    className="h-9 min-w-52 rounded border border-app-border bg-app-input px-2 text-small text-app-text outline-none focus:border-app-accent"
                    value={changeQuery}
                    onChange={(event) => {
                      setChangeQuery(event.target.value)
                      setChangePage(1)
                    }}
                    placeholder="값 또는 필드 검색"
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(
                  [
                    ['all', '전체'],
                    ['add', '추가'],
                    ['modify', '수정']
                  ] as const
                ).map(([value, label]) => (
                  <button
                    className={filter === value ? 'action-primary' : 'action-secondary'}
                    key={value}
                    onClick={() => {
                      setFilter(value)
                      setChangePage(1)
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {visibleChanges.length === 0 ? (
                <p className="mt-4 rounded-md bg-app-input p-4 text-small text-app-muted">
                  조건에 맞는 추가·수정 항목이 없습니다.
                </p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {visibleChanges.map((item) =>
                    item.kind === 'add' ? (
                      <RecordCard
                        key={item.key}
                        title="추가"
                        record={item.record}
                        tone="text-app-accent"
                      />
                    ) : (
                      <ModifyCard
                        key={item.key}
                        identity={item.change.identity}
                        fields={item.change.fields}
                      />
                    )
                  )}
                </div>
              )}
              {changes.length > pageSize && (
                <div className="mt-4 flex items-center justify-between gap-3 text-small">
                  <span className="text-app-muted">
                    {Math.min(changePage, changeTotalPages)} / {changeTotalPages} 페이지 ·{' '}
                    {changes.length}건
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="action-secondary"
                      disabled={changePage <= 1}
                      onClick={() => setChangePage((value) => value - 1)}
                    >
                      이전
                    </button>
                    <button
                      className="action-secondary"
                      disabled={changePage >= changeTotalPages}
                      onClick={() => setChangePage((value) => value + 1)}
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-[9px] border border-app-danger-border bg-app-surface p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="section-title">삭제</h2>
                  <p className="section-description">
                    기준 버전에는 있고 현재 작업 버전에서는 삭제된 레코드를 검토합니다.
                  </p>
                </div>
                <label className="grid gap-1 text-caption text-app-muted">
                  검색
                  <input
                    className="h-9 min-w-52 rounded border border-app-border bg-app-input px-2 text-small text-app-text outline-none focus:border-app-accent"
                    value={deleteQuery}
                    onChange={(event) => {
                      setDeleteQuery(event.target.value)
                      setDeletePage(1)
                    }}
                    placeholder="값 검색"
                  />
                </label>
              </div>
              {visibleDeletes.length === 0 ? (
                <p className="mt-4 rounded-md bg-app-input p-4 text-small text-app-muted">
                  {result.delete.length === 0
                    ? '삭제 항목이 없습니다.'
                    : '조건에 맞는 삭제 항목이 없습니다.'}
                </p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {visibleDeletes.map((record, index) => (
                    <RecordCard
                      key={`delete-${(Math.min(deletePage, deleteTotalPages) - 1) * pageSize + index}`}
                      title="삭제"
                      record={record}
                      tone="text-app-danger"
                    />
                  ))}
                </div>
              )}
              {deleteRecords.length > pageSize && (
                <div className="mt-4 flex items-center justify-between gap-3 text-small">
                  <span className="text-app-muted">
                    {Math.min(deletePage, deleteTotalPages)} / {deleteTotalPages} 페이지 ·{' '}
                    {deleteRecords.length}건
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="action-secondary"
                      disabled={deletePage <= 1}
                      onClick={() => setDeletePage((value) => value - 1)}
                    >
                      이전
                    </button>
                    <button
                      className="action-secondary"
                      disabled={deletePage >= deleteTotalPages}
                      onClick={() => setDeletePage((value) => value + 1)}
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
    </>
  )
}

function Summary({
  label,
  value,
  tone
}: {
  label: string
  value: number
  tone: string
}): React.JSX.Element {
  return (
    <div className="rounded-md border border-app-border bg-app-input p-4">
      <span className="block text-small text-app-muted">{label}</span>
      <strong className={`mt-1 block text-[24px] ${tone}`}>{value.toLocaleString('ko-KR')}</strong>
    </div>
  )
}

function RecordCard({
  title,
  record,
  tone
}: {
  title: string
  record: RawRecord
  tone: string
}): React.JSX.Element {
  return (
    <article className="rounded-md border border-app-border bg-app-input p-4">
      <strong className={`text-small ${tone}`}>{title}</strong>
      <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-all font-mono text-caption text-app-text">
        {formatValue(record)}
      </pre>
    </article>
  )
}

function ModifyCard({
  identity,
  fields
}: {
  identity: Record<string, string>
  fields: readonly { field: string; before: FieldValue; after: FieldValue }[]
}): React.JSX.Element {
  return (
    <article className="rounded-md border border-app-warning-border bg-app-input p-4">
      <strong className="text-small text-app-warning">수정 · {identityLabel(identity)}</strong>
      <div className="mt-3 grid gap-3">
        {fields.map((change) => (
          <div className="rounded border border-app-border bg-app-surface p-3" key={change.field}>
            <strong className="block font-mono text-caption text-app-text">{change.field}</strong>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <ValueCell label="이전" value={change.before} />
              <ValueCell label="이후" value={change.after} />
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

function formatFieldValue(value: FieldValue): string {
  return value.kind === 'absent' ? '필드 없음' : formatValue(value.value)
}

function ValueCell({ label, value }: { label: string; value: FieldValue }): React.JSX.Element {
  return (
    <div>
      <span className="block text-caption text-app-muted">{label}</span>
      <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-all rounded bg-app-input p-2 font-mono text-caption text-app-text">
        {formatFieldValue(value)}
      </pre>
    </div>
  )
}
