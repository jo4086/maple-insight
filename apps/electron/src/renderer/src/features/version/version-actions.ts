import type { VersionContextValue } from './model'

export function createVersionActions(refreshVersions: VersionContextValue['refreshVersions']) {
  const updateReleasedOn = async (
    versionNumber: string,
    nextReleasedOn: string | null
  ): Promise<void> => {
    await window.api.updateDataVersionReleaseDate({
      version: versionNumber,
      releasedOn: nextReleasedOn
    })
    await refreshVersions(undefined, true)
  }

  const copy = async (sourceVersion: string, targetVersion: string): Promise<void> => {
    await window.api.copyDataVersion({ sourceVersion, targetVersion })
    await refreshVersions(undefined, true)
  }

  const remove = async (versionNumber: string): Promise<void> => {
    await window.api.deleteDataVersion({
      version: versionNumber,
      confirmationVersion: versionNumber
    })
    await refreshVersions(undefined, true)
  }

  return { updateReleasedOn, copy, remove }
}
