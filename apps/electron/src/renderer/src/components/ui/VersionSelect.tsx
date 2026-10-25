import { ChevronDown } from 'lucide-react'

export function VersionSelect({
  label,
  value,
  versions,
  excludedVersion,
  onChange,
  compact = false
}: {
  label: string
  value: string
  versions: string[]
  excludedVersion?: string
  onChange: (version: string) => void
  compact?: boolean
}): React.JSX.Element {
  return (
    <label className={compact ? 'flex items-center gap-2' : 'grid min-w-[150px] gap-1.5'}>
      <span className={compact ? 'text-micro font-semibold text-app-muted' : 'field-label'}>
        {label}
      </span>
      <span className={compact ? 'group relative w-[106px]' : 'group relative'}>
        <select
          className={`w-full appearance-none rounded-lg border border-app-border-strong bg-app-input px-3 pr-9 font-mono font-semibold text-app-text outline-none focus:border-app-accent ${compact ? 'h-8 text-caption' : 'h-10 text-xs'}`}
          value={value}
          disabled={versions.length === 0}
          onChange={(event) => onChange(event.target.value)}
        >
          {versions.length === 0 && <option value="">버전 없음</option>}
          {versions.length > 0 && value === '' && (
            <option value="" disabled>
              버전 선택
            </option>
          )}
          {versions.map((version) => (
            <option key={version} value={version} disabled={version === excludedVersion}>
              {version}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-app-muted group-hover:text-app-text group-focus-within:text-app-text"
          size={16}
          strokeWidth={1.75}
        />
      </span>
    </label>
  )
}
