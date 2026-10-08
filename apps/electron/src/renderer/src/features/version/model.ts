import { useCallback, useEffect, useState } from 'react'

import { getErrorMessage } from '../../shared/lib/error-message'

type VersionSelection = {
  versions: string[]
  currentVersion: string
  compareVersion: string
}

export type VersionContextValue = {
  versions: string[]
  currentVersion: string
  compareVersion: string
  versionStatus: 'loading' | 'ready' | 'error'
  changeCurrentVersion: (version: string) => void
  changeCompareVersion: (version: string) => void
  refreshVersions: (preferredCurrentVersion?: string) => Promise<void>
}

export function resolveVersionSelection(
  availableVersions: string[],
  previous: VersionSelection,
  preferredCurrentVersion?: string
): VersionSelection {
  if (availableVersions.length === 0) {
    return { versions: [], currentVersion: '', compareVersion: '' }
  }

  const currentVersion =
    preferredCurrentVersion && availableVersions.includes(preferredCurrentVersion)
      ? preferredCurrentVersion
      : availableVersions.includes(previous.currentVersion)
        ? previous.currentVersion
        : availableVersions[0]
  const compareVersion =
    availableVersions.includes(previous.compareVersion) &&
    previous.compareVersion !== currentVersion
      ? previous.compareVersion
      : (availableVersions.find((version) => version !== currentVersion) ?? currentVersion)

  return { versions: availableVersions, currentVersion, compareVersion }
}

export function useVersionSelection(onError: (message: string) => void): VersionContextValue {
  const [selection, setSelection] = useState<VersionSelection>({
    versions: [],
    currentVersion: '',
    compareVersion: ''
  })
  const [versionStatus, setVersionStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const refreshVersions = useCallback(
    async (preferredCurrentVersion?: string): Promise<void> => {
      setVersionStatus('loading')
      try {
        const availableVersions = await window.api.listDataVersions()

        if (availableVersions.length === 0) {
          setSelection({ versions: [], currentVersion: '', compareVersion: '' })
          setVersionStatus('ready')
          onError('DB에 선택 가능한 데이터 버전이 없습니다.')
          return
        }

        setSelection((previous) =>
          resolveVersionSelection(availableVersions, previous, preferredCurrentVersion)
        )
        setVersionStatus('ready')
      } catch (caught) {
        setVersionStatus('error')
        onError(getErrorMessage(caught))
      }
    },
    [onError]
  )

  useEffect(() => {
    void refreshVersions()
  }, [refreshVersions])

  const changeCurrentVersion = (version: string): void => {
    setSelection((previous) => ({
      ...previous,
      currentVersion: version,
      compareVersion:
        version === previous.compareVersion
          ? (previous.versions.find((candidate) => candidate !== version) ?? version)
          : previous.compareVersion
    }))
  }

  return {
    ...selection,
    versionStatus,
    changeCurrentVersion,
    changeCompareVersion: (compareVersion) =>
      setSelection((previous) => ({ ...previous, compareVersion })),
    refreshVersions
  }
}
