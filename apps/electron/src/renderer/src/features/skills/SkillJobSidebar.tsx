import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { JobDataSnapshot, JobGroup } from '../../../../shared/job-data'

import { stageLabel } from './skill-stage'

type SkillJobSidebarProps = {
  jobs: JobDataSnapshot | null
  jobError: string
  selectedGroup: JobGroup | null
  selectedStage: string
  onSelectGroup: (group: JobGroup, stage?: string) => void
}

export function SkillJobSidebar({
  jobs,
  jobError,
  selectedGroup,
  selectedStage,
  onSelectGroup
}: SkillJobSidebarProps): React.JSX.Element {
  const [jobSearch, setJobSearch] = useState('')
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)

  useEffect(() => {
    setExpandedJobId(selectedGroup?.representativeJobId ?? null)
  }, [selectedGroup?.representativeJobId])

  return (
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
        <Search aria-hidden="true" className="absolute top-2.5 right-3 text-app-muted" size={15} />
      </label>
      {jobError && (
        <p className="text-small text-app-danger" role="alert">
          {jobError}
        </p>
      )}
      {!jobs && !jobError && <p className="text-small text-app-muted">직업을 불러오는 중입니다.</p>}
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
                    onSelectGroup(group)
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
                      onClick={() => onSelectGroup(group, String(advancement.stage))}
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
  )
}
