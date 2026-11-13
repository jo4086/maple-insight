import { resolve } from 'node:path'

import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { config } from 'dotenv'
import { app, ipcMain } from 'electron'

import { createMainWindow, focusMainWindow, hasMainWindow } from './app/main-window'
import { createRuntime } from './app/runtime'

function loadDatabaseEnvironment(): void {
  if (process.env.DATABASE_URL) return

  if (is.dev) {
    config({ path: resolve(app.getAppPath(), '../..', 'packages/database/db/.env') })
    return
  }

  config()
}

loadDatabaseEnvironment()

const hasSingleInstanceLock = app.requestSingleInstanceLock()
if (!hasSingleInstanceLock) {
  app.quit()
} else {
  const runtime = createRuntime()

  app.on('second-instance', focusMainWindow)

  void app.whenReady().then(async () => {
    electronApp.setAppUserModelId('com.maple-insight.data-studio')

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    const [{ registerIpcHandlers }, { captureWindowScreenshot, SCREENSHOT_CAPTURED_CHANNEL }] =
      await Promise.all([import('./ipc/register'), import('./ipc/screenshot')])

    registerIpcHandlers({ ipcMain, ...runtime })

    const createWindow = (): void => {
      createMainWindow({
        captureScreenshot: captureWindowScreenshot,
        screenshotCapturedChannel: SCREENSHOT_CAPTURED_CHANNEL
      })
    }

    createWindow()

    app.on('activate', () => {
      if (!hasMainWindow()) createWindow()
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
