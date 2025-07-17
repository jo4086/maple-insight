import { toCamel, fromCamel } from './camel';
import { toKebab, fromKebab } from './kebab';
import { toSnake, fromSnake } from './snake';
import { toPascal, fromPascal } from './pascal';

type Format = 'camel' | 'snake' | 'kebab' | 'pascal';

interface ConvertOptions {
  from: Format;
  to: Format;
  data: string;
}

// 고정값: convertCase 함수는 string → string 변환
export function convertCase({ from, to, data }: ConvertOptions): string {
  const fromMap: Record<Format, (input: string) => string[]> = {
    camel: fromCamel,
    snake: fromSnake,
    kebab: fromKebab,
    pascal: fromPascal,
  };

  const toMap: Record<Format, (words: string[]) => string> = {
    camel: toCamel,
    snake: toSnake,
    kebab: toKebab,
    pascal: toPascal,
  };

  const splitFn = fromMap[from];
  const joinFn = toMap[to];

  if (!splitFn || !joinFn) {
    throw new Error(`Unsupported conversion from "${from}" to "${to}"`);
  }

  const words = splitFn(data);
  return joinFn(words);
}
