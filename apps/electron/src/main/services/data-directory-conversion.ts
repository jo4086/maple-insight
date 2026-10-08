import { randomUUID } from 'node:crypto'
import { readdir, lstat, mkdir, rename, rm, stat } from 'node:fs/promises'
import { basename, dirname, extname, join, relative } from 'node:path'

import type {
  DataDirectoryConversionFileSummary,
  DataDirectoryConversionProgress,
  DataDirectoryConversionSummary,
  DataDirectoryFileInfo,
  DataDirectoryInfo,
  DataFileConversionSummary
} from '../../shared/data-import'

import {
  convertDataFile,
  DataFileConversionError,
  validateConversionIdentity
} from './data-conversion'

type DiscoveredCsvFile = DataDirectoryFileInfo & {
  path: string
}

export type ConvertDataDirectoryOptions = {
  sessionId: string
  directoryPath: string
  targetVersion: string
  workspaceRoot: string
  signal?: AbortSignal
  onProgress?: (progress: DataDirectoryConversionProgress) => void
}

function normalizeRelativePath(directoryPath: string, filePath: string): string {
  return relative(directoryPath, filePath).split('\\').join('/')
}

async function scanCsvFiles(directoryPath: string): Promise<DiscoveredCsvFile[]> {
  const files: DiscoveredCsvFile[] = []

  async function visit(currentPath: string): Promise<void> {
    const entries = await readdir(currentPath, { withFileTypes: true })
    entries.sort((left, right) => left.name.localeCompare(right.name, 'en'))

    for (const entry of entries) {
      const entryPath = join(currentPath, entry.name)
      if (entry.isSymbolicLink()) continue

      if (entry.isDirectory()) {
        await visit(entryPath)
        continue
      }

      if (!entry.isFile() || extname(entry.name).toLowerCase() !== '.csv') continue

      const fileStat = await stat(entryPath)
      files.push({
        name: entry.name,
        relativePath: normalizeRelativePath(directoryPath, entryPath),
        path: entryPath,
        size: fileStat.size,
        modifiedAt: fileStat.mtime.toISOString()
      })
    }
  }

  await visit(directoryPath)
  return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath, 'en'))
}

export async function inspectDataDirectory(directoryPath: string): Promise<DataDirectoryInfo> {
  const directoryStat = await lstat(directoryPath)
  if (!directoryStat.isDirectory() || directoryStat.isSymbolicLink()) {
    throw new DataFileConversionError([
      {
        severity: 'error',
        code: 'INVALID_DIRECTORY',
        message: '일반 데이터 폴더만 선택할 수 있습니다.'
      }
    ])
  }

  const files = await scanCsvFiles(directoryPath)
  if (files.length === 0) {
    throw new DataFileConversionError([
      {
        severity: 'error',
        code: 'NO_CSV_FILES',
        message: '선택한 폴더에서 CSV 파일을 찾을 수 없습니다.'
      }
    ])
  }

  return {
    name: basename(directoryPath),
    path: directoryPath,
    size: files.reduce((total, file) => total + file.size, 0),
    modifiedAt: directoryStat.mtime.toISOString(),
    fileCount: files.length,
    files: files.map(({ name, relativePath, size, modifiedAt }) => ({
      name,
      relativePath,
      size,
      modifiedAt
    }))
  }
}

export async function convertDataDirectory(
  options: ConvertDataDirectoryOptions
): Promise<DataDirectoryConversionSummary> {
  validateConversionIdentity(options.sessionId, options.targetVersion)
  if (options.signal?.aborted) {
    throw new DataFileConversionError([
      { severity: 'error', code: 'CANCELLED', message: '폴더 변환이 취소되었습니다.' }
    ])
  }

  const directory = await inspectDataDirectory(options.directoryPath)
  const files = await scanCsvFiles(options.directoryPath)
  const importsDirectory = join(options.workspaceRoot, 'imports')
  const sessionDirectory = join(importsDirectory, options.sessionId)
  const outputDirectory = join(sessionDirectory, 'files')
  const workDirectory = join(sessionDirectory, '.work')

  await mkdir(importsDirectory, { recursive: true })
  try {
    await mkdir(sessionDirectory)
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

  const totalBytes = files.reduce((total, file) => total + file.size, 0)
  const summaries: DataDirectoryConversionFileSummary[] = []
  let completedBytes = 0
  let completedRecords = 0

  try {
    for (const [index, file] of files.entries()) {
      if (options.signal?.aborted) {
        throw new DataFileConversionError([
          { severity: 'error', code: 'CANCELLED', message: '폴더 변환이 취소되었습니다.' }
        ])
      }

      const childSessionId = randomUUID()
      let summary: DataFileConversionSummary
      try {
        summary = await convertDataFile({
          sessionId: childSessionId,
          sourcePath: file.path,
          targetVersion: options.targetVersion,
          workspaceRoot: workDirectory,
          signal: options.signal,
          onProgress: (progress) => {
            const processedBytes = completedBytes + progress.processedBytes
            options.onProgress?.({
              ...progress,
              sessionId: options.sessionId,
              processedBytes,
              totalBytes,
              percent: Math.min(100, (processedBytes / totalBytes) * 100),
              processedRecords: completedRecords + progress.processedRecords,
              currentFile: file.relativePath,
              processedFiles: progress.stage === 'completed' ? index + 1 : index,
              totalFiles: files.length
            })
          }
        })
      } catch (error) {
        if (error instanceof DataFileConversionError) {
          throw new DataFileConversionError(
            error.issues.map((issue) => ({ ...issue, file: file.relativePath }))
          )
        }
        throw error
      }

      const outputRelativePath = file.relativePath.replace(/\.csv$/i, '.ndjson')
      const outputPath = join(outputDirectory, ...outputRelativePath.split('/'))
      await mkdir(dirname(outputPath), { recursive: true })
      await rename(summary.outputPath, outputPath)
      await rm(join(workDirectory, 'imports', childSessionId), { recursive: true, force: true })

      summaries.push({
        relativePath: file.relativePath,
        outputPath,
        size: summary.source.size,
        sha256: summary.source.sha256,
        totalRecords: summary.totalRecords,
        convertedRecords: summary.convertedRecords,
        rejectedRecords: summary.rejectedRecords,
        issues: summary.issues
      })
      completedBytes += file.size
      completedRecords += summary.convertedRecords
    }

    await rm(workDirectory, { recursive: true, force: true })
    return {
      sessionId: options.sessionId,
      targetVersion: options.targetVersion,
      sourceDirectory: directory.name,
      outputPath: outputDirectory,
      totalFiles: files.length,
      convertedFiles: summaries.length,
      totalBytes,
      totalRecords: summaries.reduce((total, summary) => total + summary.totalRecords, 0),
      convertedRecords: summaries.reduce((total, summary) => total + summary.convertedRecords, 0),
      rejectedRecords: summaries.reduce((total, summary) => total + summary.rejectedRecords, 0),
      files: summaries,
      issues: summaries.flatMap(({ issues }) => issues)
    }
  } catch (error) {
    await rm(sessionDirectory, { recursive: true, force: true })
    throw error
  }
}
