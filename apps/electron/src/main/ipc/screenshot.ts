import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { is } from '@electron-toolkit/utils'
import { app, BrowserWindow } from 'electron'

import type { ScreenshotCaptureResult } from '../../shared/screenshot'

import type { MainIpcContext } from './register'

const CAPTURE_SCREENSHOT_CHANNEL = 'screenshot:capture'
export const SCREENSHOT_CAPTURED_CHANNEL = 'screenshot:captured'

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

export async function captureWindowScreenshot(
  window: BrowserWindow
): Promise<ScreenshotCaptureResult> {
  const capturedAt = new Date().toISOString()
  const directory = resolveManualScreenshotDirectory()
  const outputPath = join(directory, createScreenshotFileName(capturedAt))
  const image = await captureFullPage(window)

  await mkdir(directory, { recursive: true })
  await writeFile(outputPath, image)

  return { path: outputPath, capturedAt }
}

export function registerScreenshotHandlers(context: MainIpcContext): string[] {
  context.ipcMain.handle(
    CAPTURE_SCREENSHOT_CHANNEL,
    async (event): Promise<ScreenshotCaptureResult> => {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) throw new Error('스크린샷을 촬영할 창을 찾을 수 없습니다.')
      return captureWindowScreenshot(window)
    }
  )

  return [CAPTURE_SCREENSHOT_CHANNEL]
}
