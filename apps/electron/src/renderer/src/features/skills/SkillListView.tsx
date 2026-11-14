import { ChevronDown, ChevronRight, Image as ImageIcon, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'

import type { JobDataSnapshot, JobGroup } from '../../../../shared/job-data'
import type { SkillSummary } from '../../../../shared/skill-data'
import { getErrorMessage } from '../../shared/lib/error-message'

const pageSize = 10

function stages(group: JobGroup): string[] {
  return [...new Set([...group.advancements.map(({ stage }) => String(stage)), '5', '6'])].sort(
    (a, b) => Number(a) - Number(b)
  )
}

function stageLabel(stage: string): string {
  return stage === '0' ? '0차' : `${stage}차`
}

export function SkillListView({ version }: { version: string }): React.JSX.Element {
  const [params, setParams] = useSearchParams()
  const [jobs, setJobs] = useState<JobDataSnapshot | null>(null)
  const [skills, setSkills] = useState<SkillSummary[]>([])
  const [jobError, setJobError] = useState('')
  const [skillError, setSkillError] = useState('')
  const [loadingSkills, setLoadingSkills] = useState(false)
  const [jobSearch, setJobSearch] = useState('')
  const [skillSearch, setSkillSearch] = useState('')
  const [selectedSkillId, setSelectedSkillId] = useState('')
  const [page, setPage] = useState(1)
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)

  const selectedGroup = useMemo(() => {
    if (!jobs) return null
    return (
      jobs.jobGroups.find((group) => group.representativeJobId === params.get('jobId')) ??
      jobs.jobGroups[0] ??
      null
    )
  }, [jobs, params])
  const selectedStage = params.get('stage') ?? 'all'
  useEffect(() => {
    setExpandedJobId(selectedGroup?.representativeJobId ?? null)
  }, [selectedGroup?.representativeJobId])
  const availableStages = selectedGroup ? stages(selectedGroup) : []
  const filteredSkills = useMemo(() => {
    if (!selectedGroup) return []
    const matchingJobIds = new Set(
      selectedStage === 'all'
        ? selectedGroup.advancements.map(({ jobId }) => jobId)
        : selectedGroup.advancements
            .filter(({ stage }) => String(stage) === selectedStage)
            .map(({ jobId }) => jobId)
    )
    const query = skillSearch.trim().toLocaleLowerCase()
    return skills.filter(
      (skill) =>
        matchingJobIds.has(skill.jobId) &&
        (!query ||
          skill.skillId.includes(query) ||
          skill.skillName.toLocaleLowerCase().includes(query))
    )
  }, [selectedGroup, selectedStage, skillSearch, skills])
  const pageCount = Math.max(1, Math.ceil(filteredSkills.length / pageSize))
  const visibleSkills = filteredSkills.slice((page - 1) * pageSize, page * pageSize)
  const selectedSkill =
    filteredSkills.find((skill) => skill.skillId === selectedSkillId) ?? filteredSkills[0] ?? null

  useEffect(() => {
    let active = true
    setJobs(null)
    setJobError('')
    void window.api.listJobData(version).then(
      (result) => {
        if (active) setJobs(result)
      },
      (error: unknown) => {
        if (active) setJobError(getErrorMessage(error))
      }
    )
    return () => {
      active = false
    }
  }, [version])

  useEffect(() => {
    let active = true
    setSkills([])
    setSkillError('')
    setLoadingSkills(Boolean(selectedGroup))
    if (selectedGroup) {
      void window.api
        .listSkillData({
          version,
          jobIds: [...new Set(selectedGroup.advancements.map(({ jobId }) => jobId))]
        })
        .then(
          (result) => {
            if (active) setSkills(result)
          },
          (error: unknown) => {
            if (active) setSkillError(getErrorMessage(error))
          }
        )
        .finally(() => {
          if (active) setLoadingSkills(false)
        })
    }
    return () => {
      active = false
    }
  }, [selectedGroup, version])

  useEffect(() => {
    setPage(1)
    setSelectedSkillId('')
  }, [selectedGroup, selectedStage, skillSearch])

  const selectGroup = (group: JobGroup, stage = 'all'): void => {
    const next = new URLSearchParams()
    next.set('jobId', group.representativeJobId)
    if (stage !== 'all') next.set('stage', stage)
    setParams(next)
  }

  return (
    <div className="grid min-h-[calc(100vh-65px)] grid-cols-[220px_minmax(360px,1fr)_310px] border-t border-app-border max-[1199px]:grid-cols-[190px_minmax(0,1fr)] max-[767px]:grid-cols-1">
      <aside
        aria-label="직업 선택"
        className="flex min-w-0 flex-col border-r border-app-border p-4 max-[767px]:border-r-0 max-[767px]:border-b"
      >
        <h1 className="m-0 text-body font-bold">직업 선택</h1>
        <label className="relative mt-4 block">
          <span className="sr-only">직업 검색</span>
          <input
            className="h-9 w-full rounded-lg border border-app-border-strong bg-app-input pr-9 pl-3 text-small"
            placeholder="직업 검색..."
            value={jobSearch}
            onChange={(event) => setJobSearch(event.target.value)}
          />
          <Search
            aria-hidden="true"
            className="absolute top-2.5 right-3 text-app-muted"
            size={15}
          />
        </label>
        {jobError && (
          <p className="text-small text-app-danger" role="alert">
            {jobError}
          </p>
        )}
        {!jobs && !jobError && (
          <p className="text-small text-app-muted">직업을 불러오는 중입니다.</p>
        )}
        <div className="mt-4 grid max-h-[calc(100vh-220px)] content-start gap-1 overflow-y-auto max-[767px]:max-h-52">
          {jobs?.jobGroups
            .filter(
              (group) =>
                group.representativeName
                  .toLocaleLowerCase()
                  .includes(jobSearch.toLocaleLowerCase()) ||
                group.representativeJobId.includes(jobSearch)
            )
            .map((group) => (
              <div key={group.representativeJobId}>
                <button
                  aria-controls={
                    selectedGroup?.representativeJobId === group.representativeJobId
                      ? `skill-job-${group.representativeJobId}`
                      : undefined
                  }
                  aria-current={
                    selectedGroup?.representativeJobId === group.representativeJobId
                      ? 'true'
                      : undefined
                  }
                  aria-expanded={expandedJobId === group.representativeJobId}
                  className={`flex w-full items-center gap-2 rounded-lg border-0 px-2 py-2 text-left text-small ${selectedGroup?.representativeJobId === group.representativeJobId ? 'bg-app-accent-bg text-app-text' : 'bg-transparent text-app-muted hover:bg-app-surface-hover'}`}
                  type="button"
                  onClick={() => {
                    if (selectedGroup?.representativeJobId === group.representativeJobId) {
                      setExpandedJobId((current) =>
                        current === group.representativeJobId ? null : group.representativeJobId
                      )
                    } else {
                      selectGroup(group)
                    }
                  }}
                >
                  {expandedJobId === group.representativeJobId ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                  <span className="min-w-0 truncate">{group.representativeName}</span>
                </button>
                {selectedGroup?.representativeJobId === group.representativeJobId && (
                  <div
                    className="ml-4 border-l border-app-border pl-2"
                    hidden={expandedJobId !== group.representativeJobId}
                    id={`skill-job-${group.representativeJobId}`}
                  >
                    {group.advancements.map((advancement) => (
                      <button
                        className={`block w-full rounded px-2 py-1 text-left text-caption ${selectedStage === String(advancement.stage) ? 'bg-app-accent-bg text-app-accent' : 'text-app-muted hover:text-app-text'}`}
                        key={`${advancement.stage}-${advancement.jobId}`}
                        type="button"
                        onClick={() => selectGroup(group, String(advancement.stage))}
                      >
                        {stageLabel(String(advancement.stage))} ·{' '}
                        {advancement.displayName || advancement.jobName || group.representativeName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </aside>

      <section aria-label="스킬 목록" className="min-w-0 p-4 max-[1199px]:border-r-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-app-border pb-4">
          <strong className="mr-2 text-[18px] text-app-text">
            {selectedGroup?.representativeName ?? '스킬 목록'}
          </strong>
          <span className="text-caption text-app-muted">{version || '버전 미선택'}</span>
        </div>
        <div
          aria-label="차수 필터"
          className="flex flex-wrap gap-1 border-b border-app-border py-4"
        >
          {['all', ...availableStages].map((stage) => (
            <button
              aria-pressed={selectedStage === stage}
              className={`rounded-md border px-3 py-1.5 text-small font-semibold ${selectedStage === stage ? 'border-app-accent bg-app-accent text-app-accent-contrast' : 'border-app-border-strong bg-app-input text-app-muted hover:text-app-text'}`}
              key={stage}
              type="button"
              onClick={() => selectedGroup && selectGroup(selectedGroup, stage)}
            >
              {stage === 'all' ? '전체' : stageLabel(stage)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <strong className="text-body">
            스킬 목록 <span className="text-app-muted">총 {filteredSkills.length}개</span>
          </strong>
          <label className="relative block min-w-[200px] flex-1 max-w-[280px]">
            <span className="sr-only">스킬명 또는 스킬 ID 검색</span>
            <input
              className="h-9 w-full rounded-lg border border-app-border-strong bg-app-input pr-9 pl-3 text-small"
              placeholder="스킬명 / 스킬ID 검색..."
              value={skillSearch}
              onChange={(event) => setSkillSearch(event.target.value)}
            />
            <Search
              aria-hidden="true"
              className="absolute top-2.5 right-3 text-app-muted"
              size={15}
            />
          </label>
        </div>
        {skillError && (
          <p className="text-small text-app-danger" role="alert">
            {skillError}
          </p>
        )}
        {loadingSkills && <p className="text-small text-app-muted">스킬을 불러오는 중입니다.</p>}
        {!loadingSkills && !skillError && (
          <div className="-mr-4 overflow-x-auto">
            <table className="w-full min-w-[680px] table-fixed border-collapse text-left text-small">
              <colgroup>
                <col className="w-[96px]" />
                <col className="w-[64px]" />
                <col />
                <col className="w-[170px]" />
                <col className="w-[80px]" />
                <col className="w-[64px]" />
              </colgroup>
              <thead className="bg-app-surface-2 text-app-muted">
                <tr>
                  <th className="px-1 py-2">스킬 ID</th>
                  <th className="px-0 py-2 text-center">아이콘</th>
                  <th className="px-3 py-2">스킬명</th>
                  <th className="px-3 py-2">차수 · 직업</th>
                  <th className="px-0 py-2 text-center">타입</th>
                  <th className="px-0 py-2 text-center">최대 레벨</th>
                </tr>
              </thead>
              <tbody>
                {visibleSkills.map((skill) => {
                  const job = selectedGroup?.advancements.find(({ jobId }) => jobId === skill.jobId)
                  return (
                    <tr
                      className={`border-b border-app-border ${selectedSkill?.skillId === skill.skillId ? 'bg-app-accent-bg' : 'hover:bg-app-surface-hover'}`}
                      key={skill.skillId}
                    >
                      <td
                        className="truncate px-1 py-3 font-mono text-[10px]"
                        title={skill.skillId}
                      >
                        {skill.skillId}
                      </td>
                      <td className="px-0 py-2 text-center">
                        <span
                          aria-label="스킬 이미지 미등록"
                          className="mx-auto grid h-7 w-7 place-items-center rounded border border-app-border-strong bg-app-surface-2 text-app-muted"
                          title="스킬 이미지 연결 예정"
                        >
                          <ImageIcon aria-hidden="true" size={15} />
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold">
                        <button
                          aria-current={
                            selectedSkill?.skillId === skill.skillId ? 'true' : undefined
                          }
                          className="block w-full truncate border-0 bg-transparent p-0 text-left text-inherit hover:text-app-accent"
                          type="button"
                          onClick={() => setSelectedSkillId(skill.skillId)}
                        >
                          {skill.skillName}
                        </button>
                      </td>
                      <td className="truncate px-3 py-3 text-app-muted">
                        {job
                          ? `${stageLabel(String(job.stage))} · ${job.displayName || job.jobName || selectedGroup?.representativeName}`
                          : skill.jobId}
                      </td>
                      <td
                        className="px-0 py-3 text-center text-app-muted"
                        title="액티브·패시브 분류 예정"
                      >
                        —
                      </td>
                      <td className="px-0 py-3 text-center whitespace-nowrap">
                        {skill.maxLevel ?? '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredSkills.length === 0 && (
              <p className="py-10 text-center text-small text-app-muted">
                {selectedStage === '5'
                  ? '현재 직업 데이터에는 5차 전용 jobID 연결이 없어 분류된 스킬이 없습니다.'
                  : '표시할 스킬이 없습니다.'}
              </p>
            )}
          </div>
        )}
        {pageCount > 1 && (
          <nav
            aria-label="스킬 페이지"
            className="mt-5 flex items-center justify-end gap-2 text-small"
          >
            <button
              className="action-secondary"
              disabled={page === 1}
              type="button"
              onClick={() => setPage(page - 1)}
            >
              이전
            </button>
            <span>
              {page} / {pageCount}
            </span>
            <button
              className="action-secondary"
              disabled={page === pageCount}
              type="button"
              onClick={() => setPage(page + 1)}
            >
              다음
            </button>
          </nav>
        )}
      </section>

      <aside
        aria-label="스킬 상세"
        className="min-w-0 border-l border-app-border p-4 max-[1199px]:col-span-2 max-[1199px]:border-t max-[1199px]:border-l-0 max-[767px]:col-span-1"
      >
        <h2 className="m-0 border-b border-app-border pb-3 text-body font-bold">스킬 상세</h2>
        {selectedSkill ? (
          <div className="mt-4">
            <strong className="block text-[17px]">{selectedSkill.skillName}</strong>
            <span className="mt-1 block font-mono text-caption text-app-muted">
              {selectedSkill.skillId}
            </span>
            <dl className="mt-5 divide-y divide-app-border text-small">
              {(
                [
                  ['직업 ID', selectedSkill.jobId],
                  ['최대 레벨', selectedSkill.maxLevel ?? '—'],
                  ['요구 레벨', selectedSkill.reqLevel ?? '—'],
                  ['선행 스킬', selectedSkill.reqSkill ?? '—'],
                  ['선행 스킬 레벨', selectedSkill.reqSkillLevel ?? '—']
                ] as const
              ).map(([label, value]) => (
                <div className="grid grid-cols-[110px_1fr] py-2" key={label}>
                  <dt className="text-app-muted">{label}</dt>
                  <dd className="m-0 break-words">{value}</dd>
                </div>
              ))}
            </dl>
            <h3 className="mt-6 text-small font-semibold">설명</h3>
            <p className="whitespace-pre-wrap rounded-lg border border-app-border bg-app-surface p-3 text-small text-app-muted">
              {selectedSkill.skillDesc || '등록된 설명이 없습니다.'}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-small text-app-muted">목록에서 스킬을 선택하세요.</p>
        )}
      </aside>
    </div>
  )
}
