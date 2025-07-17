// 고정값: kebab-case는 "-" 기준 분리
export function fromKebab(input: string): string[] {
  return input.split('-');
}

// 고정값: 소문자 단어를 "-"로 연결
export function toKebab(words: string[]): string {
  return words.map((w) => w.toLowerCase()).join('-');
}
