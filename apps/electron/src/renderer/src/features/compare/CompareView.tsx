import { useEffect, useRef, useState } from 'react'

import type { RawDataComparison } from '../../../../shared/raw-data-diff'
import { VersionSelect } from '../../components/ui/VersionSelect'
import type { VersionContextValue } from '../version/model'

import { CompareDetailView } from './CompareDetailView'
import {
  compareAndSaveRawDataFile,
  comparisonCounts,
  comparisonFiles,
  getCompareErrorMessage,
  isStaleInputHashError,
  type ComparisonFilename,
  type ResultCategory
} from './CompareResultModel'

type FileStatus = 'idle' | 'queued' | 'running' | 'saved' | 'conflict' | 'error'
type RetryKind = 'open' | 'compare' | null

type FileState = {
  status: FileStatus
  result: RawDataComparison | null
  replacement: RawDataComparison | null
  error: string
  notice: string
  contextKey: string
  retryKind: RetryKind
}

function beginStoredResultOpen(state: FileState, contextKey: string): FileState {
  return {
    ...state,
    status: state.replacement ? 'conflict' : state.status,
    result: state.replacement ? state.result : null,
    error: '',
    notice: '저장 결과를 여는 중입니다.',
    contextKey,
    retryKind: null
  }
}

function finishStoredResultOpen(
  state: FileState,
  saved: RawDataComparison | null,
  contextKey: string
): FileState {
  if (state.replacement) {
    return {
      ...state,
      status: 'conflict',
      result: saved,
      error: '',
      notice: '기존 저장 결과와 입력이 다릅니다. 이 파일의 교체를 확인하세요.',
      contextKey,
      retryKind: null
    }
  }

  return {
    ...state,
    status: saved ? 'saved' : 'idle',
    result: saved,
    replacement: null,
    error: '',
    notice: '',
    contextKey,
    retryKind: null
  }
}

function failStoredResultOpen(state: FileState, error: string, contextKey: string): FileState {
  if (state.replacement) {
    return {
      ...state,
      status: 'conflict',
      error,
      notice: '',
      contextKey,
      retryKind: 'open'
    }
  }

  return {
    ...state,
    status: 'error',
    result: null,
    replacement: null,
    error,
    notice: '',
    contextKey,
    retryKind: 'open'
  }
}

type CompareViewProps = Pick<
  VersionContextValue,
  'versions' | 'currentVersion' | 'compareVersion' | 'changeCompareVersion'
>

const emptyFileState = (): FileState => ({
  status: 'idle',
  result: null,
  replacement: null,
  error: '',
  notice: '',
  contextKey: '',
  retryKind: null
})

const emptyFiles = (): Record<ComparisonFilename, FileState> =>
  Object.fromEntries(comparisonFiles.map((filename) => [filename, emptyFileState()])) as Record<
    ComparisonFilename,
    FileState
  >

function makeSelectionKey(baseVersion: string, targetVersion: string, filename: string): string {
  return baseVersion && targetVersion && filename
    ? `${baseVersion}\u0000${targetVersion}\u0000${filename}`
    : ''
}

function CompareViewComponent({
  versions,
  currentVersion,
  compareVersion,
  changeCompareVersion
}: CompareViewProps): React.JSX.Element {
  const baseVersion = compareVersion
  const targetVersion = currentVersion
  const [selectedFile, setSelectedFile] = useState<ComparisonFilename | ''>('')
  const [category, setCategory] = useState<ResultCategory>('all')
  const [fileStates, setFileStates] = useState(emptyFiles)
  const [displayedSelectionKey, setDisplayedSelectionKey] = useState('')
  const [isOpening, setIsOpening] = useState(false)
  const [openRequest, setOpenRequest] = useState(0)
  const operationId = useRef(0)
  const loadId = useRef(0)
  const replacingFiles = useRef(new Set<ComparisonFilename>())
  const context = useRef({ baseVersion, targetVersion })
  const selection = useRef('')
  const batchRunning = useRef(false)
  context.current = { baseVersion, targetVersion }

  const canCompare = Boolean(baseVersion && targetVersion && baseVersion !== targetVersion)
  const selectionKey = canCompare ? makeSelectionKey(baseVersion, targetVersion, selectedFile) : ''
  selection.current = selectionKey

  const isBatchRunning = Object.values(fileStates).some(
    ({ status }) => status === 'queued' || status === 'running'
  )
  batchRunning.current = isBatchRunning

  useEffect(() => {
    ++operationId.current
    ++loadId.current
    setFileStates(emptyFiles())
    setCategory('all')
    setDisplayedSelectionKey('')
    setIsOpening(false)
  }, [baseVersion, targetVersion])

  const updateFile = (
    filename: ComparisonFilename,
    update: Partial<FileState> | ((state: FileState) => FileState)
  ): void => {
    setFileStates((states) => ({
      ...states,
      [filename]:
        typeof update === 'function' ? update(states[filename]) : { ...states[filename], ...update }
    }))
  }

  useEffect(() => {
    if (!selectionKey || !selectedFile || batchRunning.current) return

    const id = ++loadId.current
    const filename = selectedFile
    const request = { baseVersion, compareVersion: targetVersion, filename }
    setIsOpening(true)
    updateFile(filename, (state) => beginStoredResultOpen(state, selectionKey))

    void window.api
      .openRawDataDiff(request)
      .then((saved) => {
        if (loadId.current !== id || selection.current !== selectionKey) return
        updateFile(filename, (state) => finishStoredResultOpen(state, saved, selectionKey))
        setDisplayedSelectionKey(selectionKey)
        setIsOpening(false)
      })
      .catch((caught: unknown) => {
        if (loadId.current !== id || selection.current !== selectionKey) return
        updateFile(filename, (state) =>
          failStoredResultOpen(state, getCompareErrorMessage(caught), selectionKey)
        )
        setDisplayedSelectionKey(selectionKey)
        setIsOpening(false)
      })
  }, [baseVersion, openRequest, selectedFile, selectionKey, targetVersion])

  const isCurrentOperation = (id: number, base: string, target: string): boolean =>
    operationId.current === id &&
    context.current.baseVersion === base &&
    context.current.targetVersion === target

  const revealCurrentResult = (filename: ComparisonFilename, key: string): void => {
    if (selection.current === key && key.endsWith(`\u0000${filename}`)) {
      setDisplayedSelectionKey(key)
      setIsOpening(false)
    }
  }

  const runFileComparison = async (
    filename: ComparisonFilename,
    id: number,
    base: string,
    target: string
  ): Promise<void> => {
    const key = makeSelectionKey(base, target, filename)
    const isCurrent = (): boolean => isCurrentOperation(id, base, target)
    updateFile(filename, {
      status: 'running',
      result: null,
      replacement: null,
      error: '',
      notice: '비교 후 저장 중입니다.',
      contextKey: key,
      retryKind: null
    })
    const outcome = await compareAndSaveRawDataFile(
      window.api,
      { baseVersion: base, compareVersion: target, filename },
      isCurrent
    )
    if (!outcome || !isCurrent()) return

    if (outcome.kind === 'conflict') {
      updateFile(filename, {
        status: 'conflict',
        result: outcome.result,
        replacement: outcome.result,
        error: '',
        notice: '기존 저장 결과와 입력이 다릅니다. 이 파일의 교체를 확인하세요.',
        contextKey: key,
        retryKind: null
      })
      revealCurrentResult(filename, key)
      return
    }
    if (outcome.kind === 'error') {
      updateFile(filename, {
        status: 'error',
        result: isStaleInputHashError(outcome.error) ? null : outcome.result,
        replacement: null,
        error: getCompareErrorMessage(outcome.error),
        notice: '',
        contextKey: key,
        retryKind: 'compare'
      })
      revealCurrentResult(filename, key)
      return
    }
    updateFile(filename, {
      status: 'saved',
      result: outcome.result,
      replacement: null,
      error: '',
      notice: outcome.reused
        ? '같은 입력의 저장 결과를 재사용했습니다.'
        : '비교 결과를 저장했습니다.',
      contextKey: key,
      retryKind: null
    })
    revealCurrentResult(filename, key)
  }

  const runAllComparisons = async (): Promise<void> => {
    if (!canCompare || isBatchRunning) return
    ++loadId.current
    setIsOpening(false)
    setDisplayedSelectionKey('')
    const id = ++operationId.current
    const base = baseVersion
    const target = targetVersion
    setFileStates(
      Object.fromEntries(
        comparisonFiles.map((filename) => [
          filename,
          {
            ...emptyFileState(),
            status: 'queued' as const,
            contextKey: makeSelectionKey(base, target, filename)
          }
        ])
      ) as Record<ComparisonFilename, FileState>
    )

    for (const filename of comparisonFiles) {
      if (!isCurrentOperation(id, base, target)) return
      await runFileComparison(filename, id, base, target)
    }
  }

  const retryFile = async (filename: ComparisonFilename): Promise<void> => {
    if (!canCompare || isBatchRunning) return
    if (fileStates[filename].retryKind === 'open') {
      if (selectedFile !== filename) {
        ++loadId.current
        setDisplayedSelectionKey('')
        setCategory('all')
        setSelectedFile(filename)
      } else {
        setOpenRequest((value) => value + 1)
      }
      return
    }

    ++loadId.current
    if (selectedFile === filename) {
      setDisplayedSelectionKey('')
      setIsOpening(false)
    }
    const id = ++operationId.current
    await runFileComparison(filename, id, baseVersion, targetVersion)
  }

  const replaceFile = async (filename: ComparisonFilename): Promise<void> => {
    const replacement = fileStates[filename].replacement
    if (!replacement || !canCompare || replacingFiles.current.has(filename)) return
    replacingFiles.current.add(filename)
    ++loadId.current
    const id = ++operationId.current
    const base = baseVersion
    const target = targetVersion
    const key = makeSelectionKey(base, target, filename)
    updateFile(filename, {
      status: 'running',
      error: '',
      notice: '기존 결과를 교체 중입니다.',
      retryKind: null
    })
    try {
      const saved = await window.api.saveRawDataDiff({
        baseVersion: base,
        compareVersion: target,
        filename,
        inputHash: replacement.inputHash,
        replaceExisting: true
      })
      if (!isCurrentOperation(id, base, target)) return
      updateFile(filename, {
        status: 'saved',
        result: saved.result,
        replacement: null,
        error: '',
        notice: '기존 비교 결과를 교체했습니다.',
        contextKey: key,
        retryKind: null
      })
      revealCurrentResult(filename, key)
    } catch (caught) {
      if (!isCurrentOperation(id, base, target)) return
      updateFile(filename, {
        status: 'conflict',
        result: isStaleInputHashError(caught) ? null : replacement,
        replacement,
        error: getCompareErrorMessage(caught),
        notice: '',
        contextKey: key,
        retryKind: null
      })
      revealCurrentResult(filename, key)
    } finally {
      replacingFiles.current.delete(filename)
    }
  }

  const selectedState = selectedFile ? fileStates[selectedFile] : emptyFileState()
  const isVisibleContext =
    Boolean(selectionKey) &&
    displayedSelectionKey === selectionKey &&
    selectedState.contextKey === selectionKey
  const visibleResult = isVisibleContext ? selectedState.result : null
  const counts = comparisonCounts(visibleResult)
  const visibleError = isVisibleContext ? selectedState.error : ''
  const visibleNotice = isVisibleContext ? selectedState.notice : ''
  const exceptionalFiles = comparisonFiles.filter(
    (filename) => fileStates[filename].error || fileStates[filename].replacement
  )

  return (
    <div className="grid min-w-0 divide-y divide-app-border border-y border-app-border bg-app-surface xl:h-full xl:min-h-0 xl:grid-cols-[290px_minmax(0,1fr)_230px] xl:divide-y-0 xl:overflow-hidden">
      <aside className="flex min-w-0 flex-col gap-5 p-4 xl:h-full xl:min-h-0 xl:overflow-y-auto">
        <div>
          <h1 className="section-title">비교</h1>
        </div>

        <VersionSelect
          label="비교 버전"
          value={baseVersion}
          versions={versions}
          excludedVersion={targetVersion}
          onChange={changeCompareVersion}
        />

        <button
          className="action-primary w-full"
          disabled={!canCompare || isBatchRunning}
          onClick={() => void runAllComparisons()}
        >
          {isBatchRunning ? '비교·저장 진행 중' : '5개 파일 비교·저장'}
        </button>

        <div className="border-t border-app-border pt-5">
          <label className="grid gap-1.5">
            <span className="field-label">파일 선택</span>
            <select
              className="h-10 w-full rounded-lg border border-app-border-strong bg-app-input px-3 font-mono text-xs font-semibold text-app-text outline-none focus:border-app-accent"
              value={selectedFile}
              onChange={(event) => {
                const filename = event.target.value as ComparisonFilename
                const key = makeSelectionKey(baseVersion, targetVersion, filename)
                const state = fileStates[filename]
                ++loadId.current
                setIsOpening(false)
                setDisplayedSelectionKey(
                  isBatchRunning && state.contextKey === key && state.result ? key : ''
                )
                setCategory('all')
                setSelectedFile(filename)
              }}
            >
              <option value="" disabled>
                파일 선택
              </option>
              {comparisonFiles.map((filename) => (
                <option key={filename} value={filename}>
                  {filename}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="border-t border-app-border pt-5">
          <h2 className="field-label mb-2">변경 유형</h2>
          <div className="grid gap-1.5" aria-label="변경 유형">
            {(
              [
                ['all', '전체'],
                ['add', '추가'],
                ['modify', '수정'],
                ['delete', '삭제']
              ] as const
            ).map(([value, label]) => (
              <button
                className={`flex min-h-10 items-center justify-between rounded-md border px-3 text-left text-small ${
                  category === value
                    ? 'border-app-accent bg-app-accent-bg text-app-text'
                    : 'border-app-border bg-app-input text-app-muted'
                }`}
                aria-pressed={category === value}
                key={value}
                onClick={() => setCategory(value)}
              >
                <span>{label}</span>
                <strong className="tabular-nums">{counts[value].toLocaleString('ko-KR')}</strong>
              </button>
            ))}
          </div>
        </div>

        {exceptionalFiles.length > 0 && (
          <div className="grid gap-2 border-t border-app-border pt-5" aria-label="파일별 조치">
            {exceptionalFiles.map((filename) => {
              const state = fileStates[filename]
              return (
                <div className="grid gap-2 rounded-md border border-app-border p-3" key={filename}>
                  <strong className="break-all font-mono text-caption text-app-text">
                    {filename}
                  </strong>
                  {state.error && (
                    <p className="break-words text-micro leading-4 text-app-danger" role="alert">
                      {state.error}
                    </p>
                  )}
                  {state.error && (
                    <button
                      className="action-secondary min-h-8 w-full px-2 text-caption"
                      disabled={isBatchRunning}
                      onClick={() => void retryFile(filename)}
                    >
                      다시 시도
                    </button>
                  )}
                  {state.replacement && (
                    <>
                      <span className="text-micro text-app-warning">파일별 교체 확인 필요</span>
                      {state.status === 'running' ? (
                        <span className="text-caption text-app-muted" role="status">
                          기존 결과를 교체 중입니다.
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            className="action-secondary min-h-8 flex-1 px-2 text-caption"
                            onClick={() =>
                              updateFile(filename, {
                                status: 'idle',
                                replacement: null,
                                notice: '교체를 취소했습니다.'
                              })
                            }
                          >
                            취소
                          </button>
                          <button
                            className="action-primary min-h-8 flex-1 px-2 text-caption"
                            disabled={isBatchRunning}
                            onClick={() => void replaceFile(filename)}
                          >
                            이 파일 교체
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </aside>

      <CompareDetailView
        selectionKey={selectionKey}
        result={visibleResult}
        category={category}
        isBusy={
          isOpening || selectedState.status === 'running' || selectedState.status === 'queued'
        }
        error={visibleError}
        notice={visibleNotice}
      />

      <aside className="min-w-0 border-x border-app-border-strong p-4 xl:h-full xl:min-h-0 xl:overflow-y-auto">
        <h2 className="section-title">필터</h2>
      </aside>
    </div>
  )
}

export const CompareView = Object.assign(CompareViewComponent, {
  beginStoredResultOpen,
  finishStoredResultOpen,
  failStoredResultOpen
})
