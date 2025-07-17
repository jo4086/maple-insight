import { capitalize } from './helper';

export function fromCamel(input: string): string[] {
  return input.split(/(?=[A-Z])/).map((word) => word.toLowerCase());
}

export function toCamel(words: string[]): string {
  return words[0] + words.slice(1).map(capitalize).join(' ');
}
