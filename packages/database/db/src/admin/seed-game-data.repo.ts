import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { prisma } from '@/lib/prisma';

const DEFAULT_CHUNK_SIZE = 1000;

type JsonRecord = Record<string, unknown>;

type JobRow = {
  jobID: string;
  jobName: string;
};

type SkillRow = {
  jobID: string;
  skillID: string;
  skillName: string;
  skillDesc?: string;
  maxLevel?: string;
  invisible?: string;
  hyper?: string;
  reqSkill?: string;
  reqSkillLevel?: string;
  reqLevel?: string;
};

type SkillCommonRow = {
  skillID: string;
  commonName: string;
  commonValue: string;
};

type SkillHintRow = {
  skillID: string;
  desc?: string;
  pdesc?: string;
  h?: string;
  ph?: string;
  hch?: string;
};

type SkillLevelRow = {
  skillID: string;
  level: string;
  levelDesc?: string;
};

export type SeedGameDataOptions = {
  /** 게임 데이터 버전. 예: 1.2.424 */
  version: string;
  /** JSON 파일들이 있는 디렉터리 경로 */
  dir: string;
  /** createMany chunk 크기 */
  chunkSize?: number;
};

export type SeedGameDataResult = {
  version: string;
  jobs: number;
  skills: number;
  common: number;
  hints: number;
  levels: number;
  pvpCommon: number;
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function chunk<T>(items: readonly T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}

async function readJsonArray<T extends JsonRecord>(filePath: string): Promise<T[]> {
  const raw = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed) || parsed.some((record) => !isRecord(record))) {
    throw new Error(`Expected JSON array of objects: ${filePath}`);
  }

  return parsed as T[];
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  return value.length > 0 ? value : undefined;
}

function optionalInt(value: unknown): number | undefined {
  if (typeof value !== 'string' || value.length === 0) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function boolString(value: unknown): boolean | undefined {
  if (value === 'True') {
    return true;
  }

  if (value === 'False') {
    return false;
  }

  return undefined;
}

async function createManyInChunks<T>(
  items: readonly T[],
  chunkSize: number,
  createMany: (items: T[]) => Promise<unknown>,
): Promise<void> {
  for (const rowChunk of chunk(items, chunkSize)) {
    await createMany(rowChunk);
  }
}

export async function seedGameData(options: SeedGameDataOptions): Promise<SeedGameDataResult> {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const [jobs, skills, common, hints, levels, pvpCommon] = await Promise.all([
    readJsonArray<JobRow>(path.join(options.dir, 'ms_job.json')),
    readJsonArray<SkillRow>(path.join(options.dir, 'ms_skill.json')),
    readJsonArray<SkillCommonRow>(path.join(options.dir, 'ms_skillCommon.json')),
    readJsonArray<SkillHintRow>(path.join(options.dir, 'ms_skillH.json')),
    readJsonArray<SkillLevelRow>(path.join(options.dir, 'ms_skillLevel.json')),
    readJsonArray<SkillCommonRow>(path.join(options.dir, 'ms_skillPVPCommon.json')),
  ]);

  await prisma.$transaction(
    async (tx) => {
      await tx.gameSkillPvpCommon.deleteMany({ where: { version: options.version } });
      await tx.gameSkillLevel.deleteMany({ where: { version: options.version } });
      await tx.gameSkillHint.deleteMany({ where: { version: options.version } });
      await tx.gameSkillCommon.deleteMany({ where: { version: options.version } });
      await tx.gameSkill.deleteMany({ where: { version: options.version } });
      await tx.gameJob.deleteMany({ where: { version: options.version } });

      await createManyInChunks(
        jobs.map((job) => ({
          version: options.version,
          jobId: job.jobID,
          jobName: job.jobName,
        })),
        chunkSize,
        (data) => tx.gameJob.createMany({ data }),
      );

      await createManyInChunks(
        skills.map((skill) => ({
          version: options.version,
          skillId: skill.skillID,
          jobId: skill.jobID,
          skillName: skill.skillName,
          skillDesc: optionalString(skill.skillDesc),
          maxLevel: optionalInt(skill.maxLevel),
          invisible: boolString(skill.invisible),
          hyper: optionalInt(skill.hyper),
          reqSkill: optionalString(skill.reqSkill),
          reqSkillLevel: optionalInt(skill.reqSkillLevel),
          reqLevel: optionalInt(skill.reqLevel),
        })),
        chunkSize,
        (data) => tx.gameSkill.createMany({ data }),
      );

      await createManyInChunks(
        common.map((row) => ({
          version: options.version,
          skillId: row.skillID,
          commonName: row.commonName,
          commonValue: row.commonValue,
        })),
        chunkSize,
        (data) => tx.gameSkillCommon.createMany({ data }),
      );

      await createManyInChunks(
        hints.map((row) => ({
          version: options.version,
          skillId: row.skillID,
          desc: optionalString(row.desc),
          pdesc: optionalString(row.pdesc),
          h: optionalString(row.h),
          ph: optionalString(row.ph),
          hch: optionalString(row.hch),
        })),
        chunkSize,
        (data) => tx.gameSkillHint.createMany({ data }),
      );

      await createManyInChunks(
        levels.map((row) => ({
          version: options.version,
          skillId: row.skillID,
          level: Number.parseInt(row.level, 10),
          levelDesc: optionalString(row.levelDesc),
        })),
        chunkSize,
        (data) => tx.gameSkillLevel.createMany({ data }),
      );

      await createManyInChunks(
        pvpCommon.map((row) => ({
          version: options.version,
          skillId: row.skillID,
          commonName: row.commonName,
          commonValue: row.commonValue,
        })),
        chunkSize,
        (data) => tx.gameSkillPvpCommon.createMany({ data }),
      );
    },
    {
      timeout: 300_000,
    },
  );

  return {
    version: options.version,
    jobs: jobs.length,
    skills: skills.length,
    common: common.length,
    hints: hints.length,
    levels: levels.length,
    pvpCommon: pvpCommon.length,
  };
}
