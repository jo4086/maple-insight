import { useEffect, useState } from 'react'

import { getErrorMessage } from '../../shared/lib/error-message'

export function useScreenshot(setError: (message: string) => void) {
  const [message, setMessage] = useState('')
  const [isCapturing, setIsCapturing] = useState(false)

  useEffect(
    () =>
      window.api.onScreenshotCaptured((event) => {
        if (event.status === 'success') {
          setMessage(`스크린샷 저장: ${event.result.path}`)
          return
        }

        setError(event.message)
      }),
    [setError]
  )

  const capture = async (): Promise<void> => {
    setIsCapturing(true)
    setMessage('')

    try {
      const result = await window.api.captureScreenshot()
      setMessage(`스크린샷 저장: ${result.path}`)
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      setIsCapturing(false)
    }
  }

  return { message, setMessage, isCapturing, capture }
}
