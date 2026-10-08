import { mkdir, open, rm, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, join, resolve } from 'node:path'

import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { config } from 'dotenv'
import { app, shell, BrowserWindow, dialog, ipcMain } from 'electron'

import icon from '../../resources/icon.png?asset'
import type {
  DataDirectoryConversionProgress,
  DataDirectoryConversionRequest,
  DataDirectoryConversionResult,
  DataDirectoryInfo,
  DataFileConversionProgress,
  DataFileConversionRequest,
  DataFileConversionResult
} from '../shared/data-import'
import type { ScreenshotCaptureEvent, ScreenshotCaptureResult } from '../shared/screenshot'

import { convertDataFile, DataFileConversionError } from './services/data-conversion'
import { convertDataDirectory, inspectDataDirectory } from './services/data-directory-conversion'
import {
  commitDataVersionWorkspace,
  discardDataVersionWorkspace,
  prepareDataVersionWorkspace,
  type PreparedDataVersionWorkspace
} from './services/data-version-workspace'
import {
  markGameDataVersionImportFailed,
  registerGameDataVersionImport
} from './services/game-data-version-registration'
import { isSelectableGameDataVersionStatus } from './services/selectable-game-data-version'
import { classifyDataFile, type DataFileClassification } from './services/typesafe'

const OPEN_DATA_FILE_CHANNEL = 'data-file:open'
const OPEN_DATA_DIRECTORY_CHANNEL = 'data-directory:open'
const CLASSIFY_DATA_FILE_CHANNEL = 'data-file:classify'
const CONVERT_DATA_FILE_CHANNEL = 'data-file:convert'
const CANCEL_DATA_FILE_CONVERSION_CHANNEL = 'data-file:convert:cancel'
const DATA_FILE_CONVERSION_PROGRESS_CHANNEL = 'data-file:convert:progress'
const CONVERT_DATA_DIRECTORY_CHANNEL = 'data-directory:convert'
const DATA_DIRECTORY_CONVERSION_PROGRESS_CHANNEL = 'data-directory:convert:progress'
const LIST_DATA_VERSIONS_CHANNEL = 'data-version:list'
const CAPTURE_SCREENSHOT_CHANNEL = 'screenshot:capture'
const SCREENSHOT_CAPTURED_CHANNEL = 'screenshot:captured'
const DATA_FILE_PREVIEW_BYTES = 16 * 1024

const selectedDataFilePaths = new Set<string>()
const selectedDataDirectoryPaths = new Set<string>()
const activeConversions = new Map<string, AbortController>()

type DataFileInfo = {
  name: string
  path: string
  format: 'csv' | 'json'
  size: number
  modifiedAt: string
}

function loadDatabaseEnvironment(): void {
  if (process.env.DATABASE_URL) return

  if (is.dev) {
    config({ path: resolve(app.getAppPath(), '../..', 'packages/database/db/.env') })
    return
  }

  config()
}

function resolveManagedDataRoot(): string {
  if (process.env.MAPLE_DATA_ROOT) return resolve(process.env.MAPLE_DATA_ROOT)
  if (is.dev) return resolve(app.getAppPath(), '../..', 'data')
  return join(app.getPath('userData'), 'data')
}

function resolveManualScreenshotDirectory(): string {
  if (process.env.MAPLE_SCREENSHOT_ROOT) {
    return join(resolve(process.env.MAPLE_SCREENSHOT_ROOT), 'manual', 'electron')
  }

  if (is.dev) return resolve(app.getAppPath(), '../..', 'screenshots/manual/electron')
  return join(app.getPath('userData'), 'screenshots', 'manual', 'electron')
}

function createScreenshotFileName(capturedAt: string): string {
  return `electron-${capturedAt.replaceAll(':', '-').replaceAll('.', '-')}.png`
}

type PageLayoutMetrics = {
  cssContentSize: {
    width: number
    height: number
  }
}

type PageScreenshot = {
  data: string
}

async function captureFullPage(window: BrowserWindow): Promise<Buffer> {
  const { debugger: pageDebugger } = window.webContents
  const shouldDetach = !pageDebugger.isAttached()

  try {
    if (shouldDetach) pageDebugger.attach('1.3')

    const metrics = (await pageDebugger.sendCommand('Page.getLayoutMetrics')) as PageLayoutMetrics
    const width = Math.ceil(metrics.cssContentSize.width)
    const height = Math.ceil(metrics.cssContentSize.height)
    const screenshot = (await pageDebugger.sendCommand('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height, scale: 1 }
    })) as PageScreenshot

    return Buffer.from(screenshot.data, 'base64')
  } catch {
    const image = await window.webContents.capturePage()
    return image.toPNG()
  } finally {
    if (shouldDetach && pageDebugger.isAttached()) pageDebugger.detach()
  }
}

async function captureWindowScreenshot(window: BrowserWindow): Promise<ScreenshotCaptureResult> {
  const capturedAt = new Date().toISOString()
  const directory = resolveManualScreenshotDirectory()
  const outputPath = join(directory, createScreenshotFileName(capturedAt))
  const image = await captureFullPage(window)

  await mkdir(directory, { recursive: true })
  await writeFile(outputPath, image)

  return { path: outputPath, capturedAt }
}

async function listDataVersions(): Promise<string[]> {
  try {
    const { findGameDataVersions } = await import('@maple/db/admin/game-data-version')
    const versions = await findGameDataVersions()
    return versions
      .filter(({ status }) => isSelectableGameDataVersionStatus(status))
      .map(({ version }) => version)
  } catch {
    throw new Error('DB 버전 목록을 불러오지 못했습니다. DB 실행 상태와 DATABASE_URL을 확인하세요.')
  }
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

function conversionKey(senderId: number, sessionId: string): string {
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

loadDatabaseEnvironment()

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1480,
    height: 920,
    minWidth: 1080,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('before-input-event', (event, input) => {
    const isScreenshotShortcut =
      input.type === 'keyDown' &&
      input.shift &&
      (input.control || input.meta) &&
      input.key.toLowerCase() === 's'

    if (!isScreenshotShortcut || input.isAutoRepeat) return

    event.preventDefault()
    void captureWindowScreenshot(mainWindow)
      .then((result) => {
        const payload: ScreenshotCaptureEvent = { status: 'success', result }
        mainWindow.webContents.send(SCREENSHOT_CAPTURED_CHANNEL, payload)
      })
      .catch((error: unknown) => {
        const payload: ScreenshotCaptureEvent = {
          status: 'failed',
          message: error instanceof Error ? error.message : String(error)
        }
        mainWindow.webContents.send(SCREENSHOT_CAPTURED_CHANNEL, payload)
      })
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.maple-insight.data-studio')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

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

  ipcMain.handle(CAPTURE_SCREENSHOT_CHANNEL, async (event): Promise<ScreenshotCaptureResult> => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) throw new Error('스크린샷을 촬영할 창을 찾을 수 없습니다.')
    return captureWindowScreenshot(window)
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

      const key = conversionKey(event.sender.id, request.sessionId)
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

      const key = conversionKey(event.sender.id, request.sessionId)
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
        const { parseGameDataReleaseDate, resolveGameDataVersion } = await import(
          '@maple/db/game-data-version'
        )
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

    const controller = activeConversions.get(conversionKey(event.sender.id, sessionId))
    if (!controller) return false

    controller.abort()
    return true
  })

  ipcMain.handle(LIST_DATA_VERSIONS_CHANNEL, listDataVersions)

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
