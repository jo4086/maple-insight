import { ChevronDown, ChevronUp, FilePlus, Plus, Search, X } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'

import type {
  JobDataSnapshot,
  JobDraft,
  JobSummary,
  NewWeaponType,
  WeaponTypeOption
} from '../../../../shared/job-data'
import { getErrorMessage } from '../../shared/lib/error-message'

import {
  decodeJobId,
  emptyJobDraft,
  jobDraftChanged,
  mergeSavedDraft,
  validateJobDraft,
  withPersistedRevision,
  validateNewWeaponType,
  weaponClassGroups,
  weaponOptionLabel
} from './job-model'
import { JobStatPicker } from './JobStatPicker'
import { useNavigationWarning } from './use-navigation-warning'

type JobApi = typeof window.api & {
  listJobData: (version: string) => Promise<JobDataSnapshot>
  saveJobDraft: (request: { version: string; draft: JobDraft }) => Promise<JobDraft>
}

type NewJobLocation = { newJob?: JobSummary }

const jobApi = (): JobApi => window.api as JobApi
const classGroups = ['전사', '마법사', '궁수', '도적', '해적']
const affiliations = ['모험가', '시그너스 기사단', '영웅', '레지스탕스', '노바', '레프', '아니마']

function blankWeapon(category: 'weapon' | 'subWeapon'): NewWeaponType {
  return {
    key: crypto.randomUUID(),
    category,
    part: '',
    englishName: '',
    classGroupKeys: [],
    handType: null,
    weaponConstant: null
  }
}

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
  onChange,
  onStage
}: {
  label: string
  category: 'weapon' | 'subWeapon'
  selected: string[]
  options: WeaponTypeOption[]
  onChange: (keys: string[]) => void
  onStage: (weapon: NewWeaponType) => void
}): React.JSX.Element {
  const listboxId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const [query, setQuery] = useState('')
  const [chooserOpen, setChooserOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [weapon, setWeapon] = useState(() => blankWeapon(category))
  const [errors, setErrors] = useState<string[]>([])
  const available = options.filter(
    (option) =>
      option.category === category &&
      !selected.includes(option.key) &&
      `${option.key} ${option.part}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())
  )

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

  const stage = (): void => {
    const validation = validateNewWeaponType(weapon, options, [])
    if (validation.length) {
      setErrors(validation)
      return
    }
    onStage(weapon)
    setWeapon(blankWeapon(category))
    setErrors([])
    setExpanded(false)
  }

  const energySword = /energy[- ]?sword|에너지\s*소드/i.test(`${weapon.part} ${weapon.englishName}`)
  const activeOption = available[activeIndex]

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
              className="border-0 bg-transparent text-inherit"
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
                } else if (event.key === 'Home' && available.length) {
                  event.preventDefault()
                  setActiveIndex(0)
                } else if (event.key === 'End' && available.length) {
                  event.preventDefault()
                  setActiveIndex(available.length - 1)
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
            className="flex h-9 items-center gap-1.5 rounded-md border border-app-border-strong bg-app-input px-3 text-small font-semibold"
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
        <button
          aria-expanded={expanded}
          className="flex h-9 items-center gap-1.5 rounded-md border border-app-border-strong bg-app-input px-3 text-small font-semibold"
          type="button"
          onClick={() => setExpanded((open) => !open)}
        >
          <FilePlus aria-hidden="true" size={15} /> 새 무기 등록
          {expanded ? (
            <ChevronUp aria-hidden="true" size={14} />
          ) : (
            <ChevronDown aria-hidden="true" size={14} />
          )}
        </button>
      </div>
      {expanded && (
        <div className="mt-4 grid gap-3 border-t border-app-border pt-4">
          {errors.length > 0 && (
            <ul className="m-0 rounded-md bg-app-danger-bg p-3 pl-7 text-small text-app-danger">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
          <div className="grid grid-cols-2 gap-3 max-[700px]:grid-cols-1">
            <LabeledField label="부위">
              <input
                className="h-9 rounded-md border border-app-border-strong bg-app-input px-3 text-body"
                value={weapon.part}
                onChange={(event) => setWeapon({ ...weapon, part: event.target.value })}
              />
            </LabeledField>
            <LabeledField label="영문 이름">
              <input
                className="h-9 rounded-md border border-app-border-strong bg-app-input px-3 text-body"
                value={weapon.englishName}
                onChange={(event) => setWeapon({ ...weapon, englishName: event.target.value })}
              />
            </LabeledField>
            {category === 'weapon' && (
              <>
                <LabeledField label="한손/두손">
                  <span className="group relative block w-full max-w-[180px]">
                    <select
                      aria-label="한손/두손"
                      className="h-9 w-full appearance-none rounded-md border border-app-border-strong bg-app-input pr-9 pl-3 text-body"
                      value={weapon.handType ?? ''}
                      onChange={(event) =>
                        setWeapon({ ...weapon, handType: event.target.value || null })
                      }
                    >
                      <option value="">선택</option>
                      <option value="oneHanded">한손</option>
                      <option value="twoHanded">두손</option>
                    </select>
                    <ChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-app-muted group-hover:text-app-text group-focus-within:text-app-text"
                      size={15}
                    />
                  </span>
                </LabeledField>
                <LabeledField label="무기 상수">
                  <input
                    className="h-9 rounded-md border border-app-border-strong bg-app-input px-3 text-body"
                    inputMode="decimal"
                    value={weapon.weaponConstant ?? ''}
                    onChange={(event) =>
                      setWeapon({ ...weapon, weaponConstant: event.target.value || null })
                    }
                  />
                </LabeledField>
              </>
            )}
          </div>
          <fieldset className="border-0 p-0">
            <legend className="field-label mb-2">
              직업군 {energySword ? '(도적 + 해적)' : '(하나 선택)'}
            </legend>
            <div className="flex flex-wrap gap-2">
              {weaponClassGroups.map((group) => {
                const active = weapon.classGroupKeys.includes(group.key)
                return (
                  <button
                    className={`rounded-md border px-3 py-1.5 text-small ${active ? 'border-app-accent bg-app-accent-bg text-app-accent' : 'border-app-border bg-app-input text-app-muted'}`}
                    key={group.key}
                    type="button"
                    onClick={() =>
                      setWeapon({
                        ...weapon,
                        classGroupKeys: energySword
                          ? active
                            ? weapon.classGroupKeys.filter((value) => value !== group.key)
                            : [...weapon.classGroupKeys, group.key]
                          : [group.key]
                      })
                    }
                  >
                    {group.label}
                  </button>
                )
              })}
            </div>
          </fieldset>
          <button className="action-primary justify-self-end" type="button" onClick={stage}>
            작업본에 옵션 추가
          </button>
        </div>
      )}
    </section>
  )
}

export function JobEditView({ version }: { version: string }): React.JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const { jobId: encodedJobId } = useParams()
  const jobId = decodeJobId(encodedJobId)
  const locationJob = (location.state as NewJobLocation | null)?.newJob
  const [snapshot, setSnapshot] = useState<JobDataSnapshot | null>(null)
  const [draft, setDraft] = useState<JobDraft | null>(null)
  const [selectedAdvancementJobIds, setSelectedAdvancementJobIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const hydrated = useRef(false)
  const editSequence = useRef(0)
  const saveChain = useRef<Promise<void>>(Promise.resolve())
  const pendingSaves = useRef(0)
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
    hydrated.current = false
    setSnapshot(null)
    setDraft(null)
    setError('')
    void jobApi()
      .listJobData(version)
      .then((next) => {
        if (!active) return
        const savedDraft = next.drafts.find((candidate) => candidate.jobId === jobId)
        const job =
          next.jobs.find((candidate) => candidate.jobId === jobId) ??
          (savedDraft ? { jobId: savedDraft.jobId, jobName: savedDraft.jobName } : null) ??
          (locationJob?.jobId === jobId ? locationJob : null)
        if (!job) {
          setError('직업을 찾을 수 없습니다.')
          return
        }
        const representativeGroup = next.jobGroups.find(
          ({ representativeJobId }) => representativeJobId === jobId
        )
        const loaded = savedDraft ?? emptyJobDraft(job, representativeGroup?.classKey)
        const defaultAdvancementJobIds = [
          ...new Set(
            next.jobGroups
              .filter(({ representativeJobId }) => representativeJobId === jobId)
              .flatMap(({ advancements }) => advancements.map(({ jobId }) => jobId))
          )
        ]
        persistedDraft.current = loaded
        lastQueuedSequence.current = -1
        setSnapshot(next)
        setDraft(loaded)
        setSelectedAdvancementJobIds(savedDraft?.advancementJobIds ?? defaultAdvancementJobIds)
        queueMicrotask(() => {
          hydrated.current = true
        })
      })
      .catch((caught: unknown) => {
        if (active) setError(getErrorMessage(caught))
      })
    return () => {
      active = false
    }
  }, [jobId, locationJob, version])

  const save = useCallback(
    (candidate: JobDraft, sequence: number, announce: boolean): void => {
      pendingSaves.current += 1
      setSaving(true)
      setError('')
      saveChain.current = saveChain.current.then(async () => {
        try {
          const revision = persistedDraft.current?.revision ?? candidate.revision
          const requestDraft = withPersistedRevision(candidate, revision)
          const saved = await jobApi().saveJobDraft({ version, draft: requestDraft })
          persistedDraft.current = saved
          setDraft((current) => (current ? mergeSavedDraft(current, saved) : saved))
          setError('')
          if (announce && sequence === editSequence.current) {
            setMessage('작업본을 저장했습니다.')
          }
        } catch (caught) {
          setError(`${getErrorMessage(caught)} 저장하기를 눌러 다시 시도하세요.`)
        } finally {
          pendingSaves.current -= 1
          if (pendingSaves.current === 0) setSaving(false)
        }
      })
    },
    [version]
  )

  useEffect(() => {
    if (!hydrated.current || !dirty || !draft || error) return
    const sequence = editSequence.current
    if (lastQueuedSequence.current === sequence) return
    const timer = window.setTimeout(() => {
      if (lastQueuedSequence.current === sequence) return
      lastQueuedSequence.current = sequence
      save(draft, sequence, false)
    }, 700)
    return () => window.clearTimeout(timer)
  }, [dirty, draft, error, save])

  const update = <K extends keyof JobDraft>(key: K, value: JobDraft[K]): void => {
    if (!draft) return
    editSequence.current += 1
    setMessage('')
    setError('')
    setDraft({ ...draft, [key]: value })
  }

  const representativeGroups = useMemo(
    () =>
      snapshot?.jobGroups.filter(({ representativeJobId }) => representativeJobId === jobId) ?? [],
    [jobId, snapshot]
  )
  const actualAdvancementJobIds = useMemo(
    () =>
      new Set(
        representativeGroups.flatMap(({ advancements }) => advancements.map(({ jobId }) => jobId))
      ),
    [representativeGroups]
  )

  const options = useMemo<WeaponTypeOption[]>(() => {
    if (!snapshot || !draft) return []
    return [
      ...snapshot.weaponTypes,
      ...draft.newWeaponTypes.map((weapon) => ({
        key: weapon.key,
        category: weapon.category,
        part: weapon.part,
        classGroupKeys: weapon.classGroupKeys,
        handType: weapon.handType,
        weaponConstant: weapon.weaponConstant
      }))
    ]
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

  const linkAdvancementJobIds = (): void => {
    if (!draft) return
    if (
      !actualAdvancementJobIds.has(draft.jobId) ||
      !selectedAdvancementJobIds.includes(draft.jobId)
    ) {
      setError('전직 ID 연결에는 대표 직업 ID가 포함되어야 합니다.')
      return
    }
    if (selectedAdvancementJobIds.some((id) => !actualAdvancementJobIds.has(id))) {
      setError('현재 전직 그룹에 없는 ID는 연결할 수 없습니다.')
      return
    }
    update('advancementJobIds', selectedAdvancementJobIds)
    setMessage('전직 ID 연결을 작업본에 자동 저장합니다.')
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
        {error || '직업 작업본을 불러오는 중입니다.'}
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
            className="h-8 w-full max-w-[320px] min-w-0 rounded-md border border-app-border-strong bg-app-input px-3 text-body"
            value={draft.jobName}
            onChange={(event) => update('jobName', event.target.value)}
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
        {representativeGroups.length > 0 ? (
          <>
            <p className="mb-4 text-small text-app-muted">
              현재 버전 DB의 전직 트리입니다. 같은 대표 작업본에 연결할 실제 ID만 선택하세요.
            </p>
            <div className="divide-y divide-app-border">
              {representativeGroups.map((group) => (
                <fieldset className="border-0 px-0 py-5" key={group.classKey}>
                  <legend className="mb-2 text-body font-bold text-app-text">
                    {group.representativeName}
                  </legend>
                  <div className="divide-y divide-app-border">
                    {group.advancements.map((advancement, index) => {
                      const inputId = `advancement-${group.classKey}-${index}-${advancement.jobId}`
                      const representative = advancement.jobId === draft.jobId
                      return (
                        <label
                          className="grid grid-cols-[auto_70px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 px-1 py-3 text-small max-[700px]:grid-cols-[auto_56px_minmax(0,1fr)]"
                          htmlFor={inputId}
                          key={inputId}
                        >
                          <input
                            checked={selectedAdvancementJobIds.includes(advancement.jobId)}
                            disabled={representative}
                            id={inputId}
                            type="checkbox"
                            onChange={(event) =>
                              setSelectedAdvancementJobIds((current) =>
                                event.target.checked
                                  ? [...new Set([...current, advancement.jobId])]
                                  : current.filter((id) => id !== advancement.jobId)
                              )
                            }
                          />
                          <span className="font-semibold text-app-muted">
                            {advancement.stage}차
                          </span>
                          <span className="font-mono text-app-text">{advancement.jobId}</span>
                          <span className="grid gap-1 text-app-text max-[700px]:col-start-3">
                            {advancement.stage === 4 && (
                              <span>
                                <span className="mr-2 text-caption text-app-muted">대표 이름</span>
                                {group.representativeName}
                              </span>
                            )}
                            <span>
                              <span className="mr-2 text-caption text-app-muted">원본 이름</span>
                              {advancement.jobName}
                              {advancement.requiresReview ? ' · 검토 필요' : ''}
                            </span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button className="action-secondary" type="button" onClick={linkAdvancementJobIds}>
                전직 ID 연결
              </button>
            </div>
          </>
        ) : (
          <p className="m-0 text-small text-app-muted">
            이 직업은 현재 버전의 전직 그룹이 없습니다. 신규·미분류 직업은 가짜 연결을 만들지 않고
            기존 기본 정보 편집을 유지하며 수동 검토해야 합니다.
          </p>
        )}
      </section>

      <div className="mt-6 grid gap-4">
        <WeaponPicker
          label="주무기"
          category="weapon"
          selected={draft.primaryWeapons}
          options={options}
          onChange={(keys) => update('primaryWeapons', keys)}
          onStage={(weapon) => {
            editSequence.current += 1
            setError('')
            setDraft({
              ...draft,
              newWeaponTypes: [...draft.newWeaponTypes, weapon],
              primaryWeapons: [...draft.primaryWeapons, weapon.key]
            })
          }}
        />
        <WeaponPicker
          label="보조무기"
          category="subWeapon"
          selected={draft.secondaryWeapons}
          options={options}
          onChange={(keys) => update('secondaryWeapons', keys)}
          onStage={(weapon) => {
            editSequence.current += 1
            setError('')
            setDraft({
              ...draft,
              newWeaponTypes: [...draft.newWeaponTypes, weapon],
              secondaryWeapons: [...draft.secondaryWeapons, weapon.key]
            })
          }}
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
          disabled={!dirty || saving}
          type="button"
          onClick={explicitSave}
        >
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </footer>
    </div>
  )
}
