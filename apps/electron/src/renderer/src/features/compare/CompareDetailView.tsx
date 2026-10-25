import { useDeferredValue, useEffect, useMemo, useState } from 'react'

import type { RawDataComparison } from '../../../../shared/raw-data-diff'

import { ResultCard } from './CompareResult'
import { filterResultItems, type ResultCategory } from './CompareResultModel'

const pageSize = 10

type CompareDetailViewProps = {
  result: RawDataComparison | null
  category: ResultCategory
  selectionKey: string
  isBusy: boolean
  error: string
  notice: string
}

export function CompareDetailView({
  result,
  category,
  selectionKey,
  isBusy,
  error,
  notice
}: CompareDetailViewProps): React.JSX.Element {
  const [queryState, setQueryState] = useState({ selectionKey, query: '' })
  const [page, setPage] = useState(1)
  const query = queryState.selectionKey === selectionKey ? queryState.query : ''
  const deferredQueryState = useDeferredValue(queryState)
  const deferredQuery =
    deferredQueryState.selectionKey === selectionKey ? deferredQueryState.query : ''
  const resultContext = result
    ? `${result.baseVersion}\u0000${result.compareVersion}\u0000${result.filename}\u0000${result.inputHash}`
    : ''

  useEffect(() => {
    setQueryState({ selectionKey, query: '' })
    setPage(1)
  }, [selectionKey])

  useEffect(() => {
    setPage(1)
  }, [category, deferredQuery, resultContext])

  const items = useMemo(
    () => (result ? filterResultItems(result, category, deferredQuery) : []),
    [category, deferredQuery, result]
  )
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const selectedPage = queryState.selectionKey === selectionKey ? page : 1
  const currentPage = Math.min(selectedPage, totalPages)
  const visibleItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <section className="flex min-h-[420px] min-w-0 flex-col overflow-hidden border-x border-app-border bg-app-surface xl:h-full xl:min-h-0">
      <div className="z-10 shrink-0 border-b border-app-border bg-app-surface p-4">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
          <label className="grid min-w-0 flex-1 gap-1 text-caption text-app-muted">
            결과 검색
            <input
              className="h-9 min-w-0 rounded border border-app-border bg-app-input px-2 text-small text-app-text outline-none focus:border-app-accent"
              value={query}
              onChange={(event) => {
                setQueryState({ selectionKey, query: event.target.value })
                setPage(1)
              }}
              placeholder="식별자, 변경·미변경 필드 또는 값 검색"
            />
          </label>
          <div className="flex shrink-0 flex-wrap items-center gap-2 text-small">
            <button
              className="action-secondary"
              disabled={currentPage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              이전
            </button>
            <span className="whitespace-nowrap text-app-muted" aria-live="polite">
              {currentPage} / {totalPages} 페이지 · {items.length.toLocaleString('ko-KR')}건
            </span>
            <button
              className="action-secondary"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              다음
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4" aria-busy={isBusy}>
        {error && (
          <div
            className="border border-app-danger-border bg-app-danger-bg p-4 text-body text-app-danger"
            role="alert"
          >
            {error}
          </div>
        )}
        {notice && !error && (
          <div
            className="border border-app-accent-border bg-app-accent-bg p-4 text-body text-app-accent"
            role="status"
          >
            {notice}
          </div>
        )}
        {isBusy ? (
          <p className="mt-4 bg-app-input p-4 text-small text-app-muted" role="status">
            이 파일을 처리하고 있습니다.
          </p>
        ) : !result ? (
          <p className="py-6 text-center text-small text-app-muted">표시할 비교 결과가 없습니다.</p>
        ) : visibleItems.length === 0 ? (
          <p className="bg-app-input p-4 text-small text-app-muted">
            {result.add.length + result.modify.length + result.delete.length === 0
              ? '이 파일에는 변경된 레코드가 없습니다.'
              : '현재 변경 유형과 검색 조건에 맞는 항목이 없습니다.'}
          </p>
        ) : (
          <div className="grid min-w-0 gap-3">
            {visibleItems.map((item) => (
              <ResultCard item={item} key={item.key} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
