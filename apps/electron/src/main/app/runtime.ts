import { join, resolve } from 'node:path'

import { is } from '@electron-toolkit/utils'
import { app } from 'electron'

import { isSelectableGameDataVersionStatus } from '../services/versions/selectable-game-data-version'

export interface VisibleDataVersion {
  version: string
  environment: string
  status: string
}

export interface MainProcessRuntime {
  selectedDataFilePaths: Set<string>
  selectedDataDirectoryPaths: Set<string>
  activeConversions: Map<string, AbortController>
  activeValidations: Map<string, AbortController>
  activeValidationVersions: Set<string>
  activeVersionCopies: Set<string>
  serializeVersionMutation<T>(operation: () => Promise<T>): Promise<T>
  resolveManagedDataRoot(): string
  findVisibleVersion(version: string): Promise<VisibleDataVersion>
  resolveVisibleVersion(version: string): Promise<{ version: string; environment: string }>
  resolveValidationEnvironment(version: string): Promise<'test' | 'production' | 'copy'>
}

export function createRuntime(): MainProcessRuntime {
  const selectedDataFilePaths = new Set<string>()
  const selectedDataDirectoryPaths = new Set<string>()
  const activeConversions = new Map<string, AbortController>()
  const activeValidations = new Map<string, AbortController>()
  const activeValidationVersions = new Set<string>()
  const activeVersionCopies = new Set<string>()
  let versionMutation = Promise.resolve()

  async function serializeVersionMutation<T>(operation: () => Promise<T>): Promise<T> {
    const result = versionMutation.then(operation)
    versionMutation = result.then(
      () => undefined,
      () => undefined
    )
    return result
  }

  async function findVisibleVersion(version: string): Promise<VisibleDataVersion> {
    const { findGameDataVersions } = await import('@maple/db/admin/game-data-version')
    const row = (await findGameDataVersions()).find((item) => item.version === version)
    if (
      !row ||
      !isSelectableGameDataVersionStatus(row.status) ||
      !['test', 'production', 'copy'].includes(row.environment)
    )
      throw new Error(`Game data version is not available: ${version}`)
    return row
  }

  async function resolveVisibleVersion(
    version: string
  ): Promise<{ version: string; environment: string }> {
    const row = await findVisibleVersion(version)
    return { version: row.version, environment: row.environment }
  }

  async function resolveValidationEnvironment(
    version: string
  ): Promise<'test' | 'production' | 'copy'> {
    const row = await findVisibleVersion(version)
    if (
      row.environment !== 'test' &&
      row.environment !== 'production' &&
      row.environment !== 'copy'
    )
      throw new Error(`Unsupported data environment: ${row.environment}`)
    return row.environment
  }

  function resolveManagedDataRoot(): string {
    if (process.env.MAPLE_DATA_ROOT) return resolve(process.env.MAPLE_DATA_ROOT)
    if (is.dev) return resolve(app.getAppPath(), '../..', 'data')
    return join(app.getPath('userData'), 'data')
  }

  return {
    selectedDataFilePaths,
    selectedDataDirectoryPaths,
    activeConversions,
    activeValidations,
    activeValidationVersions,
    activeVersionCopies,
    serializeVersionMutation,
    resolveManagedDataRoot,
    findVisibleVersion,
    resolveVisibleVersion,
    resolveValidationEnvironment
  }
}
