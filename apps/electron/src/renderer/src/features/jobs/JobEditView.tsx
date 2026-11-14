import { ChevronDown, Plus, Search, X } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import type {
  JobDataSnapshot,
  JobDraft,
  SaveJobDraftRequest,
  WeaponTypeOption
} from '../../../../shared/job-data'
import { getErrorMessage } from '../../shared/lib/error-message'

import {
  decodeJobId,
  emptyJobDraft,
  isStaleJobDraftError,
  jobDraftChanged,
  jobDraftForSave,
  mergeSavedDraft,
  validateJobDraft,
  withPersistedRevision,
  weaponOptionLabel
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

function LabeledField({
  label,
  children,
  className = 'grid gap-2'
}: {
  label: string
  children: React.ReactNode
  className?: string
}): React.JSX.Element {
  return (
    <label className={className}>
      <span className="field-label">{label}</span>
      {children}
    </label>
  )
}

function SelectControl({
  label,
  value,
  options,
  className,
  onChange
}: {
  label: string
  value: string
  options: string[]
  className: string
  onChange: (value: string) => void
}): React.JSX.Element {
  return (
    <span className={`group relative block ${className}`}>
      <select
        aria-label={label}
        className="h-8 w-full appearance-none rounded-md border border-app-border-strong bg-app-input pr-9 pl-3 text-body"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">선택</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-app-muted group-hover:text-app-text group-focus-within:text-app-text"
        size={15}
      />
    </span>
  )
}

function WeaponPicker({
  label,
  category,
  selected,
  options,
  disabled,
  onChange
}: {
  label: string
  category: 'weapon' | 'subWeapon'
  selected: string[]
  options: WeaponTypeOption[]
  disabled: boolean
  onChange: (keys: string[]) => void
}): React.JSX.Element {
  const listboxId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const [query, setQuery] = useState('')
  const [chooserOpen, setChooserOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const available = options.filter(
    (option) =>
      option.category === category &&
      !selected.includes(option.key) &&
      `${option.key} ${option.part}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())
  )
  const activeOption = available[activeIndex]

  const closeChooser = (): void => {
    setChooserOpen(false)
    setQuery('')
    setActiveIndex(0)
    requestAnimationFrame(() => addButtonRef.current?.focus())
  }

  const choose = (option: WeaponTypeOption): void => {
    onChange([...selected, option.key])
    closeChooser()
  }

  return (
    <section className="border-t border-app-border pt-5">
      <h3 className="mb-3 text-body font-bold">{label}</h3>
      <div className="mb-3 flex flex-wrap items-start gap-2">
        {selected.map((key) => (
          <span
            className="flex h-9 items-center gap-1 rounded-full bg-app-accent-bg px-3 text-small text-app-accent"
            key={key}
          >
            {weaponOptionLabel(
              options.find((option) => option.key === key) ?? {
                key,
                part: key,
                category,
                classGroupKeys: [],
                handType: null,
                weaponConstant: null
              }
            )}
            <button
              aria-label={`${key} 제거`}
              className="border-0 bg-transparent text-inherit disabled:opacity-50"
              disabled={disabled}
              type="button"
              onClick={() => onChange(selected.filter((value) => value !== key))}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {chooserOpen ? (
          <div className="relative w-72 max-w-full">
            <label className="sr-only" htmlFor={`${listboxId}-input`}>
              {label} 추가
            </label>
            <input
              ref={inputRef}
              aria-activedescendant={activeOption ? `${listboxId}-${activeIndex}` : undefined}
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-expanded="true"
              className="h-9 w-full rounded-md border border-app-accent bg-app-input pr-9 pl-3 text-body outline-none"
              id={`${listboxId}-input`}
              placeholder="무기 검색"
              role="combobox"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setActiveIndex(0)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  closeChooser()
                } else if (event.key === 'ArrowDown' && available.length) {
                  event.preventDefault()
                  setActiveIndex((index) => Math.min(index + 1, available.length - 1))
                } else if (event.key === 'ArrowUp' && available.length) {
                  event.preventDefault()
                  setActiveIndex((index) => Math.max(index - 1, 0))
                } else if (event.key === 'Enter' && activeOption) {
                  event.preventDefault()
                  choose(activeOption)
                }
              }}
            />
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-2.5 right-3 text-app-muted"
              size={15}
            />
            <div
              className="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-md border border-app-border bg-app-input p-1 shadow-lg"
              id={listboxId}
              role="listbox"
            >
              {available.length ? (
                available.map((option, index) => (
                  <button
                    aria-selected={index === activeIndex}
                    className={`block w-full rounded px-3 py-2 text-left text-small ${index === activeIndex ? 'bg-app-accent-bg text-app-accent' : 'hover:bg-app-surface-hover'}`}
                    id={`${listboxId}-${index}`}
                    key={option.key}
                    role="option"
                    type="button"
                    onClick={() => choose(option)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    {weaponOptionLabel(option)}
                  </button>
                ))
              ) : (
                <p className="m-2 text-small text-app-muted">
                  {query ? '검색 결과가 없습니다.' : '추가할 무기가 없습니다.'}
                </p>
              )}
            </div>
          </div>
        ) : (
          <button
            ref={addButtonRef}
            className="flex h-9 items-center gap-1.5 rounded-md border border-app-border-strong bg-app-input px-3 text-small font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
            type="button"
            onClick={() => {
              setChooserOpen(true)
              setActiveIndex(0)
              requestAnimationFrame(() => inputRef.current?.focus())
            }}
          >
            <Plus aria-hidden="true" size={15} /> 추가하기
          </button>
        )}
      </div>
    </section>
  )
}

export function JobEditView({ version }: { version: string }): React.JSX.Element {
  const navigate = useNavigate()
  const { jobId: encodedJobId } = useParams()
  const jobId = decodeJobId(encodedJobId)
  const editorIdentity = `${version}:${jobId}`
  const editorContext = useRef({ generation: 0, identity: editorIdentity })
  if (editorContext.current.identity !== editorIdentity) {
    editorContext.current = {
      generation: editorContext.current.generation + 1,
      identity: editorIdentity
    }
  }
  const editorGeneration = editorContext.current.generation
  const [snapshot, setSnapshot] = useState<JobDataSnapshot | null>(null)
  const [draft, setDraft] = useState<JobDraft | null>(null)
  const [saving, setSaving] = useState(false)
  const [staleConflict, setStaleConflict] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const hydrated = useRef(false)
  const editSequence = useRef(0)
  const saveChain = useRef<Promise<void>>(Promise.resolve())
  const pendingSaves = useRef(new Map<number, number>())
  const persistedDrafts = useRef(new Map<number, JobDraft>())
  const persistedDraft = useRef<JobDraft | null>(null)
  const lastQueuedSequence = useRef(-1)
  const dirty = Boolean(
    draft &&
    persistedDraft.current &&
    jobDraftChanged(
      withPersistedRevision(persistedDraft.current, 0),
      withPersistedRevision(draft, 0)
    )
  )
  const warning =
    dirty || saving
      ? '자동 저장이 끝나지 않았습니다. 이동하면 최근 변경사항이 사라질 수 있습니다.'
      : ''
  useNavigationWarning(warning)

  useEffect(() => {
    let active = true
    const isCurrentEditor = (): boolean =>
      active &&
      editorContext.current.generation === editorGeneration &&
      editorContext.current.identity === editorIdentity

    hydrated.current = false
    editSequence.current = 0
    persistedDraft.current = null
    persistedDrafts.current.delete(editorGeneration)
    pendingSaves.current.set(editorGeneration, 0)
    setSnapshot(null)
    setDraft(null)
    setSaving(false)
    setStaleConflict(false)
    setMessage('')
    setError('')
    void jobApi()
      .listJobData(version)
      .then((next) => {
        if (!isCurrentEditor()) return
        const savedDraft = next.drafts.find((candidate) => candidate.jobId === jobId)
        const job = next.jobs.find((candidate) => candidate.jobId === jobId) ?? null
        if (!job) {
          setSnapshot(next)
          setError('DB에 없는 직업은 편집 작업본에 저장할 수 없습니다.')
          return
        }
        if (!next.editorAvailable || !next.changeSetId) {
          setSnapshot(next)
          setError('현재 버전의 편집 작업본을 사용할 수 없습니다. DB 직업 정보만 볼 수 있습니다.')
          return
        }
        const representativeGroup = next.jobGroups.find(
          ({ representativeJobId }) => representativeJobId === jobId
        )
        const loaded = savedDraft ?? emptyJobDraft(job, representativeGroup?.classKey)
        persistedDrafts.current.set(editorGeneration, loaded)
        persistedDraft.current = loaded
        lastQueuedSequence.current = -1
        setSnapshot(next)
        setDraft(loaded)
        queueMicrotask(() => {
          if (isCurrentEditor()) hydrated.current = true
        })
      })
      .catch((caught: unknown) => {
        if (isCurrentEditor()) setError(getErrorMessage(caught))
      })
    return () => {
      active = false
    }
  }, [editorGeneration, editorIdentity, jobId, version])

  const save = useCallback(
    (candidate: JobDraft, sequence: number, announce: boolean): void => {
      const isCurrentEditor = (): boolean =>
        editorContext.current.generation === editorGeneration &&
        editorContext.current.identity === editorIdentity
      if (!isCurrentEditor()) return
      const validationErrors = validateJobDraft(candidate)
      if (validationErrors.length) {
        setError(validationErrors.join(' '))
        return
      }

      pendingSaves.current.set(
        editorGeneration,
        (pendingSaves.current.get(editorGeneration) ?? 0) + 1
      )
      setSaving(true)
      setError('')
      saveChain.current = saveChain.current.then(async () => {
        try {
          if (!isCurrentEditor()) return
          const revision =
            persistedDrafts.current.get(editorGeneration)?.revision ?? candidate.revision
          const requestDraft = jobDraftForSave(candidate, revision)
          if (!snapshot?.changeSetId)
            throw new Error('현재 버전의 편집 작업본을 사용할 수 없습니다.')
          const saved = await jobApi().saveJobDraft({
            version,
            expectedChangeSetId: snapshot.changeSetId,
            draft: requestDraft
          })
          if (!isCurrentEditor()) return
          persistedDrafts.current.set(editorGeneration, saved)
          persistedDraft.current = saved
          setDraft((current) => (current ? mergeSavedDraft(current, saved) : saved))
          setError('')
          if (announce && sequence === editSequence.current) {
            setMessage('작업본을 저장했습니다.')
          }
        } catch (caught) {
          if (!isCurrentEditor()) return
          const stale = isStaleJobDraftError(caught)
          setStaleConflict(stale)
          setError(
            stale
              ? '다른 변경으로 작업본 기준이 바뀌었습니다. 현재 입력은 유지되며 사용자 선택 전에는 자동 재시도하지 않습니다.'
              : `${getErrorMessage(caught)} 저장하기를 눌러 다시 시도하세요.`
          )
        } finally {
          const remaining = Math.max(0, (pendingSaves.current.get(editorGeneration) ?? 1) - 1)
          pendingSaves.current.set(editorGeneration, remaining)
          if (isCurrentEditor() && remaining === 0) setSaving(false)
        }
      })
    },
    [editorGeneration, editorIdentity, snapshot?.changeSetId, version]
  )

  useEffect(() => {
    if (
      !hydrated.current ||
      !dirty ||
      !draft ||
      error ||
      staleConflict ||
      !snapshot?.editorAvailable
    )
      return
    const sequence = editSequence.current
    if (lastQueuedSequence.current === sequence) return
    const timer = window.setTimeout(() => {
      if (lastQueuedSequence.current === sequence) return
      lastQueuedSequence.current = sequence
      save(draft, sequence, false)
    }, 700)
    return () => window.clearTimeout(timer)
  }, [dirty, draft, error, save, snapshot?.editorAvailable, staleConflict])

  const update = <K extends keyof JobDraft>(key: K, value: JobDraft[K]): void => {
    if (!draft) return
    editSequence.current += 1
    setMessage('')
    if (!staleConflict) setError('')
    setDraft({ ...draft, [key]: value })
  }

  const representativeGroups = useMemo(
    () =>
      snapshot?.jobGroups.filter(({ representativeJobId }) => representativeJobId === jobId) ?? [],
    [jobId, snapshot]
  )
  const options = useMemo<WeaponTypeOption[]>(() => {
    if (!snapshot || !draft) return []
    return snapshot.weaponTypes
  }, [draft, snapshot])

  const explicitSave = (): void => {
    if (!draft || !dirty || saving) return
    const errors = validateJobDraft(draft)
    if (errors.length) {
      setError(errors.join(' '))
      return
    }
    setError('')
    lastQueuedSequence.current = editSequence.current
    save(draft, editSequence.current, true)
  }

  const refreshLatest = async (retry: boolean): Promise<void> => {
    if (!draft) return
    if (!retry && !window.confirm('현재 입력을 버리고 최신 작업본을 불러올까요?')) return
    const generation = editorGeneration
    const identity = editorIdentity
    const isCurrentEditor = (): boolean =>
      editorContext.current.generation === generation && editorContext.current.identity === identity
    setSaving(true)
    try {
      const next = await jobApi().listJobData(version)
      if (!isCurrentEditor()) return
      const latest =
        next.drafts.find(({ jobId: candidateId }) => candidateId === jobId) ??
        emptyJobDraft(
          next.jobs.find(({ jobId: candidateId }) => candidateId === jobId)!,
          representativeGroups[0]?.classKey
        )
      if (!next.editorAvailable || !next.changeSetId)
        throw new Error('현재 버전의 편집 작업본을 사용할 수 없습니다.')
      setSnapshot(next)
      persistedDrafts.current.set(generation, latest)
      persistedDraft.current = latest
      setStaleConflict(false)
      setError('')
      if (retry) {
        const candidate = jobDraftForSave({ ...draft, jobName: latest.jobName }, latest.revision)
        const validationErrors = validateJobDraft(candidate)
        if (validationErrors.length) throw new Error(validationErrors.join(' '))
        setDraft(candidate)
        lastQueuedSequence.current = editSequence.current
        const saved = await jobApi().saveJobDraft({
          version,
          expectedChangeSetId: next.changeSetId,
          draft: candidate
        })
        if (!isCurrentEditor()) return
        persistedDrafts.current.set(generation, saved)
        persistedDraft.current = saved
        setDraft((current) => (current ? mergeSavedDraft(current, saved) : saved))
        setMessage('최신 기준으로 작업본을 저장했습니다.')
      } else {
        setDraft(latest)
        setMessage('최신 작업본을 불러왔습니다.')
      }
    } catch (caught) {
      if (!isCurrentEditor()) return
      setStaleConflict(isStaleJobDraftError(caught))
      setError(getErrorMessage(caught))
    } finally {
      if (isCurrentEditor()) setSaving(false)
    }
  }

  const cancelNavigation = (): void => {
    if (
      (dirty || saving) &&
      !window.confirm('자동 저장이 끝나지 않았습니다. 변경사항을 버리고 목록으로 돌아갈까요?')
    ) {
      return
    }
    navigate('/class')
  }

  if (!draft) {
    return (
      <div className="px-[42px] pt-[42px] text-body text-app-muted max-[1200px]:px-7 max-[767px]:px-4 max-[767px]:pt-6">
        {error ||
          (snapshot && !snapshot.editorAvailable
            ? '현재 버전의 편집 작업본을 사용할 수 없습니다. DB 직업 정보는 직업 정보 화면에서 볼 수 있습니다.'
            : '직업 작업본을 불러오는 중입니다.')}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[984px] px-[42px] pt-[42px] pb-24 max-[1200px]:px-7 max-[767px]:px-4 max-[767px]:pt-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-app-border pb-4">
        <div>
          <p className="m-0 text-caption font-bold tracking-eyebrow text-app-accent">
            JOB EDITOR · {version}
          </p>
          <h1 className="my-2 text-page-title font-bold tracking-page-title">
            {representativeGroups[0]?.representativeName ?? draft.jobName}
          </h1>
          <p className="m-0 text-small text-app-muted">
            변경사항은 편집 작업본에 자동 저장됩니다. raw 데이터와 DB는 변경하지 않습니다.
          </p>
        </div>
        <span className={`text-small ${dirty || saving ? 'text-app-warning' : 'text-app-accent'}`}>
          {saving
            ? '자동 저장 중...'
            : dirty
              ? '자동 저장 대기'
              : `저장됨 · revision ${draft.revision}`}
        </span>
      </header>

      {error && (
        <div
          className="mb-4 rounded-lg border border-app-danger-border bg-app-danger-bg p-3 text-small text-app-danger"
          role="alert"
        >
          {error}
        </div>
      )}
      {staleConflict && (
        <div
          className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-app-warning-border bg-app-warning-bg p-3 text-small text-app-warning"
          role="status"
        >
          <span>현재 입력을 유지했습니다.</span>
          <button
            className="action-secondary"
            disabled={saving}
            type="button"
            onClick={() => void refreshLatest(false)}
          >
            최신 작업본 불러오기
          </button>
          <button
            className="action-primary"
            disabled={saving}
            type="button"
            onClick={() => void refreshLatest(true)}
          >
            최신 기준으로 재시도
          </button>
        </div>
      )}
      {message && (
        <div
          className="mb-4 rounded-lg border border-app-accent-border bg-app-accent-bg p-3 text-small text-app-accent"
          role="status"
        >
          {message}
        </div>
      )}

      <section className="grid gap-3">
        <LabeledField
          label="jobID"
          className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 max-[480px]:grid-cols-[88px_minmax(0,1fr)]"
        >
          <input
            className="h-8 w-full max-w-[160px] rounded-md border border-app-border-strong bg-app-input px-3 font-mono text-body"
            readOnly
            value={draft.jobId}
          />
        </LabeledField>
        <LabeledField
          label="직업명"
          className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 max-[480px]:grid-cols-[88px_minmax(0,1fr)]"
        >
          <input
            className="h-8 w-full max-w-[320px] rounded-md border border-app-border-strong bg-app-surface px-3 text-body text-app-muted"
            readOnly
            value={representativeGroups[0]?.representativeName ?? draft.jobName}
          />
        </LabeledField>
        <LabeledField
          label="원본 직업명"
          className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 max-[480px]:grid-cols-[88px_minmax(0,1fr)]"
        >
          <input
            className="h-8 w-full max-w-[320px] min-w-0 rounded-md border border-app-border-strong bg-app-surface px-3 text-body text-app-muted"
            readOnly
            title="DB 원본 직업명은 편집 대상에서 제외됩니다"
            value={draft.jobName}
          />
        </LabeledField>
        <LabeledField
          label="직업 영문명"
          className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 max-[480px]:grid-cols-[88px_minmax(0,1fr)]"
        >
          <input
            className="h-8 w-full max-w-[320px] min-w-0 rounded-md border border-app-border-strong bg-app-input px-3 text-body"
            value={draft.englishName}
            onChange={(event) => update('englishName', event.target.value)}
          />
        </LabeledField>
        <LabeledField
          label="직업군"
          className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 max-[480px]:grid-cols-[88px_minmax(0,1fr)]"
        >
          <SelectControl
            label="직업군"
            value={draft.classGroup}
            options={classGroups}
            className="w-full max-w-[200px]"
            onChange={(value) => update('classGroup', value)}
          />
        </LabeledField>
        <LabeledField
          label="소속"
          className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 max-[480px]:grid-cols-[88px_minmax(0,1fr)]"
        >
          <SelectControl
            label="소속"
            value={draft.affiliation}
            options={affiliations}
            className="w-full max-w-[240px]"
            onChange={(value) => update('affiliation', value)}
          />
        </LabeledField>
        <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 max-[480px]:grid-cols-[88px_minmax(0,1fr)]">
          <span className="field-label">주스탯</span>
          <JobStatPicker
            label="주스탯"
            value={draft.mainStat}
            onChange={(value) => update('mainStat', value)}
          />
        </div>
        <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 max-[480px]:grid-cols-[88px_minmax(0,1fr)]">
          <span className="field-label">부스탯</span>
          <JobStatPicker
            label="부스탯"
            value={draft.subStat}
            onChange={(value) => update('subStat', value)}
          />
        </div>
      </section>

      <section className="mt-6 border-t border-app-border pt-5">
        <h2 className="section-title">전직 ID 연결</h2>
        <p className="mb-4 rounded-md border border-app-warning-border bg-app-warning-bg p-3 text-small text-app-warning">
          전직 연결은 현재 metadata 편집 대상에서 제외됩니다. DB 전직 트리를 읽기 전용으로
          표시합니다.
        </p>
        {representativeGroups.length > 0 ? (
          <div className="divide-y divide-app-border">
            {representativeGroups
              .flatMap((group) => group.advancements)
              .map((advancement) => (
                <div
                  className="grid grid-cols-[70px_100px_minmax(0,1fr)] gap-3 px-1 py-3 text-small"
                  key={`${advancement.stage}-${advancement.jobId}`}
                >
                  <span>{advancement.stage}차</span>
                  <code>{advancement.jobId}</code>
                  <span>{advancement.jobName}</span>
                </div>
              ))}
          </div>
        ) : (
          <p className="m-0 text-small text-app-muted">연결된 DB 전직 정보가 없습니다.</p>
        )}
      </section>

      <div className="mt-6 grid gap-4">
        <p className="rounded-md border border-app-warning-border bg-app-warning-bg p-3 text-small text-app-warning">
          새 무기 후보 등록은 현재 metadata 편집 대상에서 제외됩니다. 기존 전역 무기 유형만 선택할
          수 있습니다.
        </p>
        <WeaponPicker
          label="주무기"
          category="weapon"
          selected={draft.primaryWeapons}
          options={options}
          disabled={saving || staleConflict}
          onChange={(keys) => update('primaryWeapons', keys)}
        />
        <WeaponPicker
          label="보조무기"
          category="subWeapon"
          selected={draft.secondaryWeapons}
          options={options}
          disabled={saving || staleConflict}
          onChange={(keys) => update('secondaryWeapons', keys)}
        />
      </div>

      <section className="mt-6 border-t border-app-border pt-5" aria-label="스킬 정보">
        <h2 className="section-title">스킬 정보</h2>
        <div className="h-28" />
      </section>

      <footer className="fixed right-0 bottom-0 left-[244px] z-20 flex items-center justify-end gap-2 border-t border-app-border bg-app-header px-7 py-3 backdrop-blur-xl max-[767px]:left-0">
        <button
          className="action-secondary"
          disabled={saving}
          type="button"
          onClick={cancelNavigation}
        >
          목록으로
        </button>
        <button
          className="action-primary"
          disabled={!dirty || saving || staleConflict || !snapshot?.editorAvailable}
          type="button"
          onClick={explicitSave}
        >
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </footer>
    </div>
  )
}
