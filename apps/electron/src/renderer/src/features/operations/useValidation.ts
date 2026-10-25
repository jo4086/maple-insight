import { useEffect, useRef, useState } from 'react'

import { getErrorMessage } from '../../shared/lib/error-message'
import type {
  DataValidationProgress,
  DataValidationRunResult,
  DataValidationWarningAcknowledgementRequest
} from '../../shared/types/data-validation'

export function useValidation(currentVersion: string, setError: (message: string) => void) {
  const [activeValidationId, setActiveValidationId] = useState<string | null>(null)
  const [activeValidationVersion, setActiveValidationVersion] = useState<string | null>(null)
  const activeValidationIdRef = useRef<string | null>(null)
  const [validationProgress, setValidationProgress] = useState<DataValidationProgress | null>(null)
  const [validationResult, setValidationResult] = useState<DataValidationRunResult | null>(null)
  const currentVersionRef = useRef(currentVersion)

  useEffect(() => {
    currentVersionRef.current = currentVersion
    setValidationProgress(null)
    setValidationResult(null)
  }, [currentVersion])

  useEffect(
    () =>
      window.api.onDataValidationProgress((progress) => {
        if (progress.sessionId === activeValidationIdRef.current) {
          setValidationProgress(progress)
        }
      }),
    []
  )

  const validate = async (): Promise<void> => {
    if (!currentVersion || activeValidationIdRef.current) return

    const sessionId = crypto.randomUUID()
    const validationVersion = currentVersion
    activeValidationIdRef.current = sessionId
    setActiveValidationId(sessionId)
    setActiveValidationVersion(validationVersion)
    setValidationProgress(null)
    setValidationResult(null)
    setError('')

    try {
      const result = await window.api.validateDataVersion({
        sessionId,
        version: validationVersion,
        conflictPolicy: 'reuse'
      })
      if (
        activeValidationIdRef.current === sessionId &&
        currentVersionRef.current === validationVersion
      ) {
        setValidationResult(result)
      }
    } catch (caught) {
      if (currentVersionRef.current === validationVersion) setError(getErrorMessage(caught))
    } finally {
      if (activeValidationIdRef.current === sessionId) {
        activeValidationIdRef.current = null
        setActiveValidationId(null)
        setActiveValidationVersion(null)
      }
    }
  }

  const cancel = async (): Promise<void> => {
    if (!activeValidationId) return
    await window.api.cancelDataValidation(activeValidationId)
  }

  const updateWarning = async (
    request: Omit<DataValidationWarningAcknowledgementRequest, 'version'>
  ): Promise<void> => {
    if (!currentVersion || activeValidationIdRef.current) return

    try {
      setError('')
      const validation = await window.api.updateDataValidationWarning({
        ...request,
        version: currentVersion
      })
      setValidationResult((current) =>
        current?.status === 'success' && current.validation.version === currentVersion
          ? { ...current, validation: { ...current.validation, ...validation } }
          : current
      )
    } catch (caught) {
      setError(getErrorMessage(caught))
    }
  }

  return {
    activeValidationId,
    activeValidationVersion,
    validationProgress,
    validationResult,
    validate,
    cancel,
    updateWarning
  }
}
