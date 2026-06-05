import type { RawSkillCommonMap, RawSkillCommonRow } from '@@types';

export function groupBy<T, K>(items: readonly T[], getKey: (item: T) => K): Map<K, T[]> {
  const grouped = new Map<K, T[]>();

  for (const item of items) {
    const key = getKey(item);
    const group = grouped.get(key);

    if (group) {
      group.push(item);
    } else {
      grouped.set(key, [item]);
    }
  }

  return grouped;
}

export function groupCommonBySkillId(rows: readonly RawSkillCommonRow[]): Map<string, RawSkillCommonMap> {
  const grouped = new Map<string, RawSkillCommonMap>();

  for (const row of rows) {
    const common = grouped.get(row.skillID) ?? {};

    if (row.commonName in common) {
      throw new Error(`Duplicate skill common: ${row.skillID}.${row.commonName}`);
    }

    common[row.commonName] = row.commonValue;
    grouped.set(row.skillID, common);
  }

  return grouped;
}

export function extractFormulaTokens(text: string): string[] {
  return [...text.matchAll(/#([a-zA-Z0-9_]+)/g)].map((match) => match[1]);
}
