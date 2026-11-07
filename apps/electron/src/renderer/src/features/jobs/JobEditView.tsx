import { ChevronDown, ChevronUp, Plus, Search, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  mergeSavedDraft,
  validateJobDraft,
  withPersistedRevision,
  validateNewWeaponType,
  weaponClassGroups,
  weaponOptionLabel
} from './job-model'
import { useNavigationWarning } from './use-navigation-warning'

type JobApi = typeof window.api & {
  listJobData: (version: string) => Promise<JobDataSnapshot>
  saveJobDraft: (request: { version: string; draft: JobDraft }) => Promise<JobDraft>
}

type NewJobLocation = { newJob?: JobSummary }

const jobApi = (): JobApi => window.api as JobApi
const classGroups = ['전사', '마법사', '궁수', '도적', '해적']
const affiliations = ['모험가', '시그너스 기사단', '영웅', '레지스탕스', '노바', '레프', '아니마']
const stats = ['STR', 'DEX', 'INT', 'LUK']

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
  children
}: {
  label: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <label className="grid gap-2">
      <span className="field-label">{label}</span>
      {children}
    </label>
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
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [weapon, setWeapon] = useState(() => blankWeapon(category))
  const [errors, setErrors] = useState<string[]>([])
  const available = options.filter(
    (option) =>
      option.category === category &&
      !selected.includes(option.key) &&
      `${option.key} ${option.part}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())
  )

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

  return (
    <section className="rounded-lg border border-app-border bg-app-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="m-0 text-body font-bold">{label}</h3>
        <button
          aria-expanded={expanded}
          className="flex items-center gap-1 border-0 bg-transparent text-small font-semibold text-app-accent"
          type="button"
          onClick={() => setExpanded((open) => !open)}
        >
          <Plus size={14} /> 새 무기 유형 등록{' '}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {selected.map((key) => (
          <span
            className="flex items-center gap-1 rounded-full bg-app-accent-bg px-3 py-1 text-small text-app-accent"
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
      </div>
      <label className="relative block">
        <span className="sr-only">{label} 검색</span>
        <input
          className="h-10 w-full rounded-md border border-app-border-strong bg-app-input pr-10 pl-3 text-body"
          placeholder="기존 무기 유형 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Search className="absolute top-3 right-3 text-app-muted" size={15} />
      </label>
      {query && (
        <div className="mt-2 max-h-36 overflow-y-auto rounded-md border border-app-border bg-app-input p-1">
          {available.length ? (
            available.map((option) => (
              <button
                className="block w-full rounded px-3 py-2 text-left text-small hover:bg-app-surface-hover"
                key={option.key}
                type="button"
                onClick={() => {
                  onChange([...selected, option.key])
                  setQuery('')
                }}
              >
                <strong>{weaponOptionLabel(option)}</strong>
              </button>
            ))
          ) : (
            <p className="m-2 text-small text-app-muted">검색 결과가 없습니다.</p>
          )}
        </div>
      )}
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
                  <select
                    className="h-9 rounded-md border border-app-border-strong bg-app-input px-3 text-body"
                    value={weapon.handType ?? ''}
                    onChange={(event) =>
                      setWeapon({ ...weapon, handType: event.target.value || null })
                    }
                  >
                    <option value="">선택</option>
                    <option value="oneHanded">한손</option>
                    <option value="twoHanded">두손</option>
                  </select>
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
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const hydrated = useRef(false)
  const editSequence = useRef(0)
  const saveChain = useRef<Promise<void>>(Promise.resolve())
  const pendingSaves = useRef(0)
  const persistedRevision = useRef(0)
  const lastQueuedSequence = useRef(-1)
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
        const loaded = savedDraft ?? emptyJobDraft(job)
        persistedRevision.current = loaded.revision
        lastQueuedSequence.current = -1
        setSnapshot(next)
        setDraft(loaded)
        setDirty(false)
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
          const requestDraft = withPersistedRevision(candidate, persistedRevision.current)
          const saved = await jobApi().saveJobDraft({ version, draft: requestDraft })
          persistedRevision.current = saved.revision
          setDraft((current) => (current ? mergeSavedDraft(current, saved) : saved))
          if (sequence === editSequence.current) setDirty(false)
          if (announce) setMessage('작업본을 저장했습니다.')
        } catch (caught) {
          setDirty(true)
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
    setDirty(true)
  }

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
    if (!draft) return
    const errors = validateJobDraft(draft)
    if (errors.length) {
      setError(errors.join(' '))
      return
    }
    setError('')
    save(draft, editSequence.current, true)
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
      <header className="mb-7 flex flex-wrap items-end justify-between gap-3 border-b border-app-border pb-5">
        <div>
          <p className="m-0 text-caption font-bold tracking-eyebrow text-app-accent">
            JOB EDITOR · {version}
          </p>
          <h1 className="my-2 text-page-title font-bold tracking-page-title">{draft.jobName}</h1>
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

      <section className="grid grid-cols-2 gap-5 max-[700px]:grid-cols-1">
        <LabeledField label="jobID">
          <input
            className="h-10 rounded-md border border-app-border-strong bg-app-input px-3 font-mono text-body"
            readOnly
            value={draft.jobId}
          />
        </LabeledField>
        <LabeledField label="직업 이름">
          <input
            className="h-10 rounded-md border border-app-border-strong bg-app-input px-3 text-body"
            value={draft.jobName}
            onChange={(event) => update('jobName', event.target.value)}
          />
        </LabeledField>
        <LabeledField label="영문 이름">
          <input
            className="h-10 rounded-md border border-app-border-strong bg-app-input px-3 text-body"
            value={draft.englishName}
            onChange={(event) => update('englishName', event.target.value)}
          />
        </LabeledField>
        <LabeledField label="직업군">
          <select
            className="h-10 rounded-md border border-app-border-strong bg-app-input px-3 text-body"
            value={draft.classGroup}
            onChange={(event) => update('classGroup', event.target.value)}
          >
            <option value="">선택</option>
            {classGroups.map((group) => (
              <option key={group}>{group}</option>
            ))}
          </select>
        </LabeledField>
        <LabeledField label="소속">
          <select
            className="h-10 rounded-md border border-app-border-strong bg-app-input px-3 text-body"
            value={draft.affiliation}
            onChange={(event) => update('affiliation', event.target.value)}
          >
            <option value="">선택</option>
            {affiliations.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </LabeledField>
        <LabeledField label="주스탯">
          <select
            className="h-10 rounded-md border border-app-border-strong bg-app-input px-3 text-body"
            value={draft.mainStat}
            onChange={(event) => update('mainStat', event.target.value)}
          >
            <option value="">선택</option>
            {stats.map((stat) => (
              <option key={stat}>{stat}</option>
            ))}
          </select>
        </LabeledField>
        <LabeledField label="부스탯">
          <select
            className="h-10 rounded-md border border-app-border-strong bg-app-input px-3 text-body"
            value={draft.subStat}
            onChange={(event) => update('subStat', event.target.value)}
          >
            <option value="">선택</option>
            {stats.map((stat) => (
              <option key={stat}>{stat}</option>
            ))}
          </select>
        </LabeledField>
      </section>

      <div className="mt-8 grid gap-5">
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
            setDirty(true)
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
            setDirty(true)
          }}
        />
      </div>

      <section className="mt-8 border-t border-app-border pt-6" aria-label="스킬 정보">
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
        <button className="action-primary" disabled={saving} type="button" onClick={explicitSave}>
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </footer>
    </div>
  )
}
