import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

const DEFAULT_CHUNK_SIZE = 1000;

type RawJsonRecord = Record<string, unknown>;

export type SeedGameDataRawOptions = {
  /** 게임 데이터 버전. 예: 1.2.424 */
  version: string;
  /** JSON 파일들이 있는 디렉터리 경로 */
  dir: string;
  /** createMany chunk 크기 */
  chunkSize?: number;
};

export type SeedGameDataRawFileResult = {
  fileName: string;
  rowCount: number;
};

export type SeedGameDataRawResult = {
  version: string;
  fileCount: number;
  recordCount: number;
  files: SeedGameDataRawFileResult[];
};

function isRecord(value: unknown): value is RawJsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getSourceKey(fileName: string, record: RawJsonRecord): string | undefined {
  if (fileName === 'ms_job.json') {
    return typeof record.jobID === 'string' ? record.jobID : undefined;
  }

  if (fileName.startsWith('ms_skill')) {
    return typeof record.skillID === 'string' ? record.skillID : undefined;
  }

  return undefined;
}

function chunk<T>(items: readonly T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}

async function readJsonArray(filePath: string): Promise<RawJsonRecord[]> {
  const raw = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed) || parsed.some((record) => !isRecord(record))) {
    throw new Error(`Expected JSON array of objects: ${filePath}`);
  }

  return parsed;
}

export async function seedGameDataRaw(options: SeedGameDataRawOptions): Promise<SeedGameDataRawResult> {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const fileNames = (await readdir(options.dir)).filter((fileName) => fileName.endsWith('.json')).sort();
  const files: SeedGameDataRawFileResult[] = [];
  let recordCount = 0;

  await prisma.$transaction(
    async (tx) => {
      for (const fileName of fileNames) {
        const filePath = path.join(options.dir, fileName);
        const records = await readJsonArray(filePath);

        const rawFile = await tx.gameDataRawFile.upsert({
          where: {
            version_fileName: {
              version: options.version,
              fileName,
            },
          },
          update: {
            rowCount: records.length,
          },
          create: {
            version: options.version,
            fileName,
            rowCount: records.length,
          },
        });

        await tx.gameDataRawRecord.deleteMany({
          where: {
            fileId: rawFile.id,
          },
        });

        const rows = records.map((record, rowIndex) => ({
          fileId: rawFile.id,
          rowIndex,
          sourceKey: getSourceKey(fileName, record),
          payload: record as Prisma.InputJsonObject,
        }));

        for (const rowChunk of chunk(rows, chunkSize)) {
          await tx.gameDataRawRecord.createMany({
            data: rowChunk,
          });
        }

        files.push({
          fileName,
          rowCount: records.length,
        });
        recordCount += records.length;
      }
    },
    {
      timeout: 120_000,
    },
  );

  return {
    version: options.version,
    fileCount: files.length,
    recordCount,
    files,
  };
}
