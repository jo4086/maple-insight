import type { IpcMain } from 'electron'

import type { MainProcessRuntime } from '../app/runtime'

import { registerDataImportHandlers } from './data-import'
import { registerDataVersionHandlers } from './data-versions'
import { registerJobDataHandlers } from './job-data'
import { registerRawDataDiffHandlers } from './raw-data-diff'
import { registerScreenshotHandlers } from './screenshot'
import { registerSkillDataHandlers } from './skill-data'
import { registerValidationHandlers } from './validation'

export interface MainIpcContext extends MainProcessRuntime {
  ipcMain: IpcMain
}

export function registerIpcHandlers(context: MainIpcContext): () => void {
  const channels = [
    ...registerJobDataHandlers(context),
    ...registerSkillDataHandlers(context),
    ...registerRawDataDiffHandlers(context),
    ...registerDataVersionHandlers(context),
    ...registerValidationHandlers(context),
    ...registerDataImportHandlers(context),
    ...registerScreenshotHandlers(context)
  ]

  return () => {
    for (const channel of channels) context.ipcMain.removeHandler(channel)
  }
}
