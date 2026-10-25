import { useEffect, useRef, useState } from 'react'

import { getErrorMessage } from '../../shared/lib/error-message'
import type {
  DataDirectoryConversionProgress,
  DataDirectoryConversionResult,
  DataDirectoryInfo
} from '../../shared/types/data-file'

import { formatLocalDate } from './release-date'

export function useDataImport(
  currentVersion: string,
  refreshVersions: (preferredCurrentVersion?: string) => Promise<void>,
  setError: (message: string) => void
) {
  const [directory, setDirectory] = useState<DataDirectoryInfo | null>(null)
  const [releasedOn, setReleasedOn] = useState('')
  const [activeConversionId, setActiveConversionId] = useState<string | null>(null)
  const activeConversionIdRef = useRef<string | null>(null)
  const [conversionProgress, setConversionProgress] =
    useState<DataDirectoryConversionProgress | null>(null)
  const [conversionResult, setConversionResult] = useState<DataDirectoryConversionResult | null>(
    null
  )
  const targetVersion =
    directory && /^\d+\.\d+\.\d+$/.test(directory.name) ? directory.name : currentVersion

  useEffect(
    () =>
      window.api.onDataDirectoryConversionProgress((progress) => {
        if (progress.sessionId === activeConversionIdRef.current) {
          setConversionProgress(progress)
        }
      }),
    []
  )

  const open = async (): Promise<void> => {
    try {
      setError('')
      const selected = await window.api.openDataDirectory()
      if (selected) {
        setDirectory(selected)
        setConversionProgress(null)
        setConversionResult(null)
        setReleasedOn(formatLocalDate(new Date()))
      }
    } catch (caught) {
      setError(getErrorMessage(caught))
    }
  }

  const convert = async (): Promise<void> => {
    if (!directory || !targetVersion || activeConversionIdRef.current) return

    const sessionId = crypto.randomUUID()
    activeConversionIdRef.current = sessionId
    setActiveConversionId(sessionId)
    setConversionProgress(null)
    setConversionResult(null)
    setError('')

    try {
      const result = await window.api.convertDataDirectory({
        sessionId,
        directoryPath: directory.path,
        targetVersion,
        releasedOn: releasedOn || null
      })

      if (activeConversionIdRef.current === sessionId) {
        setConversionResult(result)

        if (result.status === 'success') {
          await refreshVersions(result.summary.targetVersion)
        }
      }
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      if (activeConversionIdRef.current === sessionId) {
        activeConversionIdRef.current = null
        setActiveConversionId(null)
      }
    }
  }

  const cancel = async (): Promise<void> => {
    if (!activeConversionId) return
    await window.api.cancelDataFileConversion(activeConversionId)
  }

  return {
    directory,
    releasedOn,
    setReleasedOn,
    activeConversionId,
    conversionProgress,
    conversionResult,
    targetVersion,
    open,
    convert,
    cancel
  }
}
