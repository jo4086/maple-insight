import { Download, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'

import type { JobDataSnapshot, JobGroup } from '../../../../shared/job-data'
import type { SkillSummary } from '../../../../shared/skill-data'
import type { SkillImageData } from '../../../../shared/skill-images'
import { getErrorMessage } from '../../shared/lib/error-message'

import { stageLabel, stages } from './skill-stage'
import { SkillDetailPanel } from './SkillDetailPanel'
import { SkillJobSidebar } from './SkillJobSidebar'
import { SkillTable } from './SkillTable'

const pageSize = 10

export function SkillListView({ version }: { version: string }): React.JSX.Element {
  const [params, setParams] = useSearchParams()
  const [jobs, setJobs] = useState<JobDataSnapshot | null>(null)
  const [skills, setSkills] = useState<SkillSummary[]>([])
  const [jobError, setJobError] = useState('')
  const [skillError, setSkillError] = useState('')
  const [loadingSkills, setLoadingSkills] = useState(false)
  const [images, setImages] = useState<Record<string, SkillImageData>>({})
  const [imageRevision, setImageRevision] = useState(0)
  const [imageError, setImageError] = useState('')
  const [extractingJobId, setExtractingJobId] = useState<string | null>(null)
  const [extractNotice, setExtractNotice] = useState<{
    jobId: string
    message: string
    error: boolean
  } | null>(null)
  const [skillSearch, setSkillSearch] = useState('')
  const [selectedSkillId, setSelectedSkillId] = useState('')
  const [page, setPage] = useState(1)

  const selectedGroup = useMemo(() => {
    if (!jobs) return null
    return (
      jobs.jobGroups.find((group) => group.representativeJobId === params.get('jobId')) ??
      jobs.jobGroups[0] ??
      null
    )
  }, [jobs, params])
  const selectedStage = params.get('stage') ?? 'all'
  const availableStages = selectedGroup ? stages(selectedGroup) : []
  const filteredSkills = useMemo(() => {
    if (!selectedGroup) return []
    const matchingJobIds = new Set(
      selectedStage === 'all' || selectedStage === 'hyper'
        ? selectedGroup.advancements.map(({ jobId }) => jobId)
        : selectedGroup.advancements
            .filter(({ stage }) => String(stage) === selectedStage)
            .map(({ jobId }) => jobId)
    )
    const query = skillSearch.trim().toLocaleLowerCase()
    return skills.filter(
      (skill) =>
        matchingJobIds.has(skill.jobId) &&
        (selectedStage === 'all' ||
          (selectedStage === 'hyper' ? skill.hyper === 1 : skill.hyper !== 1)) &&
        (!query ||
          skill.skillId.includes(query) ||
          skill.skillName.toLocaleLowerCase().includes(query))
    )
  }, [selectedGroup, selectedStage, skillSearch, skills])
  const pageCount = Math.max(1, Math.ceil(filteredSkills.length / pageSize))
  const visibleSkills = useMemo(
    () => filteredSkills.slice((page - 1) * pageSize, page * pageSize),
    [filteredSkills, page]
  )
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

  useEffect(() => {
    let active = true
    setImages({})
    setImageError('')
    if (visibleSkills.length > 0) {
      void window.api
        .listSkillImages({
          version,
          identities: visibleSkills.map(({ jobId, skillId }) => ({ jobId, skillId }))
        })
        .then(
          (result) => {
            if (active) setImages(Object.fromEntries(result.map((image) => [image.skillId, image])))
          },
          (error: unknown) => {
            if (active) setImageError(getErrorMessage(error))
          }
        )
    }
    return () => {
      active = false
    }
  }, [visibleSkills, imageRevision, version])

  const extractSelectedGroup = async (): Promise<void> => {
    if (!selectedGroup || extractingJobId) return
    const jobId = selectedGroup.representativeJobId
    setExtractingJobId(jobId)
    setExtractNotice(null)
    try {
      const result = await window.api.extractSkillImages({ version, representativeJobId: jobId })
      setExtractNotice({
        jobId,
        message: `${result.jobs}개 전직 처리 · 새 이미지 ${result.created}개 · 기존 이미지 ${result.reused}개 재사용 · 원본 누락 ${result.missing}개`,
        error: false
      })
      setImageRevision((current) => current + 1)
    } catch (error) {
      setExtractNotice({ jobId, message: getErrorMessage(error), error: true })
    } finally {
      setExtractingJobId(null)
    }
  }

  const selectGroup = (group: JobGroup, stage = 'all'): void => {
    const next = new URLSearchParams()
    next.set('jobId', group.representativeJobId)
    if (stage !== 'all') next.set('stage', stage)
    setParams(next)
  }

  return (
    <div className="grid min-h-[calc(100vh-65px)] grid-cols-[220px_minmax(360px,1fr)_310px] border-t border-app-border max-[1199px]:grid-cols-[190px_minmax(0,1fr)] max-[767px]:grid-cols-1">
      <SkillJobSidebar
        jobError={jobError}
        jobs={jobs}
        onSelectGroup={selectGroup}
        selectedGroup={selectedGroup}
        selectedStage={selectedStage}
      />

      <section aria-label="스킬 목록" className="min-w-0 p-4 max-[1199px]:border-r-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-app-border pb-4">
          <div className="flex items-center gap-2">
            <strong className="mr-2 text-[18px] text-app-text">
              {selectedGroup?.representativeName ?? '스킬 목록'}
            </strong>
            <span className="text-caption text-app-muted">{version || '버전 미선택'}</span>
          </div>
          <button
            className="action-primary inline-flex items-center gap-2"
            disabled={!selectedGroup || Boolean(extractingJobId)}
            type="button"
            onClick={() => void extractSelectedGroup()}
          >
            <Download aria-hidden="true" size={15} />
            {extractingJobId ? '이미지 추출 중…' : '이미지 추출 및 등록'}
          </button>
        </div>
        {extractNotice && extractNotice.jobId === selectedGroup?.representativeJobId && (
          <p
            className={`mt-3 text-small ${extractNotice.error ? 'text-app-danger' : 'text-app-muted'}`}
            role="status"
          >
            {extractNotice.message}
          </p>
        )}
        {imageError && (
          <p className="mt-3 text-small text-app-danger" role="alert">
            {imageError}
          </p>
        )}
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
          <SkillTable
            hasFilteredSkills={filteredSkills.length > 0}
            images={images}
            onSelectSkill={setSelectedSkillId}
            selectedGroup={selectedGroup}
            selectedSkillId={selectedSkill?.skillId}
            selectedStage={selectedStage}
            skills={visibleSkills}
          />
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

      <SkillDetailPanel
        images={selectedSkill ? images[selectedSkill.skillId] : undefined}
        skill={selectedSkill}
        version={version}
      />
    </div>
  )
}
