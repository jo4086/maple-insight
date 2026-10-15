import { contextBridge, ipcRenderer } from 'electron'

import type {
  DataDirectoryConversionProgress,
  DataDirectoryConversionRequest,
  DataFileConversionProgress,
  DataFileConversionRequest
} from '../shared/data-import'
import type {
  DataValidationProgress,
  DataValidationRequest,
  DataValidationRunResult,
  DataValidationReportUpdate,
  DataValidationWarningAcknowledgementRequest
} from '../shared/data-validation'
import type { ScreenshotCaptureEvent, ScreenshotCaptureResult } from '../shared/screenshot'

const api = {
  openDataFile: () => ipcRenderer.invoke('data-file:open'),
  openDataDirectory: () => ipcRenderer.invoke('data-directory:open'),
  classifyDataFile: (filePath: string) => ipcRenderer.invoke('data-file:classify', filePath),
  convertDataFile: (request: DataFileConversionRequest) =>
    ipcRenderer.invoke('data-file:convert', request),
  cancelDataFileConversion: (sessionId: string) =>
    ipcRenderer.invoke('data-file:convert:cancel', sessionId),
  onDataFileConversionProgress: (
    listener: (progress: DataFileConversionProgress) => void
  ): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      progress: DataFileConversionProgress
    ): void => listener(progress)

    ipcRenderer.on('data-file:convert:progress', handler)
    return () => ipcRenderer.removeListener('data-file:convert:progress', handler)
  },
  convertDataDirectory: (request: DataDirectoryConversionRequest) =>
    ipcRenderer.invoke('data-directory:convert', request),
  onDataDirectoryConversionProgress: (
    listener: (progress: DataDirectoryConversionProgress) => void
  ): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      progress: DataDirectoryConversionProgress
    ): void => listener(progress)

    ipcRenderer.on('data-directory:convert:progress', handler)
    return () => ipcRenderer.removeListener('data-directory:convert:progress', handler)
  },
  listDataVersions: () => ipcRenderer.invoke('data-version:list'),
  validateDataVersion: (request: DataValidationRequest): Promise<DataValidationRunResult> =>
    ipcRenderer.invoke('data-validation:run', request),
  cancelDataValidation: (sessionId: string): Promise<boolean> =>
    ipcRenderer.invoke('data-validation:cancel', sessionId),
  updateDataValidationWarning: (
    request: DataValidationWarningAcknowledgementRequest
  ): Promise<DataValidationReportUpdate> => ipcRenderer.invoke('data-validation:warning:update', request),
  onDataValidationProgress: (
    listener: (progress: DataValidationProgress) => void
  ): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, progress: DataValidationProgress): void =>
      listener(progress)

    ipcRenderer.on('data-validation:progress', handler)
    return () => ipcRenderer.removeListener('data-validation:progress', handler)
  },
  captureScreenshot: (): Promise<ScreenshotCaptureResult> =>
    ipcRenderer.invoke('screenshot:capture'),
  onScreenshotCaptured: (listener: (event: ScreenshotCaptureEvent) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, result: ScreenshotCaptureEvent): void =>
      listener(result)

    ipcRenderer.on('screenshot:captured', handler)
    return () => ipcRenderer.removeListener('screenshot:captured', handler)
  }
}

contextBridge.exposeInMainWorld('api', api)
