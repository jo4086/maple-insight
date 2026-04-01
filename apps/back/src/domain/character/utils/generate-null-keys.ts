/**
 * 실행 방법
 * - 실행 위치: @root/apps/back
 * - 명령어: npx ts-node src/domain/character/utils/generate-null-keys.ts src/domain/character/samples/{파일명}
 *
 * */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

type MatchPathMap = Map<string, Set<string>>;

function collectNullKeys(value: unknown, currentPath: string[] = [], result: MatchPathMap = new Map()): MatchPathMap {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectNullKeys(item, [...currentPath, `[${index}]`], result);
    });
    return result;
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, nestedValue]) => {
      const nextPath = [...currentPath, key];

      if (nestedValue === null) {
        const pathLabel = nextPath.join('.');
        const paths = result.get(key) ?? new Set<string>();
        paths.add(pathLabel);
        result.set(key, paths);
        return;
      }

      collectNullKeys(nestedValue, nextPath, result);
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
    throw new Error('Usage: ts-node generate-null-keys.ts <sample-json-path> [output-ts-path] [export-name]');
  }

  const filePath = path.resolve(process.cwd(), inputArg);
  const baseName = path.basename(filePath, path.extname(filePath));
  const outputPath = outputArg ? path.resolve(process.cwd(), outputArg) : path.resolve(process.cwd(), 'src/domain/character/generated', `${baseName}-null-keys.ts`);
  const exportName = exportArg ?? `${toConstCase(baseName)}_NULL_KEYS`;
  const sample = JSON.parse(readFileSync(filePath, 'utf-8')) as unknown;
  const nullKeyMap = collectNullKeys(sample);
  const keys = [...nullKeyMap.keys()].sort((a, b) => a.localeCompare(b));
  const content = `export const ${exportName} = ${JSON.stringify(keys, null, 2)} as const;\n`;

  writeFileSync(outputPath, content, 'utf-8');
  console.log(`written: ${outputPath}`);
}

main();
