// 고정값: snake_case는 "_" 기준 분리
export function fromSnake(input: string): string[] {
  return input.split('_');
}

// 고정값: 소문자 단어를 "_"로 연결
export function toSnake(words: string[]): string {
  return words.map((w) => w.toLowerCase()).join('_');
}
