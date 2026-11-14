import { Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import type {
  JobDataSnapshot,
  JobDraftRecoveryPreview,
  JobSummary
} from '../../../../shared/job-data'
import { useWorkspace } from '../../app/WorkspaceContext'
import { getErrorMessage } from '../../shared/lib/error-message'

type JobApi = typeof window.api & {
  listJobData: (version: string) => Promise<JobDataSnapshot>
}

type EditorEntry = JobSummary & {
  classKey?: string
  englishName?: string
  revision?: number
}

type RecoveryCopyStatus =
  | { state: 'pending' }
  | { state: 'success'; changeSetId: string; recordId: string; revision: number }
  | { state: 'error'; message: string }

function editorEntries(snapshot: JobDataSnapshot): {
  representatives: EditorEntry[]
  fallback: EditorEntry[]
} {
  const representativeIds = new Set(
    snapshot.jobGroups.map(({ representativeJobId }) => representativeJobId)
  )
  const groupedIds = new Set(
    snapshot.jobGroups.flatMap(({ advancements }) => advancements.map(({ jobId }) => jobId))
  )
  const representatives = snapshot.jobGroups.map((group) => {
    const draft = snapshot.drafts.find(({ jobId }) => jobId === group.representativeJobId)
    return {
      jobId: group.representativeJobId,
      jobName: group.representativeName,
      classKey: group.classKey,
      englishName: draft?.englishName,
      revision: draft?.revision
    }
  })
  const fallback = new Map<string, EditorEntry>()

  for (const job of snapshot.jobs) {
    if (!representativeIds.has(job.jobId) && !groupedIds.has(job.jobId)) {
      fallback.set(job.jobId, job)
    }
  }
  for (const draft of snapshot.drafts) {
    if (!representativeIds.has(draft.jobId)) {
      fallback.set(draft.jobId, {
        jobId: draft.jobId,
        jobName: snapshot.jobs.find(({ jobId }) => jobId === draft.jobId)?.jobName ?? draft.jobName,
        englishName: draft.englishName,
        revision: draft.revision
      })
    }
  }

  return {
    representatives,
    fallback: [...fallback.values()].sort((left, right) => left.jobId.localeCompare(right.jobId))
  }
}

function matchesQuery(entry: EditorEntry, query: string): boolean {
  return (
    !query ||
    entry.jobId.toLocaleLowerCase().includes(query) ||
    entry.jobName.toLocaleLowerCase().includes(query) ||
    entry.classKey?.toLocaleLowerCase().includes(query) === true
  )
}

function recoveryCopyErrorMessage(error: unknown): string {
  const message = getErrorMessage(error)
  if (message.includes('source does not match request')) {
    return '복구 원본이 미리보기 이후 변경되었습니다. 미리보기를 새로고침한 뒤 다시 확인하세요.'
  }
  if (message.toLocaleLowerCase().includes('validation workspace')) {
    return 'Phase 4 작업본을 만들 수 없습니다. 현재 버전의 검증 작업본이 ready 상태인지 확인한 뒤 미리보기를 새로고침하세요.'
  }
  return `${message} 미리보기를 새로고침해 원본과 작업본 상태를 확인하세요.`
}

function RecoveryWeaponValues({
  values,
  blockedKeys
}: {
  values: string[]
  blockedKeys: string[]
}): React.JSX.Element {
  if (values.length === 0) return <>(없음)</>
  return (
    <>
      {values.map((key, index) => (
        <span key={key}>
          {index > 0 && ', '}
          <code className="break-all">{key}</code>
          {blockedKeys.includes(key) && (
            <strong className="ml-1 text-app-danger">(복사 불가)</strong>
          )}
        </span>
      ))}
    </>
  )
}

function RecoveryCopyFeedback({
  status,
  onRefresh,
  refreshDisabled
}: {
  status: RecoveryCopyStatus | undefined
  onRefresh: () => void
  refreshDisabled: boolean
}): React.JSX.Element | null {
  if (status?.state === 'success') {
    return (
      <div
        className="mt-3 min-w-0 rounded-md border border-app-accent-border bg-app-accent-bg p-3 text-small text-app-accent"
        role="status"
      >
        <p className="m-0 font-semibold">선택 직업을 복사했습니다.</p>
        <p className="mt-1 mb-0 break-all">
          changeSetId <code>{status.changeSetId}</code> · recordId <code>{status.recordId}</code> ·
          revision <code>{status.revision}</code>
        </p>
      </div>
    )
  }
  if (status?.state === 'error') {
    return (
      <div
        className="mt-3 rounded-md border border-app-danger-border bg-app-danger-bg p-3 text-small text-app-danger"
        role="alert"
      >
        <p className="m-0 break-words">{status.message}</p>
        <button
          className="mt-2 rounded-md border border-app-danger-border px-3 py-1.5 font-semibold"
          type="button"
          disabled={refreshDisabled}
          onClick={onRefresh}
        >
          미리보기 새로고침
        </button>
      </div>
    )
  }
  return null
}

function JobButton({ job, disabled }: { job: EditorEntry; disabled: boolean }): React.JSX.Element {
  const navigate = useNavigate()
  return (
    <button
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-app-border bg-app-surface px-4 py-3 text-left hover:border-app-accent hover:bg-app-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      title={disabled ? '현재 버전의 편집 작업본을 사용할 수 없습니다' : undefined}
      type="button"
      onClick={() => navigate(`/class/edit/${encodeURIComponent(job.jobId)}`)}
    >
      <span className="grid gap-1">
        <strong className="text-body text-app-text">{job.jobName}</strong>
        {job.classKey && <span className="text-caption text-app-muted">{job.classKey}</span>}
      </span>
      <span className="grid justify-items-end gap-1 font-mono text-small text-app-muted">
        <span>{job.jobId}</span>
        {job.englishName && (
          <span className="font-sans text-caption">
            {job.englishName} · revision {job.revision}
          </span>
        )}
      </span>
    </button>
  )
}

export function JobEditorIndex(): React.JSX.Element {
  const { version } = useWorkspace()
  const [snapshot, setSnapshot] = useState<JobDataSnapshot | null>(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [recoveryOpen, setRecoveryOpen] = useState(false)
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  )
  const [recoveryPreview, setRecoveryPreview] = useState<JobDraftRecoveryPreview | null>(null)
  const [recoveryError, setRecoveryError] = useState('')
  const [recoveryCopyStatuses, setRecoveryCopyStatuses] = useState<
    Record<string, RecoveryCopyStatus>
  >({})
  const recoveryRequestId = useRef(0)
  const recoveryCopyGeneration = useRef(0)
  const pendingRecoveryCopies = useRef(new Set<string>())
  const currentVersion = useRef(version.currentVersion)
  currentVersion.current = version.currentVersion

  useEffect(() => {
    let active = true
    setSnapshot(null)
    setError('')
    recoveryRequestId.current += 1
    recoveryCopyGeneration.current += 1
    pendingRecoveryCopies.current.clear()
    setRecoveryOpen(false)
    setRecoveryStatus('idle')
    setRecoveryPreview(null)
    setRecoveryError('')
    setRecoveryCopyStatuses({})
    void (window.api as JobApi)
      .listJobData(version.currentVersion)
      .then((next) => {
        if (active) setSnapshot(next)
      })
      .catch((caught: unknown) => {
        if (active) setError(getErrorMessage(caught))
      })
    return () => {
      active = false
    }
  }, [version.currentVersion])

  const loadRecoveryPreview = (): void => {
    recoveryCopyGeneration.current += 1
    pendingRecoveryCopies.current.clear()
    setRecoveryCopyStatuses({})
    const requestedVersion = version.currentVersion
    const requestId = ++recoveryRequestId.current
    setRecoveryStatus('loading')
    setRecoveryError('')

    void window.api
      .previewJobDraftRecovery(requestedVersion)
      .then((preview) => {
        if (requestId !== recoveryRequestId.current || requestedVersion !== currentVersion.current)
          return
        setRecoveryPreview(preview)
        setRecoveryStatus('success')
      })
      .catch((caught: unknown) => {
        if (requestId !== recoveryRequestId.current || requestedVersion !== currentVersion.current)
          return
        setRecoveryPreview(null)
        setRecoveryError(getErrorMessage(caught))
        setRecoveryStatus('error')
      })
  }

  const copySelectedRecovery = (jobId: string, recoveryId: string, sourceSha256: string): void => {
    if (pendingRecoveryCopies.current.has(jobId)) return
    const confirmed = window.confirm(
      '이 직업의 메타데이터만 Phase 4 편집 작업본의 불변 revision 1로 복사합니다. 제외된 jobName, newWeaponTypes, advancementJobIds는 원본에 남고 적용되지 않습니다. 에디터는 복사 후 편집 작업본만 읽고 저장하며 DB publish는 실행하지 않습니다. 계속할까요?'
    )
    if (!confirmed || pendingRecoveryCopies.current.has(jobId)) return

    const requestedVersion = version.currentVersion
    const generation = recoveryCopyGeneration.current
    pendingRecoveryCopies.current.add(jobId)
    setRecoveryCopyStatuses((statuses) => ({
      ...statuses,
      [jobId]: { state: 'pending' }
    }))

    void window.api
      .copySelectedJobDraftRecovery({
        version: requestedVersion,
        recoveryId,
        sourceSha256,
        jobId
      })
      .then(async (result) => {
        if (
          generation !== recoveryCopyGeneration.current ||
          requestedVersion !== currentVersion.current
        )
          return
        const next = await (window.api as JobApi).listJobData(requestedVersion)
        if (
          generation !== recoveryCopyGeneration.current ||
          requestedVersion !== currentVersion.current
        )
          return
        setSnapshot(next)
        setRecoveryCopyStatuses((statuses) => ({
          ...statuses,
          [jobId]: { state: 'success', ...result }
        }))
      })
      .catch((caught: unknown) => {
        if (
          generation !== recoveryCopyGeneration.current ||
          requestedVersion !== currentVersion.current
        )
          return
        setRecoveryCopyStatuses((statuses) => ({
          ...statuses,
          [jobId]: { state: 'error', message: recoveryCopyErrorMessage(caught) }
        }))
      })
      .finally(() => {
        if (generation === recoveryCopyGeneration.current) {
          pendingRecoveryCopies.current.delete(jobId)
        }
      })
  }

  const entries = useMemo(() => {
    if (!snapshot) return { representatives: [], fallback: [] }
    const normalizedQuery = query.trim().toLocaleLowerCase()
    const grouped = editorEntries(snapshot)
    return {
      representatives: grouped.representatives.filter((entry) =>
        matchesQuery(entry, normalizedQuery)
      ),
      fallback: grouped.fallback.filter((entry) => matchesQuery(entry, normalizedQuery))
    }
  }, [query, snapshot])
  const entryCount = entries.representatives.length + entries.fallback.length
  const recoveryCopyPending = Object.values(recoveryCopyStatuses).some(
    ({ state }) => state === 'pending'
  )

  return (
    <div className="px-[42px] pt-[42px] pb-[76px] max-[1200px]:px-7">
      <div className="mx-auto max-w-[960px]">
        <header className="mb-7">
          <p className="page-eyebrow m-0">JOB EDITOR · {version.currentVersion}</p>
          <h1 className="page-title">직업 에디터</h1>
          <p className="page-description">최종 전직 대표 직업을 선택하세요.</p>
        </header>
        {snapshot && !snapshot.editorAvailable && (
          <div
            className="mb-6 rounded-lg border border-app-warning-border bg-app-warning-bg p-3 text-small text-app-warning"
            role="status"
          >
            현재 버전의 편집 작업본을 사용할 수 없습니다. DB 직업 목록은 볼 수 있지만 편집 화면을
            열거나 저장할 수 없습니다.
          </div>
        )}
        <section
          className="mt-8 border-t border-app-border pt-6"
          aria-labelledby="recovery-review-heading"
        >
          <details
            open={recoveryOpen}
            className="rounded-lg border border-app-border bg-app-surface"
            onToggle={(event) => {
              const open = event.currentTarget.open
              setRecoveryOpen(open)
              if (open && recoveryStatus === 'idle') loadRecoveryPreview()
            }}
          >
            <summary
              className="cursor-pointer px-4 py-3 text-body font-semibold text-app-text marker:text-app-muted"
              id="recovery-review-heading"
            >
              복구 초안 검토
            </summary>
            <div className="grid gap-4 border-t border-app-border px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="m-0 max-w-[680px] text-small text-app-muted">
                  복사는 선택한 직업의 메타데이터만 Phase 4 편집 작업본에 불변 revision 1로
                  기록합니다. 기존 복구 파일은 유지됩니다. 에디터는 현재 편집 작업본만 읽고 저장하며
                  DB publish는 실행하지 않습니다.
                </p>
                <button
                  className="shrink-0 rounded-md border border-app-border-strong bg-app-input px-3 py-1.5 text-small font-semibold text-app-text hover:border-app-accent disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  disabled={recoveryStatus === 'loading' || recoveryCopyPending}
                  onClick={loadRecoveryPreview}
                >
                  새로고침
                </button>
              </div>

              {recoveryStatus === 'loading' && (
                <p className="m-0 text-body text-app-muted" role="status">
                  복구 초안을 불러오는 중입니다.
                </p>
              )}
              {recoveryStatus === 'error' && (
                <div
                  className="rounded-md border border-app-danger-border bg-app-danger-bg p-3 text-body text-app-danger"
                  role="alert"
                >
                  <p className="m-0">{recoveryError}</p>
                  <button
                    className="mt-3 rounded-md border border-app-danger-border px-3 py-1.5 text-small font-semibold"
                    type="button"
                    onClick={loadRecoveryPreview}
                  >
                    다시 불러오기
                  </button>
                </div>
              )}
              {recoveryStatus === 'success' && recoveryPreview && (
                <>
                  <dl className="m-0 grid gap-2 rounded-md bg-app-input p-3 text-small sm:grid-cols-[120px_minmax(0,1fr)]">
                    <dt className="text-app-muted">recoveryId</dt>
                    <dd className="m-0 min-w-0">
                      <code className="break-all text-app-text">
                        {recoveryPreview.recoveryId ?? '(없음)'}
                      </code>
                    </dd>
                    <dt className="text-app-muted">SHA256</dt>
                    <dd className="m-0 min-w-0">
                      <code className="break-all text-app-text">
                        {recoveryPreview.sourceSha256 ?? '(없음)'}
                      </code>
                    </dd>
                  </dl>

                  {recoveryPreview.drafts.length === 0 ? (
                    <p className="m-0 rounded-md border border-app-border p-4 text-body text-app-muted">
                      검토할 복구 초안이 없습니다.
                    </p>
                  ) : (
                    <ul className="m-0 grid list-none gap-3 p-0">
                      {recoveryPreview.drafts.map((draft) => (
                        <li
                          className="min-w-0 rounded-md border border-app-border bg-app-input p-4"
                          key={draft.jobId}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="m-0 break-words text-body font-semibold text-app-text">
                                {draft.jobName}
                              </h3>
                              <p className="mt-1 mb-0 text-small text-app-muted">
                                직업 ID <code>{draft.jobId}</code> · revision{' '}
                                <code>{draft.revision}</code>
                              </p>
                            </div>
                            {draft.blockedForCopy ? (
                              <strong className="rounded-full border border-app-danger-border bg-app-danger-bg px-2.5 py-1 text-caption text-app-danger">
                                복사 불가
                              </strong>
                            ) : recoveryPreview.recoveryId !== null &&
                              recoveryPreview.sourceSha256 !== null ? (
                              <button
                                className="shrink-0 rounded-md border border-app-border-strong bg-app-surface px-3 py-1.5 text-small font-semibold text-app-text hover:border-app-accent disabled:cursor-not-allowed disabled:opacity-60"
                                type="button"
                                disabled={
                                  !snapshot?.editorAvailable ||
                                  recoveryCopyStatuses[draft.jobId] !== undefined
                                }
                                onClick={() =>
                                  copySelectedRecovery(
                                    draft.jobId,
                                    recoveryPreview.recoveryId!,
                                    recoveryPreview.sourceSha256!
                                  )
                                }
                              >
                                {recoveryCopyStatuses[draft.jobId]?.state === 'pending'
                                  ? '복사 중…'
                                  : '선택 직업 복사'}
                              </button>
                            ) : (
                              <strong className="text-small text-app-danger">
                                원본 식별 정보 없음 · 복사 불가
                              </strong>
                            )}
                          </div>

                          <RecoveryCopyFeedback
                            status={recoveryCopyStatuses[draft.jobId]}
                            onRefresh={loadRecoveryPreview}
                            refreshDisabled={recoveryCopyPending}
                          />

                          <dl className="mt-4 mb-0 grid gap-x-4 gap-y-2 text-small sm:grid-cols-[140px_minmax(0,1fr)]">
                            <dt className="text-app-muted">제안 영문 이름</dt>
                            <dd className="m-0 break-words text-app-text">
                              {draft.proposedAfter.englishName || '(없음)'}
                            </dd>
                            <dt className="text-app-muted">제안 직업군</dt>
                            <dd className="m-0 break-words text-app-text">
                              {draft.proposedAfter.classGroup || '(없음)'}
                            </dd>
                            <dt className="text-app-muted">제안 소속</dt>
                            <dd className="m-0 break-words text-app-text">
                              {draft.proposedAfter.affiliation || '(없음)'}
                            </dd>
                            <dt className="text-app-muted">제안 주스탯</dt>
                            <dd className="m-0 break-words text-app-text">
                              {draft.proposedAfter.mainStat || '(없음)'}
                            </dd>
                            <dt className="text-app-muted">제안 부스탯</dt>
                            <dd className="m-0 break-words text-app-text">
                              {draft.proposedAfter.subStat || '(없음)'}
                            </dd>
                            <dt className="text-app-muted">제안 주무기</dt>
                            <dd className="m-0 break-words text-app-text">
                              <RecoveryWeaponValues
                                values={draft.proposedAfter.primaryWeapons}
                                blockedKeys={draft.blockingNewWeaponTypeKeys}
                              />
                            </dd>
                            <dt className="text-app-muted">제안 보조무기</dt>
                            <dd className="m-0 break-words text-app-text">
                              <RecoveryWeaponValues
                                values={draft.proposedAfter.secondaryWeapons}
                                blockedKeys={draft.blockingNewWeaponTypeKeys}
                              />
                            </dd>
                            <dt className="text-app-muted">제외된 원본 직업명</dt>
                            <dd className="m-0 break-words text-app-text">
                              {draft.excluded.jobName}
                            </dd>
                            <dt className="text-app-muted">제외된 전직 연결</dt>
                            <dd className="m-0 break-words text-app-text">
                              {draft.excluded.advancementJobIds.present
                                ? draft.excluded.advancementJobIds.value?.join(', ') || '(없음)'
                                : '(필드 없음)'}
                            </dd>
                          </dl>

                          <div className="mt-4 border-t border-app-border pt-3">
                            <h4 className="m-0 text-small font-semibold text-app-text">
                              제외된 새 무기 후보
                            </h4>
                            {draft.excluded.newWeaponTypes.length === 0 ? (
                              <p className="mt-2 mb-0 text-small text-app-muted">(없음)</p>
                            ) : (
                              <ul className="mt-2 mb-0 grid list-none gap-2 p-0">
                                {draft.excluded.newWeaponTypes.map((weapon) => (
                                  <li
                                    className="min-w-0 rounded border border-app-danger-border bg-app-danger-bg p-2 text-small"
                                    key={weapon.key}
                                  >
                                    <strong className="text-app-danger">복사 불가</strong>
                                    <span className="text-app-muted">
                                      {' '}
                                      · {weapon.part} / {weapon.category} · key{' '}
                                    </span>
                                    <code className="break-all text-app-text">{weapon.key}</code>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {draft.blockingNewWeaponTypeKeys.length > 0 && (
                              <p className="mt-2 mb-0 text-small text-app-danger">
                                복사 차단 참조 key:{' '}
                                {draft.blockingNewWeaponTypeKeys.map((key, index) => (
                                  <span key={key}>
                                    {index > 0 && ', '}
                                    <code className="break-all">{key}</code>
                                  </span>
                                ))}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </details>
        </section>

        <label className="relative mb-5 block max-w-[560px]">
          <span className="sr-only">직업 검색</span>
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-3 -translate-y-1/2 text-app-muted"
            size={16}
          />
          <input
            className="h-10 w-full rounded-lg border border-app-border-strong bg-app-input pr-3 pl-10 text-body text-app-text outline-none focus:border-app-accent"
            placeholder="대표 직업 ID 또는 이름 검색"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        {error ? (
          <div
            className="rounded-lg border border-app-danger-border bg-app-danger-bg p-4 text-body text-app-danger"
            role="alert"
          >
            {error} 다시 진입하거나 현재 버전을 확인하세요.
          </div>
        ) : !snapshot ? (
          <p className="text-body text-app-muted">직업 목록을 불러오는 중입니다.</p>
        ) : entryCount === 0 ? (
          <div className="rounded-lg border border-app-border bg-app-surface p-8 text-center text-body text-app-muted">
            {query ? '검색 결과가 없습니다.' : '편집할 직업이 없습니다.'}
          </div>
        ) : (
          <div className="grid gap-7">
            {entries.representatives.length > 0 && (
              <section aria-labelledby="representative-jobs-heading">
                <h2 className="section-title" id="representative-jobs-heading">
                  {version.currentVersion} 최종 전직 대표
                </h2>
                <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 max-[700px]:grid-cols-1">
                  {entries.representatives.map((job) => (
                    <li key={job.classKey ?? job.jobId}>
                      <JobButton job={job} disabled={!snapshot.editorAvailable} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {entries.fallback.length > 0 && (
              <section aria-labelledby="fallback-jobs-heading">
                <h2 className="section-title" id="fallback-jobs-heading">
                  미분류 · 기존 작업본
                </h2>
                <p className="mb-3 text-small text-app-muted">
                  전직 그룹이 없거나 기존 ID로 저장된 작업본입니다. 수동 검토를 위해 접근을
                  유지합니다.
                </p>
                <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 max-[700px]:grid-cols-1">
                  {entries.fallback.map((job) => (
                    <li key={job.jobId}>
                      <JobButton job={job} disabled={!snapshot.editorAvailable} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
