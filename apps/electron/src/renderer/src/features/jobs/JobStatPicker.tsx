import { Plus, X } from 'lucide-react'

import { formatJobStats, jobStats, parseJobStats, type JobStat } from '../../../../shared/job-data'

export function JobStatPicker({
  label,
  value,
  disabled = false,
  onChange
}: {
  label: string
  value: string
  disabled?: boolean
  onChange: (value: string) => void
}): React.JSX.Element {
  const parsed = parseJobStats(value)
  const selected = parsed ?? []
  const available = jobStats.filter((stat) => !selected.includes(stat))

  const update = (stats: readonly JobStat[]): void => onChange(formatJobStats(stats))

  return (
    <fieldset className="min-w-0 border-0 p-0" disabled={disabled}>
      <legend className="sr-only">{label}</legend>
      {parsed === null ? (
        <div
          className="flex max-w-full flex-wrap items-center gap-2 rounded-md border border-app-danger-border bg-app-danger-bg px-3 py-2 text-small text-app-danger"
          role="alert"
        >
          <span>
            잘못된 기존 값: <strong>{value}</strong>
          </span>
          {!disabled && (
            <button
              aria-label={`${label}의 잘못된 기존 값 제거`}
              className="rounded border border-app-danger-border bg-app-input px-2 py-1 font-semibold"
              type="button"
              onClick={() => onChange('')}
            >
              기존 값 제거
            </button>
          )}
        </div>
      ) : (
        <div className="flex max-w-full flex-wrap items-center gap-2">
          {selected.map((stat) => (
            <span
              className="flex h-8 items-center gap-1 rounded-full bg-app-accent-bg px-3 text-small font-semibold text-app-accent"
              key={stat}
            >
              {stat}
              {!disabled && (
                <button
                  aria-label={`${label} ${stat} 제거`}
                  className="border-0 bg-transparent p-0 text-inherit"
                  type="button"
                  onClick={() => update(selected.filter((item) => item !== stat))}
                >
                  <X aria-hidden="true" size={12} />
                </button>
              )}
            </span>
          ))}
          {!disabled &&
            available.map((stat) => (
              <button
                aria-label={`${label} ${stat} 추가`}
                className="flex h-8 items-center gap-1 rounded-md border border-app-border-strong bg-app-input px-2.5 text-small font-semibold text-app-muted hover:text-app-text"
                key={stat}
                type="button"
                onClick={() => update([...selected, stat])}
              >
                <Plus aria-hidden="true" size={13} /> {stat}
              </button>
            ))}
          {disabled && selected.length === 0 && <span className="text-app-muted">미입력</span>}
        </div>
      )}
    </fieldset>
  )
}
