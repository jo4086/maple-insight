import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const FLAG_VALUES = new Set(['false', 'true', '적용', '미적용']);

type MatchPathMap = Map<string, Set<string>>;

function collectFlagKeys(value: unknown, currentPath: string[] = [], result: MatchPathMap = new Map()): MatchPathMap {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectFlagKeys(item, [...currentPath, `[${index}]`], result);
    });
    return result;
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, nestedValue]) => {
      const nextPath = [...currentPath, key];

      if (typeof nestedValue === 'string' && FLAG_VALUES.has(nestedValue)) {
        const pathLabel = nextPath.join('.');
        const paths = result.get(key) ?? new Set<string>();
        paths.add(pathLabel);
        result.set(key, paths);
        return;
      }

      collectFlagKeys(nestedValue, nextPath, result);
    });
  }

  return result;
}

function toConstCase(value: string): string {
  return value
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toUpperCase();
}

function main() {
  const inputArg = process.argv[2];
  const outputArg = process.argv[3];
  const exportArg = process.argv[4];

  if (!inputArg) {
    throw new Error('Usage: ts-node generate-flag-keys.ts <sample-json-path> [output-ts-path] [export-name]');
  }

  const filePath = path.resolve(process.cwd(), inputArg);
  const baseName = path.basename(filePath, path.extname(filePath));
  const outputPath = outputArg
    ? path.resolve(process.cwd(), outputArg)
    : path.resolve(process.cwd(), 'src/domain/character/generated', `${baseName}-flag-keys.ts`);
  const exportName = exportArg ?? `${toConstCase(baseName)}_FLAG_KEYS`;
  const sample = JSON.parse(readFileSync(filePath, 'utf-8')) as unknown;
  const flagKeyMap = collectFlagKeys(sample);
  const keys = [...flagKeyMap.keys()].sort((a, b) => a.localeCompare(b));
  const content = `export const ${exportName} = ${JSON.stringify(keys, null, 2)} as const;\n`;

  writeFileSync(outputPath, content, 'utf-8');
  console.log(`written: ${outputPath}`);
}

main();
