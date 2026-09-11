import 'dotenv/config';

import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { disconnectDb } from '@maple/db';
import {
  categoryJobIdFileNameMap,
  createGeneratedRawSkillGroupsByCategory,
  createGeneratedRawSkillGroupsByFinalClass,
  finalClassFileNameMap,
  finalClassJobIdMap,
} from '../dist/game-skill/index.js';

const DEFAULT_VERSION = '1.2.424';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(currentDir, '..');
const repoRoot = path.resolve(packageDir, '..', '..');

function toIndentedJson(value, indent) {
  return JSON.stringify(value, null, 2).replaceAll('\n', `\n${' '.repeat(indent)}`);
}

function toTsModule(entries, linkedGroups = {}) {
  const body = entries
    .map(([jobId, skills]) => `    ${JSON.stringify(jobId)}: ${toIndentedJson(skills, 4)}`)
    .join(',\n');

  return `export const skillData = {\n  skillGroups: {\n${body}\n  },\n  linkedGroups: ${toIndentedJson(linkedGroups, 2)},\n} as const;\n\nexport default skillData;\n`;
}

function getVersion() {
  return process.argv.slice(2).find((arg) => arg !== '--') ?? process.env.GAME_DATA_VERSION ?? DEFAULT_VERSION;
}

function getClassOutputJobIds(className, skillGroups) {
  const baseJobIds = finalClassJobIdMap[className] ?? [];
  const generatedJobIds = Object.keys(skillGroups);

  return [...new Set([...baseJobIds, ...generatedJobIds])];
}

async function main() {
  const version = getVersion();
  const outputDir = path.join(packageDir, 'src', 'generated', version, 'skills');
  const classGroups = await createGeneratedRawSkillGroupsByFinalClass(version);
  const categoryGroups = await createGeneratedRawSkillGroupsByCategory(version);

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  let fileCount = 0;
  let skillCount = 0;

  for (const [className, classSkillData] of Object.entries(classGroups)) {
    const { skillGroups, linkedGroups } = classSkillData;
    const fileName = finalClassFileNameMap[className] ?? className;
    const outputPath = path.join(outputDir, `${fileName}.ts`);
    const jobIds = getClassOutputJobIds(className, skillGroups);
    await writeFile(outputPath, toTsModule(jobIds.map((jobId) => [jobId, skillGroups[jobId] ?? []]), linkedGroups), 'utf8');
    fileCount += 1;
    skillCount += Object.values(skillGroups).reduce((sum, skills) => sum + skills.length, 0);
  }

  for (const fileName of Object.values(categoryJobIdFileNameMap)) {
    const group = categoryGroups[fileName];

    if (!group) {
      continue;
    }

    const outputPath = path.join(outputDir, `${fileName}.ts`);
    await writeFile(outputPath, toTsModule([[group.jobId, group.skills]]), 'utf8');
    fileCount += 1;
    skillCount += group.skills.length;
  }

  console.log('generated game skills by raw job:', {
    version,
    fileCount,
    skillCount,
    outputPath: path.relative(repoRoot, outputDir),
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDb();
  });
