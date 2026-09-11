import { access, mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, 'data');

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }

      row.push(field);
      field = '';

      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function toRecords(rows) {
  if (rows.length === 0) {
    return [];
  }

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((header) => header.replace(/^\uFEFF/, ''));

  return dataRows.map((dataRow) =>
    Object.fromEntries(headers.map((header, index) => [header, dataRow[index] ?? ''])),
  );
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const entries = await readdir(sourceDir, { withFileTypes: true });
  const versionDirs = entries.filter((entry) => entry.isDirectory());

  for (const entry of versionDirs) {
    const versionDir = path.join(sourceDir, entry.name);
    const outputDir = path.join(versionDir, 'json');
    const csvDir = path.join(versionDir, 'csv');
    const filenames = await readdir(versionDir);
    const csvFilenames = filenames.filter((filename) => filename.endsWith('.csv'));

    if (csvFilenames.length === 0) {
      continue;
    }

    await mkdir(outputDir, { recursive: true });
    await mkdir(csvDir, { recursive: true });

    for (const filename of csvFilenames) {
      const sourcePath = path.join(versionDir, filename);
      const outputPath = path.join(outputDir, filename.replace(/\.csv$/u, '.json'));
      const csvOutputPath = path.join(csvDir, filename);
      const content = await readFile(sourcePath, 'utf8');
      const rows = parseCsv(content);
      const records = toRecords(rows);

      if (await exists(csvOutputPath)) {
        throw new Error(`CSV output already exists: ${path.relative(rootDir, csvOutputPath)}`);
      }

      await writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
      await rename(sourcePath, csvOutputPath);
      console.log(`converted ${path.relative(rootDir, sourcePath)} -> ${path.relative(rootDir, outputPath)}`);
      console.log(`moved ${path.relative(rootDir, sourcePath)} -> ${path.relative(rootDir, csvOutputPath)}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
