export function toBooleanByFlag(value: string): boolean {
  return value === 'true' || value === '1' || value === 'Y' || value === '적용' || value === '가능';
}
