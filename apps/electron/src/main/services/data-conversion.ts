import { createHash } from 'node:crypto'
import { once } from 'node:events'
import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir, rm, stat } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import { parse, type CsvError, type Info } from 'csv-parse'
import { streamArray } from 'stream-json/streamers/stream-array.js'

import type {
  DataConversionIssue,
  DataFileConversionProgress,
  DataFileConversionSummary,
  DataFileFormat,
  DataRecord
} from '../../shared/data-import'

const PREVIEW_RECORD_LIMIT = 20
const VERSION_PATTERN = /^\d+\.\d+\.\d+$/
const SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type CsvRecordWithInfo = {
  record: Record<string, string>
  info: Info
}

export class DataFileConversionError extends Error {
  readonly issues: DataConversionIssue[]

  constructor(issues: DataConversionIssue[]) {
    super(issues[0]?.message ?? '데이터 파일 변환에 실패했습니다.')
    this.name = 'DataFileConversionError'
    this.issues = issues
  }
}

export type ConvertDataFileOptions = {
  sessionId: string
  sourcePath: string
  targetVersion: string
  workspaceRoot: string
  signal?: AbortSignal
  onProgress?: (progress: DataFileConversionProgress) => void
}

function resolveFormat(filePath: string): DataFileFormat {
  const extension = extname(filePath).toLowerCase()

  if (extension === '.csv') return 'csv'
  if (extension === '.json') return 'json'

  throw new DataFileConversionError([
    {
      severity: 'error',
      code: 'UNSUPPORTED_FORMAT',
      message: 'CSV 또는 JSON 파일만 변환할 수 있습니다.'
    }
  ])
}

export function validateConversionIdentity(sessionId: string, targetVersion: string): void {
  if (!SESSION_ID_PATTERN.test(sessionId)) {
    throw new DataFileConversionError([
      { severity: 'error', code: 'INVALID_SESSION_ID', message: '잘못된 가져오기 세션 ID입니다.' }
    ])
  }

  if (!VERSION_PATTERN.test(targetVersion)) {
    throw new DataFileConversionError([
      { severity: 'error', code: 'INVALID_VERSION', message: '게임 버전 형식이 올바르지 않습니다.' }
    ])
  }
}

function assertNotAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DataFileConversionError([
      { severity: 'error', code: 'CANCELLED', message: '파일 변환이 취소되었습니다.' }
    ])
  }
}

function assertRecord(value: unknown, row: number): asserts value is DataRecord {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new DataFileConversionError([
      {
        severity: 'error',
        code: 'INVALID_RECORD',
        message: '각 데이터 레코드는 JSON 객체여야 합니다.',
        row
      }
    ])
  }
}

function normalizeHeaders(headers: string[]): string[] {
  const normalized = headers.map((header, index) =>
    index === 0 ? header.replace(/^\uFEFF/u, '') : header
  )
  const seen = new Set<string>()

  for (const header of normalized) {
    if (!header) {
      throw new DataFileConversionError([
        { severity: 'error', code: 'EMPTY_HEADER', message: 'CSV 헤더는 비어 있을 수 없습니다.' }
      ])
    }

    if (seen.has(header)) {
      throw new DataFileConversionError([
        {
          severity: 'error',
          code: 'DUPLICATE_HEADER',
          message: `중복된 CSV 헤더가 있습니다: ${header}`,
          field: header
        }
      ])
    }

    seen.add(header)
  }

  return normalized
}

function toIssue(error: unknown, format: DataFileFormat): DataConversionIssue {
  if (error instanceof DataFileConversionError) return error.issues[0]

  if (format === 'csv' && error instanceof Error && 'code' in error) {
    const csvError = error as CsvError

    const row = typeof csvError.lines === 'number' ? csvError.lines : undefined
    const column =
      typeof csvError.column === 'number' || typeof csvError.column === 'string'
        ? csvError.column
        : undefined

    return {
      severity: 'error',
      code: csvError.code || 'INVALID_CSV',
      message: csvError.message,
      row,
      column
    }
  }

  return {
    severity: 'error',
    code: format === 'json' ? 'INVALID_JSON' : 'CONVERSION_FAILED',
    message: error instanceof Error ? error.message : String(error)
  }
}

async function writeRecord(
  output: ReturnType<typeof createWriteStream>,
  record: DataRecord
): Promise<void> {
  if (!output.write(`${JSON.stringify(record)}\n`)) {
    await once(output, 'drain')
  }
}

export async function convertDataFile(
  options: ConvertDataFileOptions
): Promise<DataFileConversionSummary> {
  validateConversionIdentity(options.sessionId, options.targetVersion)
  assertNotAborted(options.signal)

  const format = resolveFormat(options.sourcePath)
  const sourceBefore = await stat(options.sourcePath)

  if (!sourceBefore.isFile() || sourceBefore.size === 0) {
    throw new DataFileConversionError([
      { severity: 'error', code: 'EMPTY_FILE', message: '비어 있거나 일반 파일이 아닙니다.' }
    ])
  }

  const importsDir = join(options.workspaceRoot, 'imports')
  const sessionDir = join(importsDir, options.sessionId)
  const outputPath = join(sessionDir, 'records.ndjson')
  await mkdir(importsDir, { recursive: true })
  try {
    await mkdir(sessionDir)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
      throw new DataFileConversionError([
        {
          severity: 'error',
          code: 'SESSION_EXISTS',
          message: '같은 ID의 가져오기 세션이 이미 존재합니다.'
        }
      ])
    }

    throw error
  }

  const hash = createHash('sha256')
  let processedBytes = 0
  let processedRecords = 0
  const previewRecords: DataRecord[] = []
  const source = createReadStream(options.sourcePath)
  const output = createWriteStream(outputPath, { encoding: 'utf8', flags: 'wx' })
  // Write failures are observed by write callbacks and `once(output, 'finish')`.
  // Keep an error listener attached so an asynchronous open/write failure cannot
  // surface as an uncaught exception while a failed import is being cleaned up.
  output.on('error', () => undefined)
  const decoder = new TextDecoder('utf-8', { fatal: true })
  const monitor = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      hash.update(chunk)
      processedBytes += chunk.length
      options.onProgress?.({
        sessionId: options.sessionId,
        stage: 'reading',
        processedBytes,
        totalBytes: sourceBefore.size,
        percent: Math.min(100, (processedBytes / sourceBefore.size) * 100),
        processedRecords
      })
      try {
        callback(null, decoder.decode(chunk, { stream: true }))
      } catch {
        callback(
          new DataFileConversionError([
            {
              severity: 'error',
              code: 'INVALID_ENCODING',
              message: '입력 파일은 올바른 UTF-8 형식이어야 합니다.'
            }
          ])
        )
      }
    },
    flush(callback) {
      try {
        callback(null, decoder.decode())
      } catch {
        callback(
          new DataFileConversionError([
            {
              severity: 'error',
              code: 'INVALID_ENCODING',
              message: '입력 파일은 올바른 UTF-8 형식이어야 합니다.'
            }
          ])
        )
      }
    }
  })

  const abort = (): void => {
    source.destroy()
    monitor.destroy()
    output.destroy()
  }
  options.signal?.addEventListener('abort', abort, { once: true })

  try {
    options.onProgress?.({
      sessionId: options.sessionId,
      stage: 'parsing',
      processedBytes,
      totalBytes: sourceBefore.size,
      percent: 0,
      processedRecords
    })

    if (format === 'csv') {
      const parser = parse({
        bom: true,
        columns: normalizeHeaders,
        info: true,
        skip_empty_lines: true,
        relax_column_count: false
      })
      let pipelineError: unknown
      const completion = pipeline(source, monitor, parser).catch((error: unknown) => {
        pipelineError = error
      })
      let iterationError: unknown

      try {
        for await (const item of parser as AsyncIterable<CsvRecordWithInfo>) {
          assertNotAborted(options.signal)
          const record: DataRecord = item.record
          processedRecords += 1
          if (previewRecords.length < PREVIEW_RECORD_LIMIT) previewRecords.push(record)
          await writeRecord(output, record)
        }
      } catch (error) {
        iterationError = error
      }

      await completion
      if (iterationError instanceof DataFileConversionError) throw iterationError
      if (pipelineError) throw pipelineError
      if (iterationError) throw iterationError
    } else {
      const parser = streamArray.withParserAsStream()
      let pipelineError: unknown
      const completion = pipeline(source, monitor, parser).catch((error: unknown) => {
        pipelineError = error
      })
      let iterationError: unknown

      try {
        for await (const item of parser as AsyncIterable<{
          key: number
          value: unknown
        }>) {
          assertNotAborted(options.signal)
          assertRecord(item.value, item.key + 1)
          processedRecords += 1
          if (previewRecords.length < PREVIEW_RECORD_LIMIT) previewRecords.push(item.value)
          await writeRecord(output, item.value)
        }
      } catch (error) {
        iterationError = error
      }

      await completion
      if (iterationError instanceof DataFileConversionError) throw iterationError
      if (pipelineError) throw pipelineError
      if (iterationError) throw iterationError
    }

    if (processedRecords === 0) {
      throw new DataFileConversionError([
        { severity: 'error', code: 'NO_RECORDS', message: '변환할 데이터 레코드가 없습니다.' }
      ])
    }

    options.onProgress?.({
      sessionId: options.sessionId,
      stage: 'writing',
      processedBytes,
      totalBytes: sourceBefore.size,
      percent: 100,
      processedRecords
    })
    output.end()
    await once(output, 'finish')

    const sourceAfter = await stat(options.sourcePath)
    if (sourceAfter.size !== sourceBefore.size || sourceAfter.mtimeMs !== sourceBefore.mtimeMs) {
      throw new DataFileConversionError([
        {
          severity: 'error',
          code: 'SOURCE_CHANGED',
          message: '변환 중 원본 파일이 변경되었습니다.'
        }
      ])
    }

    const summary: DataFileConversionSummary = {
      sessionId: options.sessionId,
      targetVersion: options.targetVersion,
      source: {
        name: basename(options.sourcePath),
        format,
        size: sourceBefore.size,
        modifiedAt: sourceBefore.mtime.toISOString(),
        sha256: hash.digest('hex')
      },
      outputPath,
      totalRecords: processedRecords,
      convertedRecords: processedRecords,
      rejectedRecords: 0,
      previewRecords,
      issues: []
    }

    options.onProgress?.({
      sessionId: options.sessionId,
      stage: 'completed',
      processedBytes: sourceBefore.size,
      totalBytes: sourceBefore.size,
      percent: 100,
      processedRecords
    })

    return summary
  } catch (error) {
    source.destroy()
    monitor.destroy()
    output.destroy()
    if (!output.closed) {
      await new Promise<void>((resolve) => output.once('close', resolve))
    }
    await rm(sessionDir, { recursive: true, force: true })

    if (options.signal?.aborted) {
      throw new DataFileConversionError([
        { severity: 'error', code: 'CANCELLED', message: '파일 변환이 취소되었습니다.' }
      ])
    }

    const issues =
      error instanceof DataFileConversionError ? error.issues : [toIssue(error, format)]
    throw new DataFileConversionError(
      issues.map((issue) => ({ file: basename(options.sourcePath), ...issue }))
    )
  } finally {
    options.signal?.removeEventListener('abort', abort)
  }
}
