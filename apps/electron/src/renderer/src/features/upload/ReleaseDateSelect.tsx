import { useEffect, useMemo, useState } from 'react'

import {
  getReleaseDateDayCount,
  parseReleaseDate,
  serializeReleaseDate,
  type ReleaseDateParts
} from './release-date'

type ReleaseDatePart = keyof ReleaseDateParts

export function ReleaseDateSelect({
  value,
  disabled,
  onChange
}: {
  value: string
  disabled: boolean
  onChange: (value: string) => void
}): React.JSX.Element {
  const [parts, setParts] = useState<ReleaseDateParts>(() => parseReleaseDate(value))
  const currentYear = new Date().getFullYear()
  const years = useMemo(
    () => Array.from({ length: currentYear - 2001 }, (_, index) => currentYear + 1 - index),
    [currentYear]
  )
  const months = Array.from({ length: 12 }, (_, index) => index + 1)
  const dayCount = getReleaseDateDayCount(parts.year, parts.month)
  const days = Array.from({ length: dayCount }, (_, index) => index + 1)

  useEffect(() => {
    setParts(parseReleaseDate(value))
  }, [value])

  const updatePart = (part: ReleaseDatePart, nextValue: string): void => {
    const nextParts = { ...parts, [part]: nextValue }
    const nextDayCount = getReleaseDateDayCount(nextParts.year, nextParts.month)

    if (Number(nextParts.day) > nextDayCount) nextParts.day = String(nextDayCount)

    setParts(nextParts)
    onChange(serializeReleaseDate(nextParts))
  }

  const options = [
    { part: 'year' as const, label: '연도', values: years, suffix: '년' },
    { part: 'month' as const, label: '월', values: months, suffix: '월' },
    { part: 'day' as const, label: '일', values: days, suffix: '일' }
  ]

  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-[1.25fr_1fr_1fr_auto] gap-2">
        {options.map(({ part, label, values, suffix }) => (
          <span className="relative" key={part}>
            <select
              aria-label={label}
              className="h-10 w-full appearance-none rounded-lg border border-app-border-strong bg-app-input px-3 pr-8 font-mono text-body font-semibold text-app-text outline-none focus:border-app-accent disabled:cursor-not-allowed disabled:opacity-60"
              disabled={disabled}
              value={parts[part]}
              onChange={(event) => updatePart(part, event.target.value)}
            >
              <option value="">{label}</option>
              {values.map((partValue) => (
                <option key={partValue} value={partValue}>
                  {partValue}
                  {suffix}
                </option>
              ))}
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base font-bold text-app-accent"
            >
              ▾
            </span>
          </span>
        ))}
        <button
          className="h-10 rounded-lg border border-app-border-strong bg-app-surface-2 px-3 text-small font-semibold text-app-muted hover:border-app-accent hover:text-app-text disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || !value}
          type="button"
          onClick={() => onChange('')}
        >
          비우기
        </button>
      </div>
      <span className="text-caption text-app-muted">
        목록을 스크롤하거나 포커스 후 방향키와 숫자 키로 선택할 수 있습니다.
      </span>
    </div>
  )
}
