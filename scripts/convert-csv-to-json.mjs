import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, 'data', '1.2.424');
const outputDir = path.join(sourceDir, 'json');

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

async function main() {
  await mkdir(outputDir, { recursive: true });

  const filenames = await readdir(sourceDir);
  const csvFilenames = filenames.filter((filename) => filename.endsWith('.csv'));

  for (const filename of csvFilenames) {
    const sourcePath = path.join(sourceDir, filename);
    const outputPath = path.join(outputDir, filename.replace(/\.csv$/u, '.json'));
    const content = await readFile(sourcePath, 'utf8');
    const rows = parseCsv(content);
    const records = toRecords(rows);

    await writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
    console.log(`converted ${filename} -> ${path.relative(rootDir, outputPath)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
