export type ReleaseDateParts = {
  year: string
  month: string
  day: string
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function parseReleaseDate(value: string): ReleaseDateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  return match
    ? { year: match[1], month: String(Number(match[2])), day: String(Number(match[3])) }
    : { year: '', month: '', day: '' }
}

export function getReleaseDateDayCount(year: string, month: string): number {
  if (!year || !month) return 31
  return new Date(Number(year), Number(month), 0).getDate()
}

export function serializeReleaseDate(parts: ReleaseDateParts): string {
  if (!parts.year || !parts.month || !parts.day) return ''

  return `${parts.year}-${parts.month.padStart(2, '0')}-${parts.day.padStart(2, '0')}`
}
