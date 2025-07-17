import { capitalize } from './helper';

// 고정값: PascalCase는 대문자 기준으로 분리
export function fromPascal(input: string): string[] {
  return input.split(/(?=[A-Z])/).map((w) => w.toLowerCase());
}

// 고정값: 모든 단어 첫 글자 대문자
export function toPascal(words: string[]): string {
  return words.map(capitalize).join('');
}
