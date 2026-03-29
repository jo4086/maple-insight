export function toNumberSafe(value: string | number | null | undefined, fallback = 0): number {
  if (value == null) return fallback;
  if (typeof value === 'number') return Number.isNaN(value) ? fallback : value;

  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
}
