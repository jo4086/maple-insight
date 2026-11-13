import { join } from 'node:path'

import { is } from '@electron-toolkit/utils'
import { shell, BrowserWindow } from 'electron'

import icon from '../../../resources/icon.png?asset'
import type { ScreenshotCaptureEvent, ScreenshotCaptureResult } from '../../shared/screenshot'

export interface MainWindowOptions {
  captureScreenshot(window: BrowserWindow): Promise<ScreenshotCaptureResult>
  screenshotCapturedChannel: string
}

export function createMainWindow(options: MainWindowOptions): BrowserWindow {
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
    void shell.openExternal(details.url)
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
    void options
      .captureScreenshot(mainWindow)
      .then((result) => {
        const payload: ScreenshotCaptureEvent = { status: 'success', result }
        mainWindow.webContents.send(options.screenshotCapturedChannel, payload)
      })
      .catch((error: unknown) => {
        const payload: ScreenshotCaptureEvent = {
          status: 'failed',
          message: error instanceof Error ? error.message : String(error)
        }
        mainWindow.webContents.send(options.screenshotCapturedChannel, payload)
      })
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    void mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

export function focusMainWindow(): void {
  const window = BrowserWindow.getAllWindows()[0]
  if (!window) return
  if (window.isMinimized()) window.restore()
  window.focus()
}

export function hasMainWindow(): boolean {
  return BrowserWindow.getAllWindows().length > 0
}
