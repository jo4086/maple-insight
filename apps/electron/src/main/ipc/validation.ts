import type {
  DataValidationProgress,
  DataValidationReportUpdate,
  DataValidationRequest,
  DataValidationRunResult,
  DataValidationWarningAcknowledgementRequest
} from '../../shared/data-validation'
import {
  updateValidationWarningAcknowledgement,
  validateDataVersion
} from '../services/validation/data-validation-runner'

import type { MainIpcContext } from './register'

const VALIDATE_DATA_VERSION_CHANNEL = 'data-validation:run'
const CANCEL_DATA_VALIDATION_CHANNEL = 'data-validation:cancel'
const UPDATE_DATA_VALIDATION_WARNING_CHANNEL = 'data-validation:warning:update'
const DATA_VALIDATION_PROGRESS_CHANNEL = 'data-validation:progress'

function operationKey(senderId: number, sessionId: string): string {
  return `${senderId}:${sessionId}`
}

function isDataValidationRequest(value: unknown): value is DataValidationRequest {
  if (!value || typeof value !== 'object') return false

  const request = value as Partial<DataValidationRequest>
  return (
    typeof request.sessionId === 'string' &&
    typeof request.version === 'string' &&
    (request.conflictPolicy === undefined ||
      request.conflictPolicy === 'error' ||
      request.conflictPolicy === 'reuse' ||
      request.conflictPolicy === 'replace')
  )
}

function hasUnsafeReasonCharacter(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0)
    return (
      (code >= 0 && code <= 8) ||
      (code >= 11 && code <= 12) ||
      (code >= 14 && code <= 31) ||
      code === 127
    )
  })
}

function isWarningAcknowledgementRequest(
  value: unknown
): value is DataValidationWarningAcknowledgementRequest {
  if (!value || typeof value !== 'object') return false

  const request = value as Partial<DataValidationWarningAcknowledgementRequest>
  if (
    typeof request.version !== 'string' ||
    !/^\d+\.\d+\.\d+$/.test(request.version) ||
    typeof request.issueId !== 'string' ||
    request.issueId.length === 0 ||
    typeof request.acknowledged !== 'boolean'
  ) {
    return false
  }
  if (request.exceptionReason === undefined) return true
  return (
    request.acknowledged &&
    typeof request.exceptionReason === 'string' &&
    request.exceptionReason.trim().length > 0 &&
    request.exceptionReason.length <= 1000 &&
    !hasUnsafeReasonCharacter(request.exceptionReason)
  )
}

export function registerValidationHandlers(context: MainIpcContext): string[] {
  const {
    ipcMain,
    activeValidations,
    activeValidationVersions,
    activeVersionCopies,
    resolveManagedDataRoot,
    resolveValidationEnvironment
  } = context

  ipcMain.handle(
    VALIDATE_DATA_VERSION_CHANNEL,
    async (event, request: unknown): Promise<DataValidationRunResult> => {
      if (!isDataValidationRequest(request)) {
        throw new Error('데이터 검증 요청 형식이 올바르지 않습니다.')
      }

      const key = operationKey(event.sender.id, request.sessionId)
      if (
        activeValidations.has(key) ||
        activeValidationVersions.has(request.version) ||
        activeVersionCopies.has(request.version)
      ) {
        throw new Error('이미 실행 중인 데이터 검증 버전입니다.')
      }

      const controller = new AbortController()
      activeValidations.set(key, controller)
      activeValidationVersions.add(request.version)
      const abortWhenRendererCloses = (): void => controller.abort()
      event.sender.once('destroyed', abortWhenRendererCloses)

      try {
        const environment = await resolveValidationEnvironment(request.version)
        const validation = await validateDataVersion({
          dataRoot: resolveManagedDataRoot(),
          sessionId: request.sessionId,
          version: request.version,
          environment,
          conflictPolicy: request.conflictPolicy,
          signal: controller.signal,
          onProgress: (progress: DataValidationProgress) => {
            if (!event.sender.isDestroyed()) {
              event.sender.send(DATA_VALIDATION_PROGRESS_CHANNEL, progress)
            }
          }
        })

        return { status: 'success', validation }
      } catch (error) {
        const cancelled =
          controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')
        return {
          status: cancelled ? 'cancelled' : 'failed',
          sessionId: request.sessionId,
          message: cancelled
            ? '데이터 검증이 취소되었습니다.'
            : error instanceof Error
              ? error.message
              : String(error)
        }
      } finally {
        activeValidations.delete(key)
        activeValidationVersions.delete(request.version)
        event.sender.off('destroyed', abortWhenRendererCloses)
      }
    }
  )

  ipcMain.handle(
    UPDATE_DATA_VALIDATION_WARNING_CHANNEL,
    async (_, request: unknown): Promise<DataValidationReportUpdate> => {
      if (!isWarningAcknowledgementRequest(request)) {
        throw new Error('경고 확인 요청 형식이 올바르지 않습니다.')
      }
      if (
        activeValidationVersions.has(request.version) ||
        activeVersionCopies.has(request.version)
      ) {
        throw new Error('현재 버전 검증이 끝난 뒤 경고를 확인하세요.')
      }

      activeValidationVersions.add(request.version)
      try {
        const environment = await resolveValidationEnvironment(request.version)
        return await updateValidationWarningAcknowledgement({
          dataRoot: resolveManagedDataRoot(),
          version: request.version,
          environment,
          issueId: request.issueId,
          acknowledged: request.acknowledged,
          ...(request.exceptionReason ? { exceptionReason: request.exceptionReason.trim() } : {})
        })
      } finally {
        activeValidationVersions.delete(request.version)
      }
    }
  )

  ipcMain.handle(CANCEL_DATA_VALIDATION_CHANNEL, (event, sessionId: unknown): boolean => {
    if (typeof sessionId !== 'string') return false

    const controller = activeValidations.get(operationKey(event.sender.id, sessionId))
    if (!controller) return false

    controller.abort()
    return true
  })

  return [
    VALIDATE_DATA_VERSION_CHANNEL,
    UPDATE_DATA_VALIDATION_WARNING_CHANNEL,
    CANCEL_DATA_VALIDATION_CHANNEL
  ]
}
