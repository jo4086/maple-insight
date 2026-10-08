import { createHash, randomUUID } from 'node:crypto'
import type { Stats } from 'node:fs'
import { mkdir, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import type { DataFileConversionSummary } from '../../shared/data-import'

import { convertDataFile } from './data-conversion'

const temporaryDirectories: string[] = []

async function createWorkspace(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'maple-electron-conversion-'))
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

async function convertFixture(
  name: string,
  content: string
): Promise<{ summary: DataFileConversionSummary; sourcePath: string; before: Stats }> {
  const workspaceRoot = await createWorkspace()
  const sourcePath = join(workspaceRoot, name)
  await writeFile(sourcePath, content, 'utf8')
  const before = await stat(sourcePath)
  const summary = await convertDataFile({
    sessionId: randomUUID(),
    sourcePath,
    targetVersion: '1.2.424',
    workspaceRoot
  })

  return { summary, sourcePath, before }
}

describe('convertDataFile', () => {
  it('streams CSV records and preserves leading zero IDs', async () => {
    const { summary } = await convertFixture(
      'jobs.csv',
      '\uFEFFjobID,jobName\r\n000,모험의 기술\r\n100,전사의 기본\r\n'
    )

    expect(summary.totalRecords).toBe(2)
    expect(summary.previewRecords).toEqual([
      { jobID: '000', jobName: '모험의 기술' },
      { jobID: '100', jobName: '전사의 기본' }
    ])
    expect(await readFile(summary.outputPath, 'utf8')).toBe(
      '{"jobID":"000","jobName":"모험의 기술"}\n' + '{"jobID":"100","jobName":"전사의 기본"}\n'
    )
  })

  it('streams a top-level JSON array', async () => {
    const { summary } = await convertFixture(
      'jobs.json',
      JSON.stringify([
        { jobID: '000', jobName: '모험의 기술' },
        { jobID: '100', jobName: '전사의 기본' }
      ])
    )

    expect(summary.totalRecords).toBe(2)
    expect(summary.previewRecords[0]).toEqual({ jobID: '000', jobName: '모험의 기술' })
  })

  it('does not modify the source file', async () => {
    const content = 'jobID,jobName\n000,모험의 기술\n'
    const { sourcePath, before } = await convertFixture('jobs.csv', content)
    const after = await stat(sourcePath)

    expect(await readFile(sourcePath, 'utf8')).toBe(content)
    expect(after.size).toBe(before.size)
    expect(after.mtimeMs).toBe(before.mtimeMs)
  })

  it('returns a reproducible SHA-256 hash', async () => {
    const content = 'jobID,jobName\n000,모험의 기술\n'
    const first = await convertFixture('first.csv', content)
    const second = await convertFixture('second.csv', content)
    const expected = createHash('sha256').update(content).digest('hex')

    expect(first.summary.source.sha256).toBe(expected)
    expect(second.summary.source.sha256).toBe(expected)
    expect(await readFile(first.summary.outputPath, 'utf8')).toBe(
      await readFile(second.summary.outputPath, 'utf8')
    )
  })

  it('rejects an empty file with a structured issue', async () => {
    const workspaceRoot = await createWorkspace()
    const sourcePath = join(workspaceRoot, 'empty.csv')
    await writeFile(sourcePath, '', 'utf8')

    await expect(
      convertDataFile({
        sessionId: randomUUID(),
        sourcePath,
        targetVersion: '1.2.424',
        workspaceRoot
      })
    ).rejects.toMatchObject({
      issues: [{ code: 'EMPTY_FILE' }]
    })
  })

  it('reports inconsistent CSV columns', async () => {
    await expect(convertFixture('invalid.csv', 'id,name\n1,one,extra\n')).rejects.toMatchObject({
      issues: [expect.objectContaining({ severity: 'error', row: 2 })]
    })
  })

  it('reports an unclosed CSV quote', async () => {
    await expect(convertFixture('invalid-quote.csv', 'id,name\n1,"open\n')).rejects.toMatchObject({
      issues: [expect.objectContaining({ severity: 'error', code: 'CSV_QUOTE_NOT_CLOSED' })]
    })
  })

  it('rejects duplicate CSV headers', async () => {
    await expect(convertFixture('duplicate-header.csv', 'id,id\n1,2\n')).rejects.toMatchObject({
      issues: [
        expect.objectContaining({
          code: 'DUPLICATE_HEADER',
          field: 'id',
          file: 'duplicate-header.csv'
        })
      ]
    })
  })

  it('rejects invalid UTF-8 input', async () => {
    const workspaceRoot = await createWorkspace()
    const sourcePath = join(workspaceRoot, 'invalid-encoding.csv')
    await writeFile(sourcePath, Buffer.from([0x69, 0x64, 0x0a, 0xff, 0x0a]))

    await expect(
      convertDataFile({
        sessionId: randomUUID(),
        sourcePath,
        targetVersion: '1.2.424',
        workspaceRoot
      })
    ).rejects.toMatchObject({
      issues: [expect.objectContaining({ code: 'INVALID_ENCODING' })]
    })
  })

  it('reports malformed JSON', async () => {
    await expect(convertFixture('invalid.json', '[{"id":"001"}')).rejects.toMatchObject({
      issues: [expect.objectContaining({ code: 'INVALID_JSON' })]
    })
  })

  it('requires a top-level JSON array', async () => {
    await expect(convertFixture('object.json', '{"id":"001"}')).rejects.toMatchObject({
      issues: [expect.objectContaining({ code: 'INVALID_JSON', file: 'object.json' })]
    })
  })

  it('rejects non-object JSON array entries', async () => {
    await expect(convertFixture('invalid-record.json', '[1, 2, 3]')).rejects.toMatchObject({
      issues: [{ code: 'INVALID_RECORD', row: 1 }]
    })
  })

  it('cancels before opening the source', async () => {
    const workspaceRoot = await createWorkspace()
    const sourcePath = join(workspaceRoot, 'jobs.csv')
    await writeFile(sourcePath, 'id,name\n1,test\n', 'utf8')
    const controller = new AbortController()
    controller.abort()

    await expect(
      convertDataFile({
        sessionId: randomUUID(),
        sourcePath,
        targetVersion: '1.2.424',
        workspaceRoot,
        signal: controller.signal
      })
    ).rejects.toMatchObject({
      issues: [{ code: 'CANCELLED' }]
    })
  })

  it('streams a large CSV without dropping records', async () => {
    const recordCount = 25_000
    const rows = Array.from(
      { length: recordCount },
      (_, index) => `${String(index).padStart(6, '0')},skill-${index}`
    )
    const { summary } = await convertFixture('large.csv', `id,name\n${rows.join('\n')}\n`)
    const output = await readFile(summary.outputPath, 'utf8')

    expect(summary.totalRecords).toBe(recordCount)
    expect(summary.convertedRecords).toBe(recordCount)
    expect(summary.rejectedRecords).toBe(0)
    expect(output.trimEnd().split('\n')).toHaveLength(recordCount)
  })

  it('cleans the partial output after cancellation during streaming', async () => {
    const workspaceRoot = await createWorkspace()
    const sourcePath = join(workspaceRoot, 'large.csv')
    const sessionId = randomUUID()
    const controller = new AbortController()
    const rows = Array.from({ length: 25_000 }, (_, index) => `${index},skill-${index}`)
    await writeFile(sourcePath, `id,name\n${rows.join('\n')}\n`, 'utf8')

    await expect(
      convertDataFile({
        sessionId,
        sourcePath,
        targetVersion: '1.2.424',
        workspaceRoot,
        signal: controller.signal,
        onProgress: ({ processedBytes }) => {
          if (processedBytes > 0) controller.abort()
        }
      })
    ).rejects.toMatchObject({
      issues: [expect.objectContaining({ code: 'CANCELLED' })]
    })
    await expect(stat(join(workspaceRoot, 'imports', sessionId))).rejects.toMatchObject({
      code: 'ENOENT'
    })
  })

  it('does not overwrite an existing import session', async () => {
    const workspaceRoot = await createWorkspace()
    const sourcePath = join(workspaceRoot, 'jobs.csv')
    const sessionId = randomUUID()
    const sessionDir = join(workspaceRoot, 'imports', sessionId)
    const markerPath = join(sessionDir, 'existing.txt')
    await writeFile(sourcePath, 'id,name\n1,test\n', 'utf8')
    await mkdir(sessionDir, { recursive: true })
    await writeFile(markerPath, 'keep', 'utf8')

    await expect(
      convertDataFile({
        sessionId,
        sourcePath,
        targetVersion: '1.2.424',
        workspaceRoot
      })
    ).rejects.toMatchObject({
      issues: [expect.objectContaining({ code: 'SESSION_EXISTS' })]
    })
    expect(await readFile(markerPath, 'utf8')).toBe('keep')
  })
})
