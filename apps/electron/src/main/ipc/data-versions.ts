import type {
  CopyDataVersionRequest,
  DeleteDataVersionRequest,
  RegisteredDataVersion,
  UpdateDataVersionReleaseDateRequest
} from '../../shared/data-versions'
import { isSelectableGameDataVersionStatus } from '../services/versions/selectable-game-data-version'
import {
  cleanupIncompleteVersionCopyFiles,
  commitVersionCopyFiles,
  prepareVersionCopyFiles,
  rollbackVersionCopyFiles
} from '../services/versions/version-copy-files'

import type { MainIpcContext } from './register'

const UPDATE_DATA_VERSION_RELEASE_DATE_CHANNEL = 'data-version:update-release-date'
const COPY_DATA_VERSION_CHANNEL = 'data-version:copy'
const DELETE_DATA_VERSION_CHANNEL = 'data-version:delete'
const LIST_DATA_VERSIONS_CHANNEL = 'data-version:list'
const LIST_REGISTERED_DATA_VERSIONS_CHANNEL = 'data-version:list-registered'

function isVersion(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d+\.\d+\.\d+$/.test(value) &&
    value.split('.').every((part) => Number.isSafeInteger(Number(part))) &&
    value ===
      value
        .split('.')
        .map((part) => String(Number(part)))
        .join('.')
  )
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

async function listRegisteredDataVersions(): Promise<RegisteredDataVersion[]> {
  try {
    const { findGameDataVersions } = await import('@maple/db/admin/game-data-version')
    const versions = await findGameDataVersions()
    return versions
      .filter(({ status }) => isSelectableGameDataVersionStatus(status))
      .map(({ version, environment, releasedOn, createdAt, status }) => {
        if (environment !== 'test' && environment !== 'production' && environment !== 'copy')
          throw new Error(`Unsupported data environment: ${environment}`)
        if (status !== 'ready' && status !== 'importing')
          throw new Error(`Unsupported data version status: ${status}`)
        return {
          version,
          environment,
          releasedOn: releasedOn?.toISOString() ?? null,
          createdAt: createdAt.toISOString(),
          status
        }
      })
  } catch {
    throw new Error('DB 버전 목록을 불러오지 못했습니다. DB 실행 상태와 DATABASE_URL을 확인하세요.')
  }
}

async function listDataVersions(): Promise<string[]> {
  return (await listRegisteredDataVersions()).map(({ version }) => version)
}

export function registerDataVersionHandlers(context: MainIpcContext): string[] {
  const {
    ipcMain,
    activeValidationVersions,
    activeVersionCopies,
    serializeVersionMutation,
    resolveManagedDataRoot,
    findVisibleVersion
  } = context

  ipcMain.handle(
    UPDATE_DATA_VERSION_RELEASE_DATE_CHANNEL,
    async (_, request: unknown): Promise<void> => {
      if (
        !isObject(request) ||
        !isVersion(request.version) ||
        !(request.releasedOn === null || typeof request.releasedOn === 'string')
      )
        throw new Error('Invalid release date request')
      const input = request as UpdateDataVersionReleaseDateRequest
      const { parseGameDataReleaseDate } = await import('@maple/db/game-data-version')
      if (input.releasedOn !== null) parseGameDataReleaseDate(input.releasedOn)
      return serializeVersionMutation(async () => {
        await findVisibleVersion(input.version)
        const { updateGameDataVersionReleasedOn } =
          await import('@maple/db/admin/game-data-version')
        await updateGameDataVersionReleasedOn(input.version, input.releasedOn)
      })
    }
  )

  ipcMain.handle(DELETE_DATA_VERSION_CHANNEL, async (_, request: unknown): Promise<void> => {
    if (
      !isObject(request) ||
      !isVersion(request.version) ||
      request.confirmationVersion !== request.version
    )
      throw new Error('Invalid version deletion confirmation')
    const input = request as DeleteDataVersionRequest
    return serializeVersionMutation(async () => {
      await findVisibleVersion(input.version)
      if (activeValidationVersions.has(input.version))
        throw new Error('Version validation is active')
      const { softDeleteGameDataVersion } = await import('@maple/db/admin/game-data-version')
      await softDeleteGameDataVersion(input.version)
    })
  })

  ipcMain.handle(COPY_DATA_VERSION_CHANNEL, async (_, request: unknown): Promise<void> => {
    if (
      !isObject(request) ||
      !isVersion(request.sourceVersion) ||
      !isVersion(request.targetVersion) ||
      request.sourceVersion === request.targetVersion
    )
      throw new Error('Invalid version copy request')
    const input = request as CopyDataVersionRequest
    return serializeVersionMutation(async () => {
      const source = await findVisibleVersion(input.sourceVersion)
      if (source.status !== 'ready' || activeValidationVersions.has(input.sourceVersion))
        throw new Error('Source version must be ready and inactive')
      activeVersionCopies.add(input.sourceVersion)
      try {
        const {
          cloneGameDataVersion,
          finalizeGameDataVersionCopy,
          findGameDataVersions,
          resetIncompleteGameDataVersionCopy
        } = await import('@maple/db/admin/game-data-version')
        const copying = (await findGameDataVersions('copying')).find(
          ({ version }) => version === input.targetVersion
        )
        if (copying) {
          if (copying.environment !== 'copy')
            throw new Error('Version copy target is not a copy environment')
          await cleanupIncompleteVersionCopyFiles(resolveManagedDataRoot(), input.targetVersion)
          await resetIncompleteGameDataVersionCopy(input.targetVersion)
        } else {
          const existing = (await findGameDataVersions()).some(
            ({ version }) => version === input.targetVersion
          )
          if (existing) throw new Error('Version copy target already exists')
        }
        const prepared = await prepareVersionCopyFiles({
          dataRoot: resolveManagedDataRoot(),
          sourceVersion: input.sourceVersion,
          sourceEnvironment: source.environment as 'test' | 'production' | 'copy',
          targetVersion: input.targetVersion
        })
        let cloned = false
        try {
          await cloneGameDataVersion(input.sourceVersion, input.targetVersion)
          cloned = true
          await commitVersionCopyFiles(prepared)
          await finalizeGameDataVersionCopy(input.targetVersion)
        } catch (error) {
          try {
            await rollbackVersionCopyFiles(prepared)
            if (cloned) await resetIncompleteGameDataVersionCopy(input.targetVersion)
          } catch (cleanupError) {
            throw new AggregateError(
              [error, cleanupError],
              'Version copy failed and cleanup incomplete'
            )
          }
          throw error
        }
      } finally {
        activeVersionCopies.delete(input.sourceVersion)
      }
    })
  })

  ipcMain.handle(LIST_DATA_VERSIONS_CHANNEL, listDataVersions)
  ipcMain.handle(LIST_REGISTERED_DATA_VERSIONS_CHANNEL, listRegisteredDataVersions)

  return [
    UPDATE_DATA_VERSION_RELEASE_DATE_CHANNEL,
    DELETE_DATA_VERSION_CHANNEL,
    COPY_DATA_VERSION_CHANNEL,
    LIST_DATA_VERSIONS_CHANNEL,
    LIST_REGISTERED_DATA_VERSIONS_CHANNEL
  ]
}
