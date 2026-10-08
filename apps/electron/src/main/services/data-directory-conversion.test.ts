import { randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, readFile, stat, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { convertDataDirectory, inspectDataDirectory } from './data-directory-conversion'

const temporaryDirectories: string[] = []

async function createWorkspace(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'maple-electron-directory-'))
  temporaryDirectories.push(directory)
  return directory
}

afterEach(async () => {
  const { rm } = await import('node:fs/promises')
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true }))
  )
})

describe('data directory conversion', () => {
  it('discovers nested CSV files in deterministic order', async () => {
    const workspace = await createWorkspace()
    const source = join(workspace, '1.2.419')
    await mkdir(join(source, 'csv'), { recursive: true })
    await writeFile(join(source, 'z.csv'), 'id\n1\n', 'utf8')
    await writeFile(join(source, 'csv', 'a.CSV'), 'id\n2\n', 'utf8')
    await writeFile(join(source, 'ignored.json'), '[]', 'utf8')
    await symlink(join(source, 'z.csv'), join(source, 'linked.csv'))

    const directory = await inspectDataDirectory(source)

    expect(directory.name).toBe('1.2.419')
    expect(directory.fileCount).toBe(2)
    expect(directory.files.map(({ relativePath }) => relativePath)).toEqual(['csv/a.CSV', 'z.csv'])
    expect(directory.size).toBe(Buffer.byteLength('id\n2\n') + Buffer.byteLength('id\n1\n'))
  })

  it('rejects a directory without CSV files', async () => {
    const workspace = await createWorkspace()
    const source = join(workspace, 'empty')
    await mkdir(source)
    await writeFile(join(source, 'data.json'), '[]', 'utf8')

    await expect(inspectDataDirectory(source)).rejects.toMatchObject({
      issues: [{ code: 'NO_CSV_FILES' }]
    })
  })

  it('converts all CSV files and preserves relative paths', async () => {
    const workspace = await createWorkspace()
    const source = join(workspace, '1.2.419')
    const outputRoot = join(workspace, 'output')
    await mkdir(join(source, 'csv'), { recursive: true })
    await writeFile(join(source, 'ms_job.csv'), 'id,name\n000,beginner\n', 'utf8')
    await writeFile(
      join(source, 'csv', 'ms_skill.csv'),
      'id,name\n100,skill-a\n200,skill-b\n',
      'utf8'
    )
    const progress: string[] = []

    const summary = await convertDataDirectory({
      sessionId: randomUUID(),
      directoryPath: source,
      targetVersion: '1.2.419',
      workspaceRoot: outputRoot,
      onProgress: ({ currentFile }) => progress.push(currentFile)
    })

    expect(summary.totalFiles).toBe(2)
    expect(summary.convertedFiles).toBe(2)
    expect(summary.convertedRecords).toBe(3)
    expect(summary.files.map(({ relativePath }) => relativePath)).toEqual([
      'csv/ms_skill.csv',
      'ms_job.csv'
    ])
    expect(await readFile(join(summary.outputPath, 'csv', 'ms_skill.ndjson'), 'utf8')).toBe(
      '{"id":"100","name":"skill-a"}\n{"id":"200","name":"skill-b"}\n'
    )
    expect(await readFile(join(summary.outputPath, 'ms_job.ndjson'), 'utf8')).toBe(
      '{"id":"000","name":"beginner"}\n'
    )
    expect(progress).toContain('csv/ms_skill.csv')
    expect(progress).toContain('ms_job.csv')
  })

  it('removes the entire batch when one CSV fails', async () => {
    const workspace = await createWorkspace()
    const source = join(workspace, 'source')
    const outputRoot = join(workspace, 'output')
    const sessionId = randomUUID()
    await mkdir(source)
    await writeFile(join(source, 'a-valid.csv'), 'id,name\n1,valid\n', 'utf8')
    await writeFile(join(source, 'b-invalid.csv'), 'id,name\n1,invalid,extra\n', 'utf8')

    await expect(
      convertDataDirectory({
        sessionId,
        directoryPath: source,
        targetVersion: '1.2.419',
        workspaceRoot: outputRoot
      })
    ).rejects.toMatchObject({
      issues: [expect.objectContaining({ file: 'b-invalid.csv' })]
    })
    await expect(stat(join(outputRoot, 'imports', sessionId))).rejects.toMatchObject({
      code: 'ENOENT'
    })
  })

  it('removes the entire batch when cancelled between files', async () => {
    const workspace = await createWorkspace()
    const source = join(workspace, 'source')
    const outputRoot = join(workspace, 'output')
    const sessionId = randomUUID()
    const controller = new AbortController()
    await mkdir(source)
    await writeFile(join(source, 'a.csv'), 'id\n1\n', 'utf8')
    await writeFile(join(source, 'b.csv'), 'id\n2\n', 'utf8')

    await expect(
      convertDataDirectory({
        sessionId,
        directoryPath: source,
        targetVersion: '1.2.419',
        workspaceRoot: outputRoot,
        signal: controller.signal,
        onProgress: ({ processedFiles }) => {
          if (processedFiles === 1) controller.abort()
        }
      })
    ).rejects.toMatchObject({
      issues: [{ code: 'CANCELLED' }]
    })
    await expect(stat(join(outputRoot, 'imports', sessionId))).rejects.toMatchObject({
      code: 'ENOENT'
    })
  })
})
