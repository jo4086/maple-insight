import { randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import type { DataDirectoryConversionSummary } from '../../shared/data-import'

import { commitDataVersionWorkspace, prepareDataVersionWorkspace } from './data-version-workspace'

const temporaryDirectories: string[] = []

async function createWorkspace(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'maple-version-workspace-'))
  temporaryDirectories.push(directory)
  return directory
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true }))
  )
})

describe('data version workspace', () => {
  it('copies CSV files and creates JSON arrays and a manifest', async () => {
    const workspace = await createWorkspace()
    const sourceDirectory = join(workspace, 'source', '1.2.419')
    const conversionDirectory = join(workspace, 'conversion')
    const dataRoot = join(workspace, 'data')
    await mkdir(join(sourceDirectory, 'csv'), { recursive: true })
    await mkdir(conversionDirectory)
    await writeFile(join(sourceDirectory, 'csv', 'ms_job.csv'), 'jobID,jobName\n000,초보자\n')
    const ndjsonPath = join(conversionDirectory, 'ms_job.ndjson')
    await writeFile(ndjsonPath, '{"jobID":"000","jobName":"초보자"}\n')
    const conversion = createConversionSummary(ndjsonPath)

    const prepared = await prepareDataVersionWorkspace({
      dataRoot,
      sessionId: randomUUID(),
      sourceDirectory,
      conversion,
      environment: 'production',
      releasedOn: '2026-10-08'
    })
    await commitDataVersionWorkspace(prepared)

    expect(prepared.versionDirectory).toBe(join(dataRoot, 'production', '1.2.419'))
    expect(await readFile(join(prepared.csvDirectory, 'ms_job.csv'), 'utf8')).toContain('000')
    expect(JSON.parse(await readFile(join(prepared.jsonDirectory, 'ms_job.json'), 'utf8'))).toEqual(
      [{ jobID: '000', jobName: '초보자' }]
    )
    expect(JSON.parse(await readFile(prepared.manifestPath, 'utf8'))).toMatchObject({
      version: '1.2.419',
      environment: 'production',
      releasedOn: '2026-10-08',
      totalFiles: 1,
      totalRecords: 1
    })
  })

  it('does not overwrite an existing version directory', async () => {
    const workspace = await createWorkspace()
    const dataRoot = join(workspace, 'data')
    const sourceDirectory = join(workspace, 'source')
    const ndjsonPath = join(workspace, 'record.ndjson')
    await mkdir(join(dataRoot, 'production', '1.2.419'), { recursive: true })
    await mkdir(sourceDirectory)
    await writeFile(join(sourceDirectory, 'ms_job.csv'), 'jobID\n000\n')
    await writeFile(ndjsonPath, '{"jobID":"000"}\n')

    await expect(
      prepareDataVersionWorkspace({
        dataRoot,
        sessionId: randomUUID(),
        sourceDirectory,
        conversion: createConversionSummary(ndjsonPath, 'ms_job.csv'),
        environment: 'production',
        releasedOn: '2026-10-08'
      })
    ).rejects.toThrow('Version data directory already exists')
  })

  it('promotes an existing flat legacy version directory in place', async () => {
    const workspace = await createWorkspace()
    const dataRoot = join(workspace, 'data')
    const sourceDirectory = join(dataRoot, 'production', '1.2.419')
    const ndjsonPath = join(workspace, 'record.ndjson')
    await mkdir(sourceDirectory, { recursive: true })
    await writeFile(join(sourceDirectory, 'ms_job.csv'), 'jobID\n000\n')
    await writeFile(ndjsonPath, '{"jobID":"000"}\n')

    const prepared = await prepareDataVersionWorkspace({
      dataRoot,
      sessionId: randomUUID(),
      sourceDirectory,
      conversion: createConversionSummary(ndjsonPath, 'ms_job.csv'),
      environment: 'production',
      releasedOn: '2026-10-08'
    })
    await commitDataVersionWorkspace(prepared)

    expect(await readFile(join(sourceDirectory, 'csv', 'ms_job.csv'), 'utf8')).toContain('000')
    expect(
      JSON.parse(await readFile(join(sourceDirectory, 'json', 'ms_job.json'), 'utf8'))
    ).toEqual([{ jobID: '000' }])
  })

  it('stores test versions under the test environment directory', async () => {
    const workspace = await createWorkspace()
    const sourceDirectory = join(workspace, 'source', '1.2.206')
    const dataRoot = join(workspace, 'data')
    const ndjsonPath = join(workspace, 'record.ndjson')
    await mkdir(sourceDirectory, { recursive: true })
    await writeFile(join(sourceDirectory, 'ms_job.csv'), 'jobID\n000\n')
    await writeFile(ndjsonPath, '{"jobID":"000"}\n')

    const prepared = await prepareDataVersionWorkspace({
      dataRoot,
      sessionId: randomUUID(),
      sourceDirectory,
      conversion: createConversionSummary(ndjsonPath, 'ms_job.csv', '1.2.206'),
      environment: 'test',
      releasedOn: null
    })
    await commitDataVersionWorkspace(prepared)

    expect(prepared.versionDirectory).toBe(join(dataRoot, 'test', '1.2.206'))
    expect(await readFile(join(prepared.csvDirectory, 'ms_job.csv'), 'utf8')).toContain('000')
    expect(JSON.parse(await readFile(prepared.manifestPath, 'utf8'))).toMatchObject({
      version: '1.2.206',
      environment: 'test',
      releasedOn: null
    })
  })
})

function createConversionSummary(
  outputPath: string,
  relativePath = 'csv/ms_job.csv',
  targetVersion = '1.2.419'
): DataDirectoryConversionSummary {
  return {
    sessionId: randomUUID(),
    targetVersion,
    sourceDirectory: targetVersion,
    outputPath: join(outputPath, '..'),
    totalFiles: 1,
    convertedFiles: 1,
    totalBytes: 20,
    totalRecords: 1,
    convertedRecords: 1,
    rejectedRecords: 0,
    files: [
      {
        relativePath,
        outputPath,
        size: 20,
        sha256: 'hash',
        totalRecords: 1,
        convertedRecords: 1,
        rejectedRecords: 0,
        issues: []
      }
    ],
    issues: []
  }
}
