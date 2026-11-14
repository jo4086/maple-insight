export type HighlightedToken = { text: string; changed: boolean }

export function highlightChangedTokens(
  current: string,
  comparison: string | null
): HighlightedToken[] {
  const tokens = current.match(/\d+(?:[.,]\d+)*%?|[^\s\d]+|\s+/g) ?? []
  if (!comparison) return tokens.map((text) => ({ text, changed: false }))
  const other = comparison.match(/\d+(?:[.,]\d+)*%?|[^\s\d]+|\s+/g) ?? []
  const lengths = Array.from({ length: tokens.length + 1 }, () =>
    Array<number>(other.length + 1).fill(0)
  )
  for (let i = tokens.length - 1; i >= 0; i -= 1) {
    for (let j = other.length - 1; j >= 0; j -= 1) {
      lengths[i][j] =
        tokens[i] === other[j]
          ? 1 + lengths[i + 1][j + 1]
          : Math.max(lengths[i + 1][j], lengths[i][j + 1])
    }
  }
  const unchanged = new Set<number>()
  for (let i = 0, j = 0; i < tokens.length && j < other.length; ) {
    if (tokens[i] === other[j]) {
      unchanged.add(i)
      i += 1
      j += 1
    } else if (lengths[i + 1][j] >= lengths[i][j + 1]) i += 1
    else j += 1
  }
  return tokens.map((text, index) => ({
    text,
    changed: !unchanged.has(index) && !/^\s+$/.test(text)
  }))
}
