import { useCallback, useEffect, useRef, useState } from 'react'

import type { RegisteredDataVersion } from '../../../../shared/data-versions'
import { getErrorMessage } from '../../shared/lib/error-message'

export const CURRENT_VERSION_STORAGE_KEY = 'maple-insight-current-version'

type VersionSelection = {
  versions: string[]
  currentVersion: string
  compareVersion: string
}

export type VersionContextValue = {
  versions: string[]
  registeredVersions: RegisteredDataVersion[]
  currentVersion: string
  compareVersion: string
  versionStatus: 'loading' | 'ready' | 'error'
  changeCurrentVersion: (version: string) => void
  changeCompareVersion: (version: string) => void
  refreshVersions: (preferredCurrentVersion?: string, propagateError?: boolean) => Promise<void>
}

export function resolveVersionSelection(
  availableVersions: string[],
  previous: VersionSelection,
  preferredCurrentVersion?: string,
  storedCurrentVersion?: string
): VersionSelection {
  if (availableVersions.length === 0) {
    return { versions: [], currentVersion: '', compareVersion: '' }
  }

  const currentVersion =
    preferredCurrentVersion && availableVersions.includes(preferredCurrentVersion)
      ? preferredCurrentVersion
      : availableVersions.includes(previous.currentVersion)
        ? previous.currentVersion
        : storedCurrentVersion && availableVersions.includes(storedCurrentVersion)
          ? storedCurrentVersion
          : availableVersions[0]
  const compareVersion =
    availableVersions.includes(previous.compareVersion) &&
    previous.compareVersion !== currentVersion
      ? previous.compareVersion
      : ''

  return { versions: availableVersions, currentVersion, compareVersion }
}

function readStoredCurrentVersion(): string | undefined {
  try {
    return localStorage.getItem(CURRENT_VERSION_STORAGE_KEY) ?? undefined
  } catch {
    return undefined
  }
}

function persistCurrentVersion(version: string): void {
  try {
    localStorage.setItem(CURRENT_VERSION_STORAGE_KEY, version)
  } catch {
    return
  }
}

export function useVersionSelection(onError: (message: string) => void): VersionContextValue {
  const initialSelection: VersionSelection = {
    versions: [],
    currentVersion: '',
    compareVersion: ''
  }
  const [selection, setSelection] = useState<VersionSelection>(initialSelection)
  const [registeredVersions, setRegisteredVersions] = useState<RegisteredDataVersion[]>([])
  const [versionStatus, setVersionStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const selectionRef = useRef(initialSelection)
  const storedCurrentVersion = useRef(readStoredCurrentVersion())
  const selectionChangeCount = useRef(0)
  const refreshCount = useRef(0)

  const updateSelection = useCallback((nextSelection: VersionSelection): void => {
    selectionRef.current = nextSelection
    setSelection(nextSelection)
  }, [])

  const refreshVersions = useCallback(
    async (preferredCurrentVersion?: string, propagateError = false): Promise<void> => {
      const refreshId = ++refreshCount.current
      const selectionChangeCountAtStart = selectionChangeCount.current
      setVersionStatus('loading')
      try {
        const registered = await window.api.listRegisteredDataVersions()
        if (refreshId !== refreshCount.current) return

        const availableVersions = registered.map(({ version }) => version)
        setRegisteredVersions(registered)

        if (availableVersions.length === 0) {
          updateSelection({ versions: [], currentVersion: '', compareVersion: '' })
          setVersionStatus('ready')
          onError('DB에 선택 가능한 데이터 버전이 없습니다.')
          return
        }

        const canRestoreSelection = selectionChangeCountAtStart === selectionChangeCount.current
        const nextSelection = resolveVersionSelection(
          availableVersions,
          selectionRef.current,
          canRestoreSelection ? preferredCurrentVersion : undefined,
          canRestoreSelection ? storedCurrentVersion.current : undefined
        )
        updateSelection(nextSelection)
        storedCurrentVersion.current = nextSelection.currentVersion
        persistCurrentVersion(nextSelection.currentVersion)
        setVersionStatus('ready')
      } catch (caught) {
        if (refreshId !== refreshCount.current) return
        setVersionStatus('error')
        onError(getErrorMessage(caught))
        if (propagateError) throw caught
      }
    },
    [onError, updateSelection]
  )

  useEffect(() => {
    void refreshVersions()
  }, [refreshVersions])

  const changeCurrentVersion = (version: string): void => {
    if (!selectionRef.current.versions.includes(version)) return

    selectionChangeCount.current += 1
    storedCurrentVersion.current = version
    persistCurrentVersion(version)
    const previous = selectionRef.current
    updateSelection({
      ...previous,
      currentVersion: version,
      compareVersion: version === previous.compareVersion ? '' : previous.compareVersion
    })
  }

  return {
    ...selection,
    registeredVersions,
    versionStatus,
    changeCurrentVersion,
    changeCompareVersion: (compareVersion) => {
      const previous = selectionRef.current
      if (
        compareVersion !== '' &&
        (!previous.versions.includes(compareVersion) || compareVersion === previous.currentVersion)
      ) {
        return
      }

      updateSelection({ ...previous, compareVersion })
    },
    refreshVersions
  }
}
