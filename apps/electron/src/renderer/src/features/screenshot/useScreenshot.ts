import { useCallback, useEffect, useState } from 'react'

import { getErrorMessage } from '../../shared/lib/error-message'
import type { PushNotification } from '../notifications/useNotifications'

export function useScreenshot(
  pushNotification: (notification: PushNotification) => void,
  closeNotifications: () => void
) {
  const [isCapturing, setIsCapturing] = useState(false)

  const addSuccess = useCallback(
    (path: string, capturedAt: string): void => {
      pushNotification({
        kind: 'success',
        title: '스크린샷 저장 완료',
        message: path,
        createdAt: capturedAt
      })
    },
    [pushNotification]
  )

  const addFailure = useCallback(
    (message: string): void => {
      pushNotification({
        kind: 'error',
        title: '스크린샷 저장 실패',
        message: `${message} 저장 위치와 쓰기 권한을 확인한 뒤 다시 시도하세요.`
      })
    },
    [pushNotification]
  )

  useEffect(
    () =>
      window.api.onScreenshotCaptured((event) => {
        if (event.status === 'success') {
          addSuccess(event.result.path, event.result.capturedAt)
          return
        }
        addFailure(event.message)
      }),
    [addFailure, addSuccess]
  )

  useEffect(() => {
    const closeForScreenshotShortcut = (event: KeyboardEvent): void => {
      if (event.shiftKey && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        closeNotifications()
      }
    }

    document.addEventListener('keydown', closeForScreenshotShortcut, true)
    return () => document.removeEventListener('keydown', closeForScreenshotShortcut, true)
  }, [closeNotifications])

  const capture = async (): Promise<void> => {
    setIsCapturing(true)

    try {
      closeNotifications()
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      const result = await window.api.captureScreenshot()
      addSuccess(result.path, result.capturedAt)
    } catch (caught) {
      addFailure(getErrorMessage(caught))
    } finally {
      setIsCapturing(false)
    }
  }

  return { isCapturing, capture }
}
