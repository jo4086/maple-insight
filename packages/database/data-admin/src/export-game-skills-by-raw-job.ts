import 'dotenv/config';

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { disconnectDb } from '@maple/db';
import { findGameSkillsByJobIds } from '@maple/db/admin';
import {
  getClassNamesByJobId,
  getRawJobCategoryByJobId,
  rawJobCategoryMap,
  rawJobNameMap,
  type RawJobCategory,
} from '@maple/data-skill';

const DEFAULT_VERSION = '1.2.424';

type ExportSkillRow = {
  jobID: string;
  skillID: string;
  skillName: string;
  skillDesc: string;
  maxLevel: string;
  invisible: 'True' | 'False' | '';
  hyper: string;
  reqSkill: string;
  reqSkillLevel: string;
  reqLevel: string;
};

type ExportJobSkillGroup = {
  jobId: string;
  classNames?: readonly string[];
  category?: RawJobCategory;
  skills: ExportSkillRow[];
};

function getVersion(): string {
  return process.argv.slice(2).find((arg) => arg !== '--') ?? process.env.GAME_DATA_VERSION ?? DEFAULT_VERSION;
}

function getOutputPath(version: string): string {
  return (
    process.env.GAME_DATA_SKILL_BY_JOB_OUTPUT ??
    path.resolve(process.cwd(), '../../..', 'data', version, 'generated', 'skills-by-raw-job.json')
  );
}

function getTargetJobIds(): string[] {
  return [...new Set([...Object.keys(rawJobNameMap), ...Object.keys(rawJobCategoryMap)])].sort(
    (left, right) => Number(left) - Number(right),
  );
}

async function main(): Promise<void> {
  const version = getVersion();
  const outputPath = getOutputPath(version);
  const jobIds = getTargetJobIds();
  const skills = await findGameSkillsByJobIds({
    version,
    jobIds,
  });

  const skillsByJobId = new Map<string, ExportSkillRow[]>();

  for (const skill of skills) {
    const rows = skillsByJobId.get(skill.jobId) ?? [];
    rows.push({
      jobID: skill.jobId,
      skillID: skill.skillId,
      skillName: skill.skillName,
      skillDesc: skill.skillDesc ?? '',
      maxLevel: skill.maxLevel?.toString() ?? '',
      invisible: skill.invisible === true ? 'True' : skill.invisible === false ? 'False' : '',
      hyper: skill.hyper?.toString() ?? '',
      reqSkill: skill.reqSkill ?? '',
      reqSkillLevel: skill.reqSkillLevel?.toString() ?? '',
      reqLevel: skill.reqLevel?.toString() ?? '',
    });
    skillsByJobId.set(skill.jobId, rows);
  }

  const groups: ExportJobSkillGroup[] = jobIds.map((jobId) => {
    const category = getRawJobCategoryByJobId(jobId);
    const classNames = getClassNamesByJobId(jobId);

    return {
      jobId,
      ...(classNames.length > 0 ? { classNames } : {}),
      ...(category ? { category } : {}),
      skills: skillsByJobId.get(jobId) ?? [],
    };
  });

  const payload = {
    version,
    jobCount: groups.length,
    skillCount: skills.length,
    groups,
  };

  await mkdir(path.dirname(outputPath), {
    recursive: true,
  });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log('Exported game skills by raw job:', {
    version,
    jobCount: payload.jobCount,
    skillCount: payload.skillCount,
    outputPath,
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDb();
  });
