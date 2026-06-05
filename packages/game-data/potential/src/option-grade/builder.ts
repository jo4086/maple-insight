import type { PotentialGrade } from '../types';
import type { PotentialOptionGradeKind, PotentialOptionGradeLevelRange, PotentialOptionGradePartCondition, PotentialOptionGradeRow, PotentialOptionGradeTable } from './types';

type GradeValues = Partial<Record<PotentialGrade, string | readonly string[]>>;

const potentialGradeOrder = ['normal', 'rare', 'epic', 'unique', 'legendary'] as const satisfies readonly PotentialGrade[];

export function parsePotentialOptionLevelRange(level: string): PotentialOptionGradeLevelRange {
  const normalized = level.trim();

  if (normalized.includes('~')) {
    const [minText, maxText] = normalized.split('~').map((value) => value.trim());

    return {
      min: Number(minText),
      max: maxText ? Number(maxText) : null,
    };
  }

  return {
    min: Number(normalized),
    max: null,
  };
}

export function isPotentialOptionLevelInRange(level: number, range: PotentialOptionGradeLevelRange): boolean {
  return level >= range.min && (range.max == null || level <= range.max);
}

export function createPotentialOptionGradeRow(
  kind: PotentialOptionGradeKind,
  level: string,
  values: GradeValues,
  templates: string | readonly string[],
  options: {
    part?: PotentialOptionGradePartCondition;
  } = {},
): PotentialOptionGradeRow {
  const row: Partial<PotentialOptionGradeRow> = {
    kind,
    level,
    levelRange: parsePotentialOptionLevelRange(level),
    part: options.part,
  };

  for (const grade of potentialGradeOrder) {
    const gradeValue = values[grade];
    if (gradeValue == null) continue;

    row[grade] = expandPotentialOptionTexts(templates, gradeValue);
  }

  return row as PotentialOptionGradeRow;
}

export function createPotentialOptionGradeTable(
  name: string,
  source: string,
  rows: readonly PotentialOptionGradeRow[],
  options: {
    part?: PotentialOptionGradePartCondition;
  } = {},
): PotentialOptionGradeTable {
  return {
    name,
    source,
    part: options.part,
    rows,
  };
}

export function expandPotentialOptionTexts(templates: string | readonly string[], value: string | readonly string[]): string[] {
  const templateList = Array.isArray(templates) ? templates : [templates];
  const values = typeof value === 'string' ? splitPotentialOptionValues(value) : value;

  return templateList.flatMap((template) => values.map((currentValue) => template.replaceAll('{value}', currentValue))).map((text) => text.trim());
}

export function splitPotentialOptionValues(value: string): string[] {
  return value
    .split(/\s*(?:\/|,|또는)\s*/g)
    .map((text) => text.trim())
    .filter(Boolean);
}

export function mergePotentialOptionGradeRows(...rowGroups: readonly (readonly PotentialOptionGradeRow[])[]): PotentialOptionGradeRow[] {
  return rowGroups.flatMap((rows) => rows);
}
