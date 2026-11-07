import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import type { JobDataSnapshot, JobSummary } from '../../../../shared/job-data'
import { useWorkspace } from '../../app/WorkspaceContext'
import { getErrorMessage } from '../../shared/lib/error-message'

type JobApi = typeof window.api & {
  listJobData: (version: string) => Promise<JobDataSnapshot>
}

function jobsWithDrafts(snapshot: JobDataSnapshot): JobSummary[] {
  const jobs = new Map(snapshot.jobs.map((job) => [job.jobId, job]))
  for (const draft of snapshot.drafts) {
    if (!jobs.has(draft.jobId)) jobs.set(draft.jobId, draft)
  }
  return [...jobs.values()].sort((left, right) => left.jobId.localeCompare(right.jobId))
}

export function JobEditorIndex(): React.JSX.Element {
  const { version } = useWorkspace()
  const navigate = useNavigate()
  const [snapshot, setSnapshot] = useState<JobDataSnapshot | null>(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setSnapshot(null)
    setError('')
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

  const jobs = useMemo(() => {
    if (!snapshot) return []
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return jobsWithDrafts(snapshot).filter(
      (job) =>
        !normalizedQuery ||
        job.jobId.toLocaleLowerCase().includes(normalizedQuery) ||
        job.jobName.toLocaleLowerCase().includes(normalizedQuery)
    )
  }, [query, snapshot])

  return (
    <div className="px-[42px] pt-[42px] pb-[76px] max-[1200px]:px-7">
      <div className="mx-auto max-w-[960px]">
        <header className="mb-7">
          <p className="page-eyebrow m-0">JOB EDITOR · {version.currentVersion}</p>
          <h1 className="page-title">직업 에디터</h1>
          <p className="page-description">편집할 직업을 선택하세요.</p>
        </header>

        <label className="relative mb-5 block">
          <span className="sr-only">직업 검색</span>
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-3 -translate-y-1/2 text-app-muted"
            size={16}
          />
          <input
            className="h-10 w-full rounded-lg border border-app-border-strong bg-app-input pr-3 pl-10 text-body text-app-text outline-none focus:border-app-accent"
            placeholder="직업 ID 또는 이름 검색"
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
        ) : jobs.length === 0 ? (
          <div className="rounded-lg border border-app-border bg-app-surface p-8 text-center text-body text-app-muted">
            {query ? '검색 결과가 없습니다.' : '편집할 직업이 없습니다.'}
          </div>
        ) : (
          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 max-[700px]:grid-cols-1">
            {jobs.map((job) => (
              <li key={job.jobId}>
                <button
                  className="flex w-full items-center justify-between gap-4 rounded-lg border border-app-border bg-app-surface px-4 py-3 text-left hover:border-app-accent hover:bg-app-surface-hover"
                  type="button"
                  onClick={() => navigate(`/class/edit/${encodeURIComponent(job.jobId)}`)}
                >
                  <strong className="text-body text-app-text">{job.jobName}</strong>
                  <span className="font-mono text-small text-app-muted">{job.jobId}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
