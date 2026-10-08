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
      <select
        className={`rounded-lg border border-app-border-strong bg-app-input px-3 font-mono font-semibold text-app-text outline-none focus:border-app-accent ${compact ? 'h-8 w-[106px] text-caption' : 'h-10 pr-9 text-xs'}`}
        value={value}
        disabled={versions.length === 0}
        onChange={(event) => onChange(event.target.value)}
      >
        {versions.length === 0 && <option value="">버전 없음</option>}
        {versions.map((version) => (
          <option key={version} value={version} disabled={version === excludedVersion}>
            {version}
          </option>
        ))}
      </select>
    </label>
  )
}
