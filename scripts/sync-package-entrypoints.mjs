import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { relative, resolve } from 'path';

const ROOT_DIR = resolve(new URL('..', import.meta.url).pathname);
const EXCLUDED_DIR_NAMES = new Set(['node_modules', 'dist', 'legacy', 'temp', 'test']);
const EXCLUDED_SRC_ENTRYPOINT_DIR_NAMES = new Set(['internal', 'legacy', 'temp', 'test']);

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function normalizePath(value) {
  return value.replaceAll('\\', '/');
}

function isPackageJsonPath(filePath) {
  return filePath.endsWith('/package.json') && !filePath.includes('/node_modules/') && !filePath.includes('/dist/');
}

function findPackageJsonFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    if (EXCLUDED_DIR_NAMES.has(entry.name) || entry.name.startsWith('.')) {
      continue;
    }

    const entryPath = resolve(dir, entry.name);

    if (entry.isDirectory()) {
      result.push(...findPackageJsonFiles(entryPath));
      continue;
    }

    if (entry.isFile() && isPackageJsonPath(normalizePath(entryPath))) {
      result.push(entryPath);
    }
  }

  return result;
}

function findPackage(packageInput) {
  const normalizedInput = packageInput.trim();

  if (!normalizedInput) {
    throw new Error('패키지명이 비어 있습니다.');
  }

  const directPackageJsonPath = resolve(ROOT_DIR, normalizedInput, 'package.json');

  if (existsSync(directPackageJsonPath)) {
    return directPackageJsonPath;
  }

  const packageJsonFiles = findPackageJsonFiles(resolve(ROOT_DIR, 'packages'));
  const matched = packageJsonFiles.filter((filePath) => {
    const pkg = readJson(filePath);
    const relativeDir = normalizePath(relative(ROOT_DIR, resolve(filePath, '..')));

    return pkg.name === normalizedInput || relativeDir === normalizedInput || relativeDir.endsWith(`/${normalizedInput}`);
  });

  if (matched.length === 0) {
    throw new Error(`패키지를 찾지 못했습니다: ${normalizedInput}`);
  }

  if (matched.length > 1) {
    throw new Error(`패키지명이 여러 개와 매칭됩니다:\n${matched.map((filePath) => `- ${normalizePath(relative(ROOT_DIR, filePath))}`).join('\n')}`);
  }

  return matched[0];
}

function getPublicSrcFolders(srcDir) {
  if (!existsSync(srcDir)) {
    return [];
  }

  return readdirSync(srcDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !EXCLUDED_SRC_ENTRYPOINT_DIR_NAMES.has(name))
    .filter((name) => existsSync(resolve(srcDir, name, 'index.ts')))
    .sort((left, right) => left.localeCompare(right));
}

function getInternalFiles(srcDir) {
  const internalDir = resolve(srcDir, 'internal');

  if (!existsSync(internalDir)) {
    return [];
  }

  return readdirSync(internalDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith('.ts'))
    .filter((name) => !name.startsWith('.'))
    .filter((name) => !name.startsWith('temp.'))
    .filter((name) => !name.startsWith('test.'))
    .filter((name) => !name.endsWith('.test.ts'))
    .filter((name) => !name.endsWith('.legacy.ts'))
    .map((name) => name.slice(0, -'.ts'.length))
    .sort((left, right) => left.localeCompare(right));
}

function updatePackageJson(packageJsonPath, publicFolders) {
  const pkg = readJson(packageJsonPath);
  pkg.exports ??= {};

  for (const folderName of publicFolders) {
    pkg.exports[`./${folderName}`] = {
      types: `./dist/${folderName}/index.d.ts`,
      import: `./dist/${folderName}/index.js`,
      require: `./dist/${folderName}/index.cjs`,
    };
  }

  writeJson(packageJsonPath, pkg);
}

function updateTsconfig(tsconfigPath, internalFiles) {
  if (!existsSync(tsconfigPath)) {
    return false;
  }

  const tsconfig = readJson(tsconfigPath);
  tsconfig.compilerOptions ??= {};
  tsconfig.compilerOptions.paths ??= {};

  for (const fileName of internalFiles) {
    tsconfig.compilerOptions.paths[`@@${fileName}`] = [`src/internal/${fileName}.ts`];
  }

  writeJson(tsconfigPath, tsconfig);
  return true;
}

function parseObjectLines(block) {
  return block
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('//'));
}

function upsertObjectEntry(block, key, value) {
  const lines = parseObjectLines(block);
  const keyPatterns = [
    new RegExp(`^${escapeRegExp(key)}\\s*:`),
    new RegExp(`^'${escapeRegExp(key)}'\\s*:`),
    new RegExp(`^"${escapeRegExp(key)}"\\s*:`),
  ];
  const hasKey = lines.some((line) => keyPatterns.some((pattern) => pattern.test(line)));

  if (hasKey) {
    return block;
  }

  const keyText = /^[a-zA-Z_$][\w$]*$/.test(key) ? key : `'${key}'`;
  const line = `    ${keyText}: ${value},`;
  const trimmedEnd = block.trimEnd();

  return trimmedEnd ? `${trimmedEnd}\n${line}\n` : `${line}\n`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceObjectBlock(source, objectName, updateBlock) {
  const marker = `${objectName}: {`;
  const markerIndex = source.indexOf(marker);

  if (markerIndex === -1) {
    return source;
  }

  const blockStart = source.indexOf('{', markerIndex);
  let depth = 0;

  for (let index = blockStart; index < source.length; index += 1) {
    const char = source[index];

    if (char === '{') {
      depth += 1;
    }

    if (char === '}') {
      depth -= 1;

      if (depth === 0) {
        const before = source.slice(0, blockStart + 1);
        const block = source.slice(blockStart + 1, index);
        const after = source.slice(index);

        return `${before}${updateBlock(block)}${after}`;
      }
    }
  }

  throw new Error(`${objectName} 객체 블록을 닫는 중괄호를 찾지 못했습니다.`);
}

function replaceAliasBlock(source, updateBlock) {
  const marker = 'alias({';
  const markerIndex = source.indexOf(marker);

  if (markerIndex === -1) {
    return source;
  }

  const blockStart = source.indexOf('{', markerIndex);
  let depth = 0;

  for (let index = blockStart; index < source.length; index += 1) {
    const char = source[index];

    if (char === '{') {
      depth += 1;
    }

    if (char === '}') {
      depth -= 1;

      if (depth === 0) {
        const before = source.slice(0, blockStart + 1);
        const block = source.slice(blockStart + 1, index);
        const after = source.slice(index);

        return `${before}${updateBlock(block)}${after}`;
      }
    }
  }

  throw new Error('alias 객체 블록을 닫는 중괄호를 찾지 못했습니다.');
}

function updateTsupConfig(tsupConfigPath, publicFolders, internalFiles) {
  if (!existsSync(tsupConfigPath)) {
    return false;
  }

  let source = readFileSync(tsupConfigPath, 'utf8');

  source = replaceObjectBlock(source, 'entry', (block) => {
    let nextBlock = block;

    for (const folderName of publicFolders) {
      nextBlock = upsertObjectEntry(nextBlock, `${folderName}/index`, `'src/${folderName}/index.ts'`);
    }

    return nextBlock;
  });

  source = replaceAliasBlock(source, (block) => {
    let nextBlock = block;

    for (const fileName of internalFiles) {
      nextBlock = upsertObjectEntry(nextBlock, `@@${fileName}`, `resolve(__dirname, 'src/internal/${fileName}.ts')`);
    }

    return nextBlock;
  });

  writeFileSync(tsupConfigPath, source);
  return true;
}

async function main() {
  const packageArg = process.argv.slice(2).join(' ');
  let packageInput = packageArg;

  if (!packageInput) {
    const readline = createInterface({ input, output });
    packageInput = await readline.question('패키지명 또는 패키지 경로를 입력하세요: ');
    readline.close();
  }

  const packageJsonPath = findPackage(packageInput);
  const packageDir = resolve(packageJsonPath, '..');
  const srcDir = resolve(packageDir, 'src');
  const tsconfigPath = resolve(packageDir, 'tsconfig.json');
  const tsupConfigPath = resolve(packageDir, 'tsup.config.ts');
  const publicFolders = getPublicSrcFolders(srcDir);
  const internalFiles = getInternalFiles(srcDir);

  updatePackageJson(packageJsonPath, publicFolders);
  const didUpdateTsconfig = updateTsconfig(tsconfigPath, internalFiles);
  const didUpdateTsupConfig = updateTsupConfig(tsupConfigPath, publicFolders, internalFiles);

  console.log(`package: ${normalizePath(relative(ROOT_DIR, packageDir))}`);
  console.log(`public folders: ${publicFolders.length ? publicFolders.join(', ') : '(none)'}`);
  console.log(`internal files: ${internalFiles.length ? internalFiles.join(', ') : '(none)'}`);
  console.log(`updated: package.json${didUpdateTsconfig ? ', tsconfig.json' : ''}${didUpdateTsupConfig ? ', tsup.config.ts' : ''}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
