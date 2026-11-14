import { ChevronDown, ChevronRight, Pencil, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import type {
  JobDataSnapshot,
  JobDraft,
  JobSummary,
  SaveJobDraftRequest,
  WeaponTypeOption
} from '../../../../shared/job-data'
import { getErrorMessage } from '../../shared/lib/error-message'

import {
  emptyJobDraft,
  emptyJobFilters,
  fallbackJobs,
  filterJobGroups,
  filterJobs,
  isStaleJobDraftError,
  jobDraftChanged,
  jobDraftForSave,
  jobEditPath,
  newJobsFromComparison,
  olderVersions,
  shouldConfirmInlineNavigation,
  weaponOptionLabel,
  type JobFilters,
  type NewJobNotice
} from './job-model'
import { JobStatPicker } from './JobStatPicker'
import { useNavigationWarning } from './use-navigation-warning'

type JobApi = typeof window.api & {
  listJobData: (version: string) => Promise<JobDataSnapshot>
  saveJobDraft: (request: SaveJobDraftRequest) => Promise<JobDraft>
}

const jobApi = (): JobApi => window.api as JobApi
const classGroups = ['전사', '마법사', '궁수', '도적', '해적']
const affiliations = ['모험가', '시그너스 기사단', '영웅', '레지스탕스', '노바', '레프', '아니마']
const detailTabs = ['기본 정보', '전직 정보', '스킬 정보', '링크 스킬', '기타 데이터'] as const
type DetailTab = (typeof detailTabs)[number]
const inlineFields: { key: keyof JobDraft; label: string }[] = [
  { key: 'englishName', label: '영문 이름' },
  { key: 'classGroup', label: '직업군' },
  { key: 'affiliation', label: '소속' },
  { key: 'mainStat', label: '주스탯' },
  { key: 'subStat', label: '부스탯' }
]

function savedDraft(snapshot: JobDataSnapshot, job: JobSummary): JobDraft {
  const sourceJob = snapshot.jobs.find((candidate) => candidate.jobId === job.jobId) ?? job
  const classKey = snapshot.jobGroups.find(
    ({ representativeJobId }) => representativeJobId === job.jobId
  )?.classKey
  return (
    snapshot.drafts.find((draft) => draft.jobId === job.jobId) ?? emptyJobDraft(sourceJob, classKey)
  )
}

function weaponLabels(keys: string[], options: WeaponTypeOption[]): string {
  if (!keys.length) return '미입력'
  return keys
    .map((key) =>
      weaponOptionLabel(
        options.find((option) => option.key === key) ?? {
          key,
          category: 'weapon',
          part: key,
          classGroupKeys: [],
          handType: null,
          weaponConstant: null
        }
      )
    )
    .join(', ')
}

export function JobDataView({
  version,
  versions
}: {
  version: string
  versions: string[]
}): React.JSX.Element {
  const navigate = useNavigate()
  const [snapshot, setSnapshot] = useState<JobDataSnapshot | null>(null)
  const [selectedId, setSelectedId] = useState('')
  const [filters, setFilters] = useState<JobFilters>(emptyJobFilters)
  const [activeTab, setActiveTab] = useState<DetailTab>('기본 정보')
  const [editing, setEditing] = useState<JobDraft | null>(null)
  const [editBaseline, setEditBaseline] = useState<JobDraft | null>(null)
  const [saving, setSaving] = useState(false)
  const [staleConflict, setStaleConflict] = useState(false)
  const [error, setError] = useState('')
  const [notices, setNotices] = useState<NewJobNotice[]>([])
  const [noticeError, setNoticeError] = useState('')
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [noticeVersion, setNoticeVersion] = useState('')
  const [expandedNoticeJob, setExpandedNoticeJob] = useState('')
  const inlineOperationGeneration = useRef(0)
  const activeInlineOperation = useRef<number | null>(null)
  const inlineContext = useRef({ version, selectedId })
  if (inlineContext.current.version !== version) {
    inlineOperationGeneration.current += 1
    inlineContext.current = { version, selectedId }
  }
  const hasInlineChanges = Boolean(
    editing && editBaseline && jobDraftChanged(editBaseline, editing)
  )
  const blocksInlineNavigation = shouldConfirmInlineNavigation(hasInlineChanges, saving)
  const warning = blocksInlineNavigation
    ? saving
      ? '작업본을 저장하고 있습니다. 이동하면 저장 결과를 확인할 수 없습니다.'
      : '저장하지 않은 변경사항이 있습니다. 변경사항을 버리고 이동할까요?'
    : ''
  useNavigationWarning(warning)

  const selectInlineJob = (jobId: string): void => {
    if (inlineContext.current.selectedId !== jobId) {
      inlineOperationGeneration.current += 1
      inlineContext.current = { version, selectedId: jobId }
      setSaving(false)
    }
    setSelectedId(jobId)
  }

  useEffect(() => {
    let active = true
    inlineOperationGeneration.current += 1
    inlineContext.current = { version, selectedId: '' }
    setSnapshot(null)
    setSelectedId('')
    setSaving(false)
    setFilters(emptyJobFilters())
    setActiveTab('기본 정보')
    setEditing(null)
    setEditBaseline(null)
    setError('')
    setStaleConflict(false)

    void jobApi()
      .listJobData(version)
      .then((next) => {
        if (!active) return
        const groups = next.jobGroups ?? []
        const nextSelectedId =
          groups[0]?.representativeJobId ??
          fallbackJobs(next.jobs, groups, next.drafts)[0]?.jobId ??
          ''
        inlineOperationGeneration.current += 1
        inlineContext.current = { version, selectedId: nextSelectedId }
        setSnapshot(next)
        setSelectedId(nextSelectedId)
      })
      .catch((caught: unknown) => {
        if (active) setError(getErrorMessage(caught))
      })

    return () => {
      active = false
    }
  }, [version])

  useEffect(() => {
    let active = true
    setNotices([])
    setNoticeError('')
    setNoticeOpen(false)
    setExpandedNoticeJob('')
    const candidates = olderVersions(version, versions)
    void Promise.allSettled(
      candidates.map(async (baseVersion): Promise<NewJobNotice | null> => {
        const comparison = await window.api.openRawDataDiff({
          baseVersion,
          compareVersion: version,
          filename: 'ms_job.json'
        })
        const jobs = newJobsFromComparison(comparison)
        return jobs.length ? { baseVersion, jobs } : null
      })
    ).then((results) => {
      if (!active) return
      const next = results.flatMap((result) =>
        result.status === 'fulfilled' && result.value ? [result.value] : []
      )
      const failures = results.filter((result) => result.status === 'rejected').length
      setNotices(next)
      setNoticeError(
        failures
          ? `새 직업 알림 ${failures}개 버전을 불러오지 못했습니다. 다시 진입해 재시도하세요.`
          : ''
      )
      setNoticeVersion((current) =>
        next.some((notice) => notice.baseVersion === current) ? current : next[0]?.baseVersion || ''
      )
    })
    return () => {
      active = false
    }
  }, [version, versions])

  const groups = useMemo(() => snapshot?.jobGroups ?? [], [snapshot])
  const fallback = useMemo(
    () => fallbackJobs(snapshot?.jobs ?? [], groups, snapshot?.drafts ?? []),
    [groups, snapshot]
  )
  const filteredGroups = useMemo(
    () => filterJobGroups(groups, snapshot?.drafts ?? [], filters),
    [filters, groups, snapshot?.drafts]
  )
  const filteredFallback = useMemo(
    () => filterJobs(fallback, snapshot?.drafts ?? [], filters),
    [fallback, filters, snapshot?.drafts]
  )
  const selectedGroup = groups.find((group) => group.representativeJobId === selectedId) ?? null
  const selectedJob = selectedGroup
    ? {
        jobId: selectedGroup.representativeJobId,
        jobName: selectedGroup.representativeName
      }
    : (fallback.find((job) => job.jobId === selectedId) ?? null)
  const currentDraft =
    editing ?? (snapshot && selectedJob ? savedDraft(snapshot, selectedJob) : null)
  const weaponTypes = snapshot?.weaponTypes ?? []
  const activeNotice = notices.find((notice) => notice.baseVersion === noticeVersion)

  const beginInlineEdit = (): void => {
    if (!snapshot?.editorAvailable || !selectedJob) return
    const current = savedDraft(snapshot, selectedJob)
    setEditBaseline(current)
    setEditing({ ...current })
    setStaleConflict(false)
  }

  type InlineOperation = { generation: number; version: string; jobId: string }

  const beginInlineOperation = (jobId: string): InlineOperation => {
    const generation = inlineOperationGeneration.current + 1
    inlineOperationGeneration.current = generation
    activeInlineOperation.current = generation
    setSaving(true)
    return { generation, version, jobId }
  }

  const isCurrentInlineOperation = (operation: InlineOperation): boolean =>
    inlineOperationGeneration.current === operation.generation &&
    inlineContext.current.version === operation.version &&
    inlineContext.current.selectedId === operation.jobId

  const finishInlineOperation = (operation: InlineOperation): void => {
    if (activeInlineOperation.current !== operation.generation) return
    activeInlineOperation.current = null
    setSaving(false)
  }

  const commitInlineSave = async (
    candidate: JobDraft,
    expectedChangeSetId: string,
    operation: InlineOperation
  ): Promise<void> => {
    const saved = await jobApi().saveJobDraft({
      version: operation.version,
      expectedChangeSetId,
      draft: jobDraftForSave(candidate)
    })
    if (!isCurrentInlineOperation(operation)) return
    setSnapshot((current) =>
      current
        ? {
            ...current,
            drafts: [...current.drafts.filter((draft) => draft.jobId !== saved.jobId), saved]
          }
        : current
    )
    setEditing(null)
    setEditBaseline(null)
    setStaleConflict(false)
  }

  const saveInline = async (): Promise<void> => {
    if (!editing || !snapshot?.changeSetId || staleConflict) return
    const operation = beginInlineOperation(editing.jobId)
    setError('')
    try {
      await commitInlineSave(editing, snapshot.changeSetId, operation)
    } catch (caught) {
      if (!isCurrentInlineOperation(operation)) return
      setStaleConflict(isStaleJobDraftError(caught))
      setError(
        isStaleJobDraftError(caught)
          ? '다른 변경으로 작업본 기준이 바뀌었습니다. 현재 입력은 유지됩니다.'
          : getErrorMessage(caught)
      )
    } finally {
      finishInlineOperation(operation)
    }
  }

  const reloadInlineLatest = async (): Promise<void> => {
    if (!selectedJob || !window.confirm('현재 입력을 버리고 최신 작업본을 불러올까요?')) return
    const operation = beginInlineOperation(selectedJob.jobId)
    try {
      const next = await jobApi().listJobData(operation.version)
      if (!isCurrentInlineOperation(operation)) return
      setSnapshot(next)
      setEditing(null)
      setEditBaseline(null)
      setStaleConflict(false)
      setError('')
    } catch (caught) {
      if (isCurrentInlineOperation(operation)) setError(getErrorMessage(caught))
    } finally {
      finishInlineOperation(operation)
    }
  }

  const retryInlineLatest = async (): Promise<void> => {
    if (!editing) return
    const operation = beginInlineOperation(editing.jobId)
    try {
      const next = await jobApi().listJobData(operation.version)
      if (!isCurrentInlineOperation(operation)) return
      const latest = next.drafts.find(({ jobId }) => jobId === operation.jobId)
      const databaseJob = next.jobs.find(({ jobId }) => jobId === operation.jobId)
      if (!next.editorAvailable || !next.changeSetId)
        throw new Error('현재 버전의 편집 작업본을 사용할 수 없습니다.')
      if (!latest && !databaseJob) throw new Error('DB 직업 데이터를 찾을 수 없습니다.')
      const candidate = jobDraftForSave(
        {
          ...editing,
          jobName: latest?.jobName ?? databaseJob!.jobName
        },
        latest?.revision ?? 0
      )
      setSnapshot(next)
      setEditing(candidate)
      await commitInlineSave(candidate, next.changeSetId, operation)
      if (isCurrentInlineOperation(operation)) setError('')
    } catch (caught) {
      if (!isCurrentInlineOperation(operation)) return
      setStaleConflict(isStaleJobDraftError(caught))
      setError(getErrorMessage(caught))
    } finally {
      finishInlineOperation(operation)
    }
  }

  const confirmInlineNavigation = (): boolean => !blocksInlineNavigation || window.confirm(warning)

  const toggleFilter = (key: 'classGroups' | 'affiliations', value: string): void => {
    setFilters((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value]
    }))
  }

  const openEditor = (job: JobSummary): void => {
    if (!snapshot?.editorAvailable || !snapshot.jobs.some(({ jobId }) => jobId === job.jobId))
      return
    if (!confirmInlineNavigation()) return
    setEditing(null)
    setEditBaseline(null)
    navigate(jobEditPath(job.jobId))
  }

  return (
    <div className="relative grid min-h-[calc(100vh-130px)] grid-cols-[minmax(0,1fr)_330px] gap-0 max-[980px]:grid-cols-1">
      <section className="min-w-0 pt-4 pr-8 pl-4 max-[980px]:px-3 max-[980px]:pt-3">
        {error && (
          <div
            className="mb-4 rounded-lg border border-app-danger-border bg-app-danger-bg p-3 text-small text-app-danger"
            role="alert"
          >
            {error}
          </div>
        )}
        {snapshot && !snapshot.editorAvailable && (
          <div
            className="mb-4 rounded-lg border border-app-warning-border bg-app-warning-bg p-3 text-small text-app-warning"
            role="status"
          >
            현재 버전의 편집 작업본을 사용할 수 없습니다. DB 직업 데이터는 볼 수 있지만 저장할 수
            없습니다.
          </div>
        )}
        {staleConflict && (
          <div
            className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-app-warning-border bg-app-warning-bg p-3 text-small text-app-warning"
            role="status"
          >
            <span>현재 입력을 유지했습니다. 사용자 선택 전에는 자동 재시도하지 않습니다.</span>
            <button
              className="action-secondary"
              disabled={saving}
              type="button"
              onClick={() => void reloadInlineLatest()}
            >
              최신 작업본 불러오기
            </button>
            <button
              className="action-primary"
              disabled={saving}
              type="button"
              onClick={() => void retryInlineLatest()}
            >
              최신 기준으로 재시도
            </button>
          </div>
        )}
        {!snapshot && !error && (
          <p className="text-body text-app-muted">직업 데이터를 불러오는 중입니다.</p>
        )}
        {snapshot && !selectedJob && (
          <p className="text-body text-app-muted">표시할 직업 데이터가 없습니다.</p>
        )}
        {snapshot && selectedJob && currentDraft && (
          <>
            <header className="mb-5 flex items-center gap-3">
              <div>
                <p className="m-0 text-caption font-semibold text-app-accent">JOB DETAIL</p>
                <h1 className="my-1 text-page-title font-bold tracking-page-title">
                  {selectedJob.jobName}
                </h1>
              </div>
              <button
                aria-label={`${selectedJob.jobName} 전체 편집`}
                className="grid h-8 w-8 place-items-center rounded-md border-0 bg-transparent text-app-muted hover:bg-app-surface-hover hover:text-app-accent disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!snapshot.editorAvailable}
                title={snapshot.editorAvailable ? '전체 편집' : '편집 작업본을 사용할 수 없습니다'}
                type="button"
                onClick={() => openEditor(selectedJob)}
              >
                <Pencil aria-hidden="true" size={15} />
              </button>
            </header>
            <nav
              aria-label="직업 상세 탭"
              className="mb-2 flex gap-5 overflow-x-auto border-b border-app-border text-small font-semibold text-app-muted"
              role="tablist"
            >
              {detailTabs.map((tab) => (
                <button
                  aria-selected={activeTab === tab}
                  className={`shrink-0 border-x-0 border-t-0 bg-transparent px-2 py-2 font-inherit ${activeTab === tab ? 'border-b-2 border-app-accent text-app-text' : 'border-b-2 border-transparent text-app-muted'}`}
                  key={tab}
                  role="tab"
                  type="button"
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </nav>
            {activeTab === '기본 정보' && (
              <>
                <dl className="m-0 divide-y divide-app-border text-body">
                  <div className="grid min-h-11 grid-cols-[140px_minmax(0,1fr)] items-center py-1 max-[600px]:grid-cols-[105px_minmax(0,1fr)]">
                    <dt className="text-app-muted">jobID</dt>
                    <dd className="m-0 font-mono">{selectedJob.jobId}</dd>
                  </div>
                  <div className="grid min-h-11 grid-cols-[140px_minmax(0,1fr)] items-center py-1 max-[600px]:grid-cols-[105px_minmax(0,1fr)]">
                    <dt className="text-app-muted">
                      {selectedGroup ? '원본 직업 이름' : '직업 이름'}
                    </dt>
                    <dd className="m-0">{currentDraft.jobName}</dd>
                  </div>
                  {inlineFields.map(({ key, label }) => {
                    const statField = key === 'mainStat' || key === 'subStat'
                    return (
                      <div
                        className={`grid min-h-11 grid-cols-[140px_minmax(0,1fr)] items-center max-[600px]:grid-cols-[105px_minmax(0,1fr)] ${statField ? 'py-1' : ''}`}
                        key={key}
                      >
                        <dt className="text-app-muted">
                          {key === 'subStat' ? '부스탯 (선택)' : label}
                        </dt>
                        <dd className="m-0 min-w-0">
                          {statField ? (
                            <JobStatPicker
                              disabled={!editing || saving}
                              label={label}
                              value={String(currentDraft[key])}
                              onChange={(value) =>
                                setEditing((current) =>
                                  current ? { ...current, [key]: value } : current
                                )
                              }
                            />
                          ) : editing ? (
                            key === 'classGroup' || key === 'affiliation' ? (
                              <div
                                className={`relative w-full ${key === 'classGroup' ? 'max-w-[180px]' : 'max-w-[220px]'}`}
                              >
                                <select
                                  aria-label={label}
                                  className="h-8 w-full appearance-none rounded-md border border-app-border-strong bg-app-input pr-9 pl-3 text-body"
                                  disabled={saving}
                                  value={String(editing[key])}
                                  onChange={(event) =>
                                    setEditing({ ...editing, [key]: event.target.value })
                                  }
                                >
                                  <option value="">선택</option>
                                  {(key === 'classGroup' ? classGroups : affiliations).map(
                                    (option) => (
                                      <option key={option}>{option}</option>
                                    )
                                  )}
                                </select>
                                <ChevronDown
                                  aria-hidden="true"
                                  className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-app-muted"
                                  size={15}
                                />
                              </div>
                            ) : (
                              <input
                                aria-label={label}
                                className="h-8 w-full max-w-[300px] rounded-md border border-app-border-strong bg-app-input px-3 text-body"
                                disabled={saving}
                                value={String(editing[key])}
                                onChange={(event) =>
                                  setEditing({ ...editing, [key]: event.target.value })
                                }
                              />
                            )
                          ) : (
                            <span>{String(currentDraft[key]) || '미입력'}</span>
                          )}
                        </dd>
                      </div>
                    )
                  })}
                  <div className="grid min-h-11 grid-cols-[140px_minmax(0,1fr)] items-center py-1 max-[600px]:grid-cols-[105px_minmax(0,1fr)]">
                    <dt className="text-app-muted">종족</dt>
                    <dd className="m-0 min-w-0">미등록</dd>
                  </div>
                  <div className="grid min-h-11 grid-cols-[140px_minmax(0,1fr)] items-center py-1 max-[600px]:grid-cols-[105px_minmax(0,1fr)]">
                    <dt className="text-app-muted">주무기</dt>
                    <dd className="m-0 min-w-0 break-words">
                      {weaponLabels(currentDraft.primaryWeapons, weaponTypes)}
                    </dd>
                  </div>
                  <div className="grid min-h-11 grid-cols-[140px_minmax(0,1fr)] items-center py-1 max-[600px]:grid-cols-[105px_minmax(0,1fr)]">
                    <dt className="text-app-muted">보조무기</dt>
                    <dd className="m-0 min-w-0 break-words">
                      {weaponLabels(currentDraft.secondaryWeapons, weaponTypes)}
                    </dd>
                  </div>
                </dl>
                {editing && (
                  <p className="mt-4 rounded-md border border-app-warning-border bg-app-warning-bg p-3 text-small text-app-warning">
                    DB 원본 직업명, 새 무기 후보, 전직 연결은 이 metadata 편집에서 제외됩니다.
                  </p>
                )}
                {!editing && (
                  <button
                    className="action-secondary mt-5"
                    disabled={!snapshot.editorAvailable}
                    type="button"
                    onClick={beginInlineEdit}
                  >
                    기본 정보 수정
                  </button>
                )}
              </>
            )}
            {activeTab === '전직 정보' && (
              <section aria-label="전직 정보" className="mt-5">
                {selectedGroup ? (
                  <>
                    <div className="overflow-hidden rounded-lg border border-app-border">
                      <div className="grid grid-cols-[80px_minmax(100px,140px)_minmax(0,1fr)_100px] gap-3 border-b border-app-border bg-app-surface-2 px-4 py-3 text-caption font-semibold text-app-muted max-[700px]:grid-cols-[60px_90px_minmax(0,1fr)]">
                        <span>차수</span>
                        <span>jobID</span>
                        <span>이름</span>
                        <span className="max-[700px]:hidden">검토</span>
                      </div>
                      {selectedGroup.advancements.map((advancement) => {
                        const isRepresentativeFourthStage =
                          advancement.stage === 4 &&
                          advancement.jobId === selectedGroup.representativeJobId

                        return (
                          <div
                            className={`grid grid-cols-[80px_minmax(100px,140px)_minmax(0,1fr)_100px] items-center gap-3 border-b border-app-border px-4 py-3 text-body last:border-b-0 max-[700px]:grid-cols-[60px_90px_minmax(0,1fr)] ${isRepresentativeFourthStage ? 'shadow-[inset_2px_0_0_var(--color-app-accent)]' : ''}`}
                            key={`${advancement.stage}-${advancement.jobId}`}
                          >
                            <strong>
                              {advancement.stage}차
                              {isRepresentativeFourthStage && (
                                <span className="sr-only"> 대표 4차 전직</span>
                              )}
                            </strong>
                            <code className="text-app-muted">{advancement.jobId}</code>
                            <span>
                              <span className="mr-2 text-caption text-app-muted">원본 이름</span>
                              {advancement.jobName}
                              {advancement.requiresReview && (
                                <span className="ml-2 rounded-full border border-app-warning-border bg-app-warning-bg px-2 py-1 text-micro font-semibold text-app-warning min-[701px]:hidden">
                                  검토 필요
                                </span>
                              )}
                            </span>
                            <span className="max-[700px]:hidden">
                              {advancement.requiresReview && (
                                <span className="rounded-full border border-app-warning-border bg-app-warning-bg px-2 py-1 text-micro font-semibold text-app-warning">
                                  검토 필요
                                </span>
                              )}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <p className="mt-3 text-small text-app-muted">
                      5차 전직은 별도 jobID가 없습니다.
                    </p>
                  </>
                ) : (
                  <p className="text-body text-app-muted">연결된 전직 정보가 없습니다.</p>
                )}
              </section>
            )}
            {activeTab !== '기본 정보' && activeTab !== '전직 정보' && (
              <div aria-label={`${activeTab} 빈 화면`} className="min-h-40" />
            )}
          </>
        )}
      </section>

      <aside className="border-l border-app-border pt-4 pr-4 pl-6 max-[980px]:mt-8 max-[980px]:border-l-0 max-[980px]:border-t max-[980px]:px-3 max-[980px]:pt-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">필터</h2>
          <button
            className="text-small font-semibold text-app-muted hover:text-app-accent"
            type="button"
            onClick={() => setFilters(emptyJobFilters())}
          >
            초기화
          </button>
        </div>
        <fieldset className="mt-4 border-0 p-0">
          <legend className="field-label mb-2">직업군</legend>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {classGroups.map((value) => (
              <label
                className="flex min-w-0 items-center gap-2 text-small text-app-muted"
                key={value}
              >
                <input
                  checked={filters.classGroups.includes(value)}
                  className="h-4 w-4 shrink-0 accent-app-accent"
                  type="checkbox"
                  onChange={() => toggleFilter('classGroups', value)}
                />
                <span>{value}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-5 border-0 p-0">
          <legend className="field-label mb-2">소속</legend>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {affiliations.map((value) => (
              <label
                className="flex min-w-0 items-center gap-2 text-small text-app-muted"
                key={value}
              >
                <input
                  checked={filters.affiliations.includes(value)}
                  className="h-4 w-4 shrink-0 accent-app-accent"
                  type="checkbox"
                  onChange={() => toggleFilter('affiliations', value)}
                />
                <span>{value}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-6 border-t-2 border-app-border-strong pt-5">
          <label className="relative block">
            <span className="sr-only">직업 검색</span>
            <input
              className="h-10 w-full rounded-md border border-app-border-strong bg-app-input pr-10 pl-3 text-body"
              placeholder="직업명 검색..."
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            />
            <Search className="absolute top-3 right-3 text-app-muted" size={15} />
          </label>
        </div>
        <div className="mt-4 max-h-[420px] overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <section aria-labelledby="grouped-job-heading">
            <h3 className="mb-2 text-caption font-semibold text-app-muted" id="grouped-job-heading">
              대표 직업
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {filteredGroups.map((group) => (
                <button
                  aria-pressed={selectedId === group.representativeJobId}
                  className={`min-h-14 rounded-md border px-3 py-2 text-left ${selectedId === group.representativeJobId ? 'border-app-accent bg-app-accent-bg text-app-text' : 'border-app-border bg-app-surface text-app-muted hover:border-app-border-strong'}`}
                  key={group.representativeJobId}
                  type="button"
                  onClick={() => {
                    if (confirmInlineNavigation()) {
                      setEditing(null)
                      setEditBaseline(null)
                      selectInlineJob(group.representativeJobId)
                    }
                  }}
                >
                  <strong className="block text-small">{group.representativeName}</strong>
                  <span className="mt-1 block font-mono text-micro text-app-muted">
                    {group.representativeJobId}
                  </span>
                </button>
              ))}
            </div>
          </section>
          {filteredFallback.length > 0 && (
            <section aria-labelledby="fallback-job-heading" className="mt-5">
              <h3
                className="mb-2 border-t border-app-border pt-4 text-caption font-semibold text-app-muted"
                id="fallback-job-heading"
              >
                기타 · 복구 초안
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {filteredFallback.map((job) => (
                  <button
                    aria-pressed={selectedId === job.jobId}
                    className={`min-h-12 rounded-md border px-3 py-2 text-left ${selectedId === job.jobId ? 'border-app-accent bg-app-accent-bg text-app-text' : 'border-app-border bg-app-surface text-app-muted hover:border-app-border-strong'}`}
                    key={job.jobId}
                    type="button"
                    onClick={() => {
                      if (confirmInlineNavigation()) {
                        setEditing(null)
                        setEditBaseline(null)
                        selectInlineJob(job.jobId)
                      }
                    }}
                  >
                    <strong className="block text-small">{job.jobName}</strong>
                    <span className="mt-1 block font-mono text-micro text-app-muted">
                      {job.jobId}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>

      {editing && (
        <div className="fixed right-0 bottom-0 left-[244px] z-20 flex items-center justify-between border-t border-app-warning-border bg-app-warning-bg px-7 py-3 max-[767px]:left-0">
          <span className="text-small font-semibold text-app-warning">
            저장하지 않은 변경사항이 있습니다.
          </span>
          <div className="flex gap-2">
            <button
              className="action-secondary"
              disabled={saving}
              type="button"
              onClick={() => {
                setEditing(null)
                setEditBaseline(null)
                setStaleConflict(false)
              }}
            >
              편집 취소
            </button>
            <button
              className="action-primary"
              disabled={saving || !hasInlineChanges || staleConflict || !snapshot?.editorAvailable}
              type="button"
              onClick={() => void saveInline()}
            >
              {saving ? '저장 중...' : '작업본에 적용'}
            </button>
          </div>
        </div>
      )}

      {(notices.length > 0 || noticeError) && (
        <section
          className={`fixed right-4 z-30 w-[360px] max-w-[calc(100vw-32px)] overflow-hidden rounded-lg border border-app-info-border bg-app-surface shadow-2xl ${editing ? 'bottom-20' : 'bottom-4'}`}
        >
          <button
            aria-expanded={noticeOpen}
            className="flex w-full items-center gap-3 border-0 bg-app-info-bg px-4 py-3 text-left text-small font-semibold text-app-info"
            type="button"
            onClick={() => setNoticeOpen((open) => !open)}
          >
            <span className="h-2 w-2 rounded-full bg-app-info" />새 직업 알림 (
            {notices.reduce((count, notice) => count + notice.jobs.length, 0)}개)
            {noticeOpen ? (
              <ChevronDown className="ml-auto" size={16} />
            ) : (
              <ChevronRight className="ml-auto" size={16} />
            )}
          </button>
          {noticeOpen && (
            <div>
              {noticeError && (
                <p
                  className="m-2 rounded bg-app-warning-bg p-2 text-small text-app-warning"
                  role="alert"
                >
                  {noticeError}
                </p>
              )}
              <div className="flex gap-1 overflow-x-auto border-b border-app-border p-2">
                {notices.map((notice) => (
                  <button
                    className={`shrink-0 rounded px-2 py-1 text-micro ${noticeVersion === notice.baseVersion ? 'bg-app-accent-bg text-app-accent' : 'text-app-muted'}`}
                    key={notice.baseVersion}
                    type="button"
                    onClick={() => setNoticeVersion(notice.baseVersion)}
                  >
                    {notice.baseVersion} → {version}
                  </button>
                ))}
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {activeNotice?.jobs.map((job) => (
                  <div className="border-b border-app-border last:border-0" key={job.jobId}>
                    <button
                      className="flex w-full items-center px-2 py-2 text-left text-small"
                      type="button"
                      onClick={() =>
                        setExpandedNoticeJob((id) => (id === job.jobId ? '' : job.jobId))
                      }
                    >
                      <strong>{job.jobName}</strong>
                      <span className="ml-auto font-mono text-app-muted">{job.jobId}</span>
                    </button>
                    {expandedNoticeJob === job.jobId && (
                      <div className="mb-2 rounded bg-app-surface-2 p-2 text-small text-app-muted">
                        <p className="m-0">기준 버전에 없던 신규 직업입니다.</p>
                        <p className="mt-2 mb-0 font-semibold text-app-warning">
                          아직 DB에 없는 직업은 편집 작업본에 저장할 수 없습니다.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
