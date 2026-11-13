import { open, rm, stat } from 'node:fs/promises'
import { basename, dirname, extname } from 'node:path'

import { app, dialog } from 'electron'

import type {
  DataDirectoryConversionProgress,
  DataDirectoryConversionRequest,
  DataDirectoryConversionResult,
  DataDirectoryInfo,
  DataFileConversionProgress,
  DataFileConversionRequest,
  DataFileConversionResult
} from '../../shared/data-import'
import { convertDataFile, DataFileConversionError } from '../services/import/data-conversion'
import {
  convertDataDirectory,
  inspectDataDirectory
} from '../services/import/data-directory-conversion'
import { classifyDataFile, type DataFileClassification } from '../services/import/typesafe'
import {
  commitDataVersionWorkspace,
  discardDataVersionWorkspace,
  prepareDataVersionWorkspace,
  type PreparedDataVersionWorkspace
} from '../services/versions/data-version-workspace'
import {
  markGameDataVersionImportFailed,
  registerGameDataVersionImport
} from '../services/versions/game-data-version-registration'

import type { MainIpcContext } from './register'

const OPEN_DATA_FILE_CHANNEL = 'data-file:open'
const OPEN_DATA_DIRECTORY_CHANNEL = 'data-directory:open'
const CLASSIFY_DATA_FILE_CHANNEL = 'data-file:classify'
const CONVERT_DATA_FILE_CHANNEL = 'data-file:convert'
const CANCEL_DATA_FILE_CONVERSION_CHANNEL = 'data-file:convert:cancel'
const DATA_FILE_CONVERSION_PROGRESS_CHANNEL = 'data-file:convert:progress'
const CONVERT_DATA_DIRECTORY_CHANNEL = 'data-directory:convert'
const DATA_DIRECTORY_CONVERSION_PROGRESS_CHANNEL = 'data-directory:convert:progress'
const DATA_FILE_PREVIEW_BYTES = 16 * 1024

type DataFileInfo = {
  name: string
  path: string
  format: 'csv' | 'json'
  size: number
  modifiedAt: string
}

async function readDataFilePreview(filePath: string): Promise<string> {
  const file = await open(filePath, 'r')

  try {
    const buffer = Buffer.alloc(DATA_FILE_PREVIEW_BYTES)
    const { bytesRead } = await file.read(buffer, 0, buffer.length, 0)

    return buffer.subarray(0, bytesRead).toString('utf8')
  } finally {
    await file.close()
  }
}

function operationKey(senderId: number, sessionId: string): string {
  return `${senderId}:${sessionId}`
}

function isConversionRequest(value: unknown): value is DataFileConversionRequest {
  if (!value || typeof value !== 'object') return false

  const request = value as Partial<DataFileConversionRequest>
  return (
    typeof request.sessionId === 'string' &&
    typeof request.filePath === 'string' &&
    typeof request.targetVersion === 'string'
  )
}

function isDirectoryConversionRequest(value: unknown): value is DataDirectoryConversionRequest {
  if (!value || typeof value !== 'object') return false

  const request = value as Partial<DataDirectoryConversionRequest>
  return (
    typeof request.sessionId === 'string' &&
    typeof request.directoryPath === 'string' &&
    typeof request.targetVersion === 'string' &&
    (request.releasedOn === null || typeof request.releasedOn === 'string')
  )
}

export function registerDataImportHandlers(context: MainIpcContext): string[] {
  const {
    ipcMain,
    selectedDataFilePaths,
    selectedDataDirectoryPaths,
    activeConversions,
    resolveManagedDataRoot
  } = context

  ipcMain.handle(OPEN_DATA_FILE_CHANNEL, async (): Promise<DataFileInfo | null> => {
    const result = await dialog.showOpenDialog({
      title: '게임 데이터 파일 선택',
      properties: ['openFile'],
      filters: [{ name: '게임 데이터', extensions: ['csv', 'json'] }]
    })

    const filePath = result.filePaths[0]
    if (result.canceled || !filePath) return null

    const fileStat = await stat(filePath)
    const extension = extname(filePath).toLowerCase()
    selectedDataFilePaths.clear()
    selectedDataFilePaths.add(filePath)

    return {
      name: basename(filePath),
      path: filePath,
      format: extension === '.csv' ? 'csv' : 'json',
      size: fileStat.size,
      modifiedAt: fileStat.mtime.toISOString()
    }
  })

  ipcMain.handle(OPEN_DATA_DIRECTORY_CHANNEL, async (): Promise<DataDirectoryInfo | null> => {
    const result = await dialog.showOpenDialog({
      title: '버전 데이터 폴더 선택',
      properties: ['openDirectory']
    })

    const directoryPath = result.filePaths[0]
    if (result.canceled || !directoryPath) return null

    const directory = await inspectDataDirectory(directoryPath)
    const { resolveGameDataVersion } = await import('@maple/db/game-data-version')
    const version = resolveGameDataVersion(directory.name)
    selectedDataDirectoryPaths.clear()
    selectedDataDirectoryPaths.add(directoryPath)
    return {
      ...directory,
      detectedVersion: version.version,
      environment: version.environment
    }
  })

  ipcMain.handle(
    CLASSIFY_DATA_FILE_CHANNEL,
    async (_, filePath: string): Promise<DataFileClassification> => {
      if (typeof filePath !== 'string' || !selectedDataFilePaths.has(filePath)) {
        throw new Error('Native dialog에서 선택하지 않은 파일은 분석할 수 없습니다.')
      }

      const extension = extname(filePath).toLowerCase()
      if (extension !== '.csv' && extension !== '.json') {
        throw new Error('CSV 또는 JSON 파일만 분석할 수 있습니다.')
      }

      const preview = await readDataFilePreview(filePath)

      return classifyDataFile({
        fileName: basename(filePath),
        format: extension === '.csv' ? 'csv' : 'json',
        preview
      })
    }
  )

  ipcMain.handle(
    CONVERT_DATA_FILE_CHANNEL,
    async (event, request: unknown): Promise<DataFileConversionResult> => {
      if (!isConversionRequest(request)) {
        throw new Error('파일 변환 요청 형식이 올바르지 않습니다.')
      }

      if (!selectedDataFilePaths.has(request.filePath)) {
        throw new Error('Native dialog에서 선택하지 않은 파일은 변환할 수 없습니다.')
      }

      const key = operationKey(event.sender.id, request.sessionId)
      if (activeConversions.has(key)) {
        throw new Error('이미 실행 중인 파일 변환 세션입니다.')
      }

      const controller = new AbortController()
      activeConversions.set(key, controller)
      const abortWhenRendererCloses = (): void => controller.abort()
      event.sender.once('destroyed', abortWhenRendererCloses)

      try {
        const summary = await convertDataFile({
          sessionId: request.sessionId,
          sourcePath: request.filePath,
          targetVersion: request.targetVersion,
          workspaceRoot: app.getPath('userData'),
          signal: controller.signal,
          onProgress: (progress: DataFileConversionProgress) => {
            if (!event.sender.isDestroyed()) {
              event.sender.send(DATA_FILE_CONVERSION_PROGRESS_CHANNEL, progress)
            }
          }
        })

        return { status: 'success', summary }
      } catch (error) {
        if (error instanceof DataFileConversionError) {
          const cancelled = error.issues.some(({ code }) => code === 'CANCELLED')
          return {
            status: cancelled ? 'cancelled' : 'failed',
            sessionId: request.sessionId,
            issues: error.issues
          }
        }

        throw error
      } finally {
        activeConversions.delete(key)
        event.sender.off('destroyed', abortWhenRendererCloses)
      }
    }
  )

  ipcMain.handle(
    CONVERT_DATA_DIRECTORY_CHANNEL,
    async (event, request: unknown): Promise<DataDirectoryConversionResult> => {
      if (!isDirectoryConversionRequest(request)) {
        throw new Error('폴더 변환 요청 형식이 올바르지 않습니다.')
      }

      if (!selectedDataDirectoryPaths.has(request.directoryPath)) {
        throw new Error('Native dialog에서 선택하지 않은 폴더는 변환할 수 없습니다.')
      }

      const key = operationKey(event.sender.id, request.sessionId)
      if (activeConversions.has(key)) {
        throw new Error('이미 실행 중인 폴더 변환 세션입니다.')
      }

      const controller = new AbortController()
      activeConversions.set(key, controller)
      const abortWhenRendererCloses = (): void => controller.abort()
      event.sender.once('destroyed', abortWhenRendererCloses)
      let prepared: PreparedDataVersionWorkspace | undefined
      let temporarySessionDirectory: string | undefined
      let versionImportStarted = false

      try {
        const { parseGameDataReleaseDate, resolveGameDataVersion } =
          await import('@maple/db/game-data-version')
        const version = resolveGameDataVersion(request.targetVersion)
        if (request.releasedOn) parseGameDataReleaseDate(request.releasedOn)
        const summary = await convertDataDirectory({
          sessionId: request.sessionId,
          directoryPath: request.directoryPath,
          targetVersion: request.targetVersion,
          workspaceRoot: app.getPath('userData'),
          signal: controller.signal,
          onProgress: (progress: DataDirectoryConversionProgress) => {
            if (!event.sender.isDestroyed()) {
              event.sender.send(DATA_DIRECTORY_CONVERSION_PROGRESS_CHANNEL, progress)
            }
          }
        })
        temporarySessionDirectory = dirname(summary.outputPath)
        prepared = await prepareDataVersionWorkspace({
          dataRoot: resolveManagedDataRoot(),
          sessionId: request.sessionId,
          sourceDirectory: request.directoryPath,
          conversion: summary,
          environment: version.environment,
          releasedOn: request.releasedOn
        })

        await registerGameDataVersionImport({
          version: request.targetVersion,
          releasedOn: request.releasedOn
        })
        versionImportStarted = true
        await commitDataVersionWorkspace(prepared)

        return {
          status: 'success',
          summary: {
            ...summary,
            managedData: {
              versionDirectory: prepared.versionDirectory,
              csvDirectory: prepared.csvDirectory,
              jsonDirectory: prepared.jsonDirectory,
              manifestPath: prepared.manifestPath
            },
            versionRegistration: {
              environment: version.environment,
              releasedOn: request.releasedOn,
              status: 'importing'
            }
          }
        }
      } catch (error) {
        if (prepared) await discardDataVersionWorkspace(prepared)
        if (versionImportStarted) {
          await markGameDataVersionImportFailed(request.targetVersion).catch(() => undefined)
        }

        if (error instanceof DataFileConversionError) {
          const cancelled = error.issues.some(({ code }) => code === 'CANCELLED')
          return {
            status: cancelled ? 'cancelled' : 'failed',
            sessionId: request.sessionId,
            issues: error.issues
          }
        }

        return {
          status: 'failed',
          sessionId: request.sessionId,
          issues: [
            {
              severity: 'error',
              code: 'VERSION_IMPORT_FAILED',
              message: error instanceof Error ? error.message : String(error)
            }
          ]
        }
      } finally {
        if (temporarySessionDirectory) {
          await rm(temporarySessionDirectory, { recursive: true, force: true })
        }
        activeConversions.delete(key)
        event.sender.off('destroyed', abortWhenRendererCloses)
      }
    }
  )

  ipcMain.handle(CANCEL_DATA_FILE_CONVERSION_CHANNEL, (event, sessionId: unknown): boolean => {
    if (typeof sessionId !== 'string') return false

    const controller = activeConversions.get(operationKey(event.sender.id, sessionId))
    if (!controller) return false

    controller.abort()
    return true
  })

  return [
    OPEN_DATA_FILE_CHANNEL,
    OPEN_DATA_DIRECTORY_CHANNEL,
    CLASSIFY_DATA_FILE_CHANNEL,
    CONVERT_DATA_FILE_CHANNEL,
    CONVERT_DATA_DIRECTORY_CHANNEL,
    CANCEL_DATA_FILE_CONVERSION_CHANNEL
  ]
}
