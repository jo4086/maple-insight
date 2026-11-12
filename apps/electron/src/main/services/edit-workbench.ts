import { createHash, randomUUID } from 'node:crypto'
import { constants } from 'node:fs'
import type { FileHandle } from 'node:fs/promises'
import { lstat, mkdir, open, readdir, rename, rmdir, unlink } from 'node:fs/promises'
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path'

export type EditWorkbenchManifest = {
  schemaVersion: 1
  changeSetId: string
  environment: 'test' | 'production' | 'copy'
  version: string
  validationWorkspaceManifestSha256: string
  rawInputSha256: string
  status: 'draft' | 'superseded'
  createdAt: string
  updatedAt: string
  creatorLocalId: string
  parentChangeSetId: string | null
}

export type OpenOrCreateEditWorkbenchOptions = {
  dataRoot: string
  environment: 'test' | 'production' | 'copy'
  version: string
  creatorLocalId: string
}

export type EditWorkbench = {
  directory: string
  manifestPath: string
  manifest: EditWorkbenchManifest
  reused: boolean
}

export type JobMetadataAfter = {
  englishName: string
  classGroup: string
  affiliation: string
  mainStat: string
  subStat: string
  primaryWeapons: string[]
  secondaryWeapons: string[]
}

export type RecoveryCopyWeaponCandidate = {
  key: string
  category: 'weapon' | 'subWeapon'
  part: string
  englishName: string
  classGroupKeys: string[]
  handType: string | null
  weaponConstant: string | null
}

export type RecoveryCopyProvenance = {
  source: {
    environment: 'test' | 'production' | 'copy'
    version: string
    recoveryId: string
    sourceSha256: string
    jobId: string
    revision: number
  }
  excluded: {
    jobName: string
    newWeaponTypes: RecoveryCopyWeaponCandidate[]
    advancementJobIds: { present: boolean; value: string[] | null }
  }
  target: {
    validationWorkspaceManifestSha256: string
    rawInputSha256: string
  }
}

export type JobMetadataRecord = {
  recordId: string
  domain: 'job-metadata'
  operation: 'add' | 'update'
  rawIdentity: { jobID: string }
  beforeSha256: string | null
  after: JobMetadataAfter
  recoveryCopy?: RecoveryCopyProvenance
  revision: number
  reviewStatus: 'pending'
  createdAt: string
  updatedAt: string
}

export type JobMetadataRecordHistory = {
  latest: JobMetadataRecord | null
  history: JobMetadataRecord[]
}

export type JobMetadataRecordOptions = OpenOrCreateEditWorkbenchOptions & {
  changeSetId: string
  jobID: string
}

export type SaveJobMetadataRecordOptions = JobMetadataRecordOptions & {
  expectedRevision: number
  after: JobMetadataAfter
}

export type SaveRecoveredJobMetadataFirstRevisionOptions = JobMetadataRecordOptions & {
  expectedRevision: 0
  after: JobMetadataAfter
  provenance: RecoveryCopyProvenance
  expectedValidationWorkspaceManifestSha256: string
  expectedRawInputSha256: string
  INTERNAL_beforeFirstRevisionPublish?: () => Promise<void>
}

type WorkspaceFile = { source: string; workspace: string; records: number; sha256: string }
type WorkspaceSnapshot = { sha256: string; rawInputSha256: string }
type ValidationReport = {
  version: string
  environment: EditWorkbenchManifest['environment']
  status: 'ready'
}
type ChangeSet = { directory: string; manifestPath: string; manifest: EditWorkbenchManifest }
type WorkbenchHistory = { changeSets: ChangeSet[]; draft?: ChangeSet; tip?: ChangeSet }
type LockRecord = {
  schemaVersion: 1
  pid: number
  processStartTime: string | null
  token: string
}
type OpenedLock = {
  handle: FileHandle
  token: string
  bytes: Buffer
  dev: number | bigint
  ino: number | bigint
}
type ObservedLock = {
  record: LockRecord
  bytes: Buffer
  dev: number | bigint
  ino: number | bigint
}

const ENVIRONMENTS = ['test', 'production', 'copy'] as const
const VALIDATION_STATUSES = [
  'pending',
  'validating',
  'invalid',
  'review',
  'ready',
  'failed'
] as const
const VERSION_PATTERN = /^\d+\.\d+\.\d+$/
const SHA256_PATTERN = /^[a-f0-9]{64}$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const PROCESS_START_TIME_PATTERN = /^\d+$/
const LOCK_FIELDS = ['schemaVersion', 'pid', 'processStartTime', 'token'] as const
const MANIFEST_FIELDS = [
  'schemaVersion',
  'changeSetId',
  'environment',
  'version',
  'validationWorkspaceManifestSha256',
  'rawInputSha256',
  'status',
  'createdAt',
  'updatedAt',
  'creatorLocalId',
  'parentChangeSetId'
] as const
const JOB_ID_PATTERN = /^\d{1,5}$/
const JOB_METADATA_AFTER_FIELDS = [
  'englishName',
  'classGroup',
  'affiliation',
  'mainStat',
  'subStat',
  'primaryWeapons',
  'secondaryWeapons'
] as const
const JOB_METADATA_RECORD_FIELDS = [
  'recordId',
  'domain',
  'operation',
  'rawIdentity',
  'beforeSha256',
  'after',
  'revision',
  'reviewStatus',
  'createdAt',
  'updatedAt'
] as const
const RECOVERY_COPY_PROVENANCE_FIELDS = ['source', 'excluded', 'target'] as const
const RECOVERY_COPY_SOURCE_FIELDS = [
  'environment',
  'version',
  'recoveryId',
  'sourceSha256',
  'jobId',
  'revision'
] as const
const RECOVERY_COPY_EXCLUDED_FIELDS = ['jobName', 'newWeaponTypes', 'advancementJobIds'] as const
const RECOVERY_COPY_TARGET_FIELDS = ['validationWorkspaceManifestSha256', 'rawInputSha256'] as const
const RECOVERY_COPY_WEAPON_FIELDS = [
  'key',
  'category',
  'part',
  'englishName',
  'classGroupKeys',
  'handType',
  'weaponConstant'
] as const

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function hasExactFields(value: Record<string, unknown>, fields: readonly string[]): boolean {
  const keys = Object.keys(value)
  return keys.length === fields.length && keys.every((key) => fields.includes(key))
}

function isEnvironment(value: unknown): value is EditWorkbenchManifest['environment'] {
  return typeof value === 'string' && ENVIRONMENTS.includes(value as never)
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    return new Date(value).toISOString() === value
  } catch {
    return false
  }
}

function hasControlCharacter(value: string): boolean {
  return [...value].some((character) => {
    const code = character.charCodeAt(0)
    return code <= 31 || code === 127
  })
}

function assertOptions(options: OpenOrCreateEditWorkbenchOptions): void {
  if (typeof options.dataRoot !== 'string' || options.dataRoot.trim().length === 0)
    throw new Error('Invalid edit workbench dataRoot')
  if (!isEnvironment(options.environment)) throw new Error('Invalid edit workbench environment')
  if (typeof options.version !== 'string' || !VERSION_PATTERN.test(options.version))
    throw new Error('Invalid edit workbench version')
  if (
    typeof options.creatorLocalId !== 'string' ||
    options.creatorLocalId.trim().length === 0 ||
    options.creatorLocalId.length > 128 ||
    hasControlCharacter(options.creatorLocalId)
  )
    throw new Error('Invalid edit workbench creatorLocalId')
}

function isWithin(root: string, path: string): boolean {
  const child = relative(root, path)
  return child === '' || (!child.startsWith(`..${sep}`) && child !== '..' && !isAbsolute(child))
}

function isSafeRelativeFile(path: unknown, prefix?: string): path is string {
  if (typeof path !== 'string' || path.length === 0 || path.includes('\\')) return false
  if (
    isAbsolute(path) ||
    path.split('/').some((part) => part === '' || part === '.' || part === '..')
  )
    return false
  return prefix === undefined || path.startsWith(prefix)
}

async function assertNoSymlinks(root: string, path: string, allowMissing: boolean): Promise<void> {
  const absoluteRoot = resolve(root)
  const absolutePath = resolve(path)
  if (!isWithin(absoluteRoot, absolutePath)) throw new Error('Managed data path escapes root')

  const ancestors: string[] = []
  for (let current = absoluteRoot; ; current = dirname(current)) {
    ancestors.push(current)
    if (current === dirname(current)) break
  }
  const parts = relative(absoluteRoot, absolutePath).split(sep).filter(Boolean)
  let current = absoluteRoot
  for (const pathPart of [
    ...ancestors.reverse(),
    ...parts.map((part) => (current = join(current, part)))
  ]) {
    try {
      if ((await lstat(pathPart)).isSymbolicLink())
        throw new Error(`Symbolic links are not allowed: ${pathPart}`)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT' && allowMissing) return
      throw error
    }
  }
}

async function assertDirectory(dataRoot: string, path: string): Promise<void> {
  await assertNoSymlinks(dataRoot, path, false)
  if (!(await lstat(path)).isDirectory()) throw new Error(`Expected directory: ${path}`)
}

async function fsyncDirectory(path: string): Promise<void> {
  if (process.platform !== 'linux') return
  const handle = await open(path, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW)
  try {
    await handle.sync()
  } finally {
    await handle.close()
  }
}

function parseJson(bytes: Buffer, label: string): unknown {
  try {
    return JSON.parse(bytes.toString('utf8'))
  } catch {
    throw new Error(`${label} contains invalid JSON`)
  }
}

async function readRegularFileNoFollow(
  dataRoot: string,
  path: string,
  label: string
): Promise<Buffer> {
  await assertNoSymlinks(dataRoot, path, false)
  let handle: FileHandle | undefined
  try {
    handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW)
    if (!(await handle.stat()).isFile()) throw new Error(`${label} is not a file`)
    const bytes = await handle.readFile()
    await assertNoSymlinks(dataRoot, path, false)
    return bytes
  } finally {
    await handle?.close()
  }
}

function parseValidationReport(
  value: unknown,
  workspace: Pick<ValidationReport, 'version' | 'environment' | 'status'>
): ValidationReport {
  if (
    !isObject(value) ||
    value.version !== workspace.version ||
    value.environment !== workspace.environment ||
    value.status !== workspace.status ||
    value.status !== 'ready'
  )
    throw new Error('Validation report does not match ready validation workspace')
  return value as ValidationReport
}

function parseWorkspaceManifest(
  value: unknown,
  options: OpenOrCreateEditWorkbenchOptions
): {
  version: string
  environment: EditWorkbenchManifest['environment']
  status: 'ready'
  manifestPath: string
  manifestSha256: string
  inputSha256: string
  files: WorkspaceFile[]
} {
  if (!isObject(value)) throw new Error('Invalid validation workspace manifest')
  if (value.schemaVersion !== 1) throw new Error('Invalid validation workspace schemaVersion')
  if (value.version !== options.version || value.environment !== options.environment)
    throw new Error('Validation workspace identity does not match request')
  if (typeof value.status !== 'string' || !VALIDATION_STATUSES.includes(value.status as never))
    throw new Error('Invalid validation workspace status')
  if (value.status !== 'ready') throw new Error('Validation workspace is not ready')
  if (
    !isObject(value.input) ||
    !isSafeRelativeFile(value.input.manifest) ||
    typeof value.input.manifestSha256 !== 'string' ||
    !SHA256_PATTERN.test(value.input.manifestSha256) ||
    typeof value.input.inputSha256 !== 'string' ||
    !SHA256_PATTERN.test(value.input.inputSha256)
  )
    throw new Error('Invalid validation workspace input')
  if (!Array.isArray(value.files) || value.files.length === 0)
    throw new Error('Invalid validation workspace files')

  const seen = new Set<string>()
  const files = value.files.map((entry): WorkspaceFile => {
    if (
      !isObject(entry) ||
      !hasExactFields(entry, ['source', 'workspace', 'records', 'sha256']) ||
      !isSafeRelativeFile(entry.source, 'json/') ||
      !isSafeRelativeFile(entry.workspace, 'json/') ||
      extname(entry.source).toLowerCase() !== '.json' ||
      extname(entry.workspace).toLowerCase() !== '.json' ||
      !Number.isSafeInteger(entry.records) ||
      (entry.records as number) < 0 ||
      typeof entry.sha256 !== 'string' ||
      !SHA256_PATTERN.test(entry.sha256) ||
      seen.has(entry.workspace)
    )
      throw new Error('Invalid validation workspace files')
    seen.add(entry.workspace)
    return entry as WorkspaceFile
  })
  return {
    version: options.version,
    environment: options.environment,
    status: 'ready',
    manifestPath: value.input.manifest,
    manifestSha256: value.input.manifestSha256,
    inputSha256: value.input.inputSha256,
    files
  }
}

async function assertValidationUpdateMarkerAbsent(path: string): Promise<void> {
  try {
    await lstat(path)
    throw new Error('Validation workspace update is incomplete')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
}

async function readWorkspaceSnapshot(
  dataRoot: string,
  workspaceDirectory: string,
  options: OpenOrCreateEditWorkbenchOptions
): Promise<WorkspaceSnapshot> {
  await assertDirectory(dataRoot, workspaceDirectory)
  const workspaceManifestPath = join(workspaceDirectory, 'workspace.json')
  const updateMarkerPath = `${workspaceManifestPath}.validation-update`
  await assertValidationUpdateMarkerAbsent(updateMarkerPath)
  const workspaceBytes = await readRegularFileNoFollow(
    dataRoot,
    workspaceManifestPath,
    'Validation workspace manifest'
  )
  const parsed = parseWorkspaceManifest(
    parseJson(workspaceBytes, 'Validation workspace manifest'),
    options
  )
  const reportBytes = await readRegularFileNoFollow(
    dataRoot,
    join(workspaceDirectory, 'validation.json'),
    'Validation report'
  )
  parseValidationReport(parseJson(reportBytes, 'Validation report'), parsed)

  const convertedManifestPath = join(
    dataRoot,
    options.environment,
    options.version,
    parsed.manifestPath
  )
  const convertedBytes = await readRegularFileNoFollow(
    dataRoot,
    convertedManifestPath,
    'Converted manifest'
  )
  parseJson(convertedBytes, 'Converted manifest')
  if (createHash('sha256').update(convertedBytes).digest('hex') !== parsed.manifestSha256)
    throw new Error('Converted manifest digest does not match validation workspace')

  for (const file of parsed.files) {
    const filePath = join(workspaceDirectory, ...file.workspace.split('/'))
    const bytes = await readRegularFileNoFollow(
      dataRoot,
      filePath,
      `Validation workspace file ${file.workspace}`
    )
    parseJson(bytes, `Validation workspace file ${file.workspace}`)
    if (createHash('sha256').update(bytes).digest('hex') !== file.sha256)
      throw new Error(`Validation workspace file digest does not match: ${file.workspace}`)
  }

  const calculatedInputHash = createHash('sha256')
    .update(
      JSON.stringify({
        manifestSha256: parsed.manifestSha256,
        files: parsed.files.map(({ workspace, sha256 }) => ({ workspace, sha256 }))
      })
    )
    .digest('hex')
  if (calculatedInputHash !== parsed.inputSha256)
    throw new Error('Validation workspace aggregate input hash does not match')

  await assertNoSymlinks(dataRoot, workspaceManifestPath, false)
  await assertValidationUpdateMarkerAbsent(updateMarkerPath)
  return {
    sha256: createHash('sha256').update(workspaceBytes).digest('hex'),
    rawInputSha256: parsed.inputSha256
  }
}

function assertStoredManifest(
  value: unknown,
  expectedChangeSetId: string,
  options: OpenOrCreateEditWorkbenchOptions
): EditWorkbenchManifest {
  if (!isObject(value) || !hasExactFields(value, MANIFEST_FIELDS))
    throw new Error(`Corrupt edit workbench manifest: ${expectedChangeSetId}`)
  if (
    value.schemaVersion !== 1 ||
    value.changeSetId !== expectedChangeSetId ||
    !UUID_PATTERN.test(expectedChangeSetId) ||
    value.environment !== options.environment ||
    value.version !== options.version ||
    typeof value.validationWorkspaceManifestSha256 !== 'string' ||
    !SHA256_PATTERN.test(value.validationWorkspaceManifestSha256) ||
    typeof value.rawInputSha256 !== 'string' ||
    !SHA256_PATTERN.test(value.rawInputSha256) ||
    (value.status !== 'draft' && value.status !== 'superseded') ||
    !isIsoTimestamp(value.createdAt) ||
    !isIsoTimestamp(value.updatedAt) ||
    value.updatedAt < value.createdAt ||
    typeof value.creatorLocalId !== 'string' ||
    value.creatorLocalId.trim().length === 0 ||
    value.creatorLocalId.length > 128 ||
    hasControlCharacter(value.creatorLocalId) ||
    (value.parentChangeSetId !== null &&
      (typeof value.parentChangeSetId !== 'string' ||
        !UUID_PATTERN.test(value.parentChangeSetId) ||
        value.parentChangeSetId === expectedChangeSetId))
  )
    throw new Error(`Corrupt edit workbench manifest: ${expectedChangeSetId}`)
  return value as EditWorkbenchManifest
}

async function readHistory(
  dataRoot: string,
  root: string,
  options: OpenOrCreateEditWorkbenchOptions
): Promise<WorkbenchHistory> {
  await assertNoSymlinks(dataRoot, root, true)
  let entries: import('node:fs').Dirent[]
  try {
    entries = await readdir(root, { withFileTypes: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { changeSets: [] }
    throw error
  }

  const changeSets: ChangeSet[] = []
  for (const entry of entries) {
    if (
      entry.name === '.create.lock' ||
      /^\.staging-[0-9a-f-]+$/i.test(entry.name) ||
      /^\.create\.lock\.quarantine-[0-9a-f-]+$/i.test(entry.name)
    )
      continue
    const directory = join(root, entry.name)
    if (entry.isSymbolicLink() || !entry.isDirectory() || !UUID_PATTERN.test(entry.name))
      throw new Error(`Corrupt edit workbench entry: ${entry.name}`)
    await assertDirectory(dataRoot, directory)
    const manifestPath = join(directory, 'manifest.json')
    const bytes = await readRegularFileNoFollow(
      dataRoot,
      manifestPath,
      `Edit workbench manifest ${entry.name}`
    )
    const manifest = assertStoredManifest(
      parseJson(bytes, `Edit workbench manifest ${entry.name}`),
      entry.name,
      options
    )
    changeSets.push({ directory, manifestPath, manifest })
  }
  await assertNoSymlinks(dataRoot, root, false)
  if (changeSets.length === 0) return { changeSets }

  const byId = new Map(changeSets.map((changeSet) => [changeSet.manifest.changeSetId, changeSet]))
  const children = new Map<string, ChangeSet>()
  const roots: ChangeSet[] = []
  const drafts: ChangeSet[] = []
  for (const changeSet of changeSets) {
    const { parentChangeSetId, status } = changeSet.manifest
    if (status === 'draft') drafts.push(changeSet)
    if (parentChangeSetId === null) {
      roots.push(changeSet)
      continue
    }
    if (!byId.has(parentChangeSetId) || children.has(parentChangeSetId))
      throw new Error('Broken edit workbench parent graph')
    children.set(parentChangeSetId, changeSet)
  }
  if (roots.length !== 1 || drafts.length > 1) throw new Error('Ambiguous edit workbench history')

  const visited = new Set<string>()
  let tip = roots[0]
  while (tip) {
    const id = tip.manifest.changeSetId
    if (visited.has(id)) throw new Error('Broken edit workbench parent graph')
    visited.add(id)
    const child = children.get(id)
    if (!child) break
    if (tip.manifest.status !== 'superseded') throw new Error('Broken edit workbench parent graph')
    tip = child
  }
  if (
    visited.size !== changeSets.length ||
    (tip.manifest.status === 'draft') !== (drafts.length === 1)
  )
    throw new Error('Broken edit workbench parent graph')
  return { changeSets, draft: drafts[0], tip }
}

async function ensureDirectory(dataRoot: string, path: string): Promise<void> {
  await assertNoSymlinks(dataRoot, path, true)
  await mkdir(path, { recursive: true, mode: 0o700 })
  await assertDirectory(dataRoot, path)
}

function parseProcessStartTime(stat: string): string {
  const commandEnd = stat.lastIndexOf(') ')
  if (commandEnd < 0) throw new Error('Invalid Linux process stat')
  const fields = stat
    .slice(commandEnd + 2)
    .trim()
    .split(/\s+/)
  const startTime = fields[19]
  if (!startTime || !PROCESS_START_TIME_PATTERN.test(startTime))
    throw new Error('Invalid Linux process start identity')
  return startTime
}

async function readLinuxProcessStartTime(pid: number): Promise<string> {
  let handle: FileHandle | undefined
  try {
    handle = await open(`/proc/${pid}/stat`, constants.O_RDONLY | constants.O_NOFOLLOW)
    if (!(await handle.stat()).isFile()) throw new Error(`Linux process stat is not a file: ${pid}`)
    return parseProcessStartTime(await handle.readFile('utf8'))
  } finally {
    await handle?.close()
  }
}

function parseLockRecord(bytes: Buffer): LockRecord {
  let value: unknown
  try {
    value = JSON.parse(bytes.toString('utf8'))
  } catch {
    throw new Error('Edit workbench creation lock is malformed; lock preserved')
  }
  if (
    !isObject(value) ||
    !hasExactFields(value, LOCK_FIELDS) ||
    value.schemaVersion !== 1 ||
    !Number.isSafeInteger(value.pid) ||
    (value.pid as number) <= 0 ||
    (value.processStartTime !== null &&
      (typeof value.processStartTime !== 'string' ||
        !PROCESS_START_TIME_PATTERN.test(value.processStartTime))) ||
    typeof value.token !== 'string' ||
    !UUID_PATTERN.test(value.token)
  )
    throw new Error('Edit workbench creation lock is malformed; lock preserved')
  return value as LockRecord
}

async function readObservedLock(dataRoot: string, path: string): Promise<ObservedLock> {
  await assertNoSymlinks(dataRoot, path, false)
  let handle: FileHandle | undefined
  try {
    handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW)
    const stat = await handle.stat()
    if (!stat.isFile() || stat.size > 1024)
      throw new Error('Edit workbench creation lock is malformed; lock preserved')
    const bytes = await handle.readFile()
    await assertNoSymlinks(dataRoot, path, false)
    const current = await lstat(path)
    if (current.dev !== stat.dev || current.ino !== stat.ino)
      throw new Error('Edit workbench creation lock changed while reading; lock preserved')
    return { record: parseLockRecord(bytes), bytes, dev: stat.dev, ino: stat.ino }
  } finally {
    await handle?.close()
  }
}

async function failForExistingLock(dataRoot: string, path: string): Promise<never> {
  const observed = await readObservedLock(dataRoot, path)
  if (process.platform !== 'linux' || observed.record.processStartTime === null)
    throw new Error('Edit workbench creation is already locked; lock preserved')

  let currentStartTime: string
  try {
    currentStartTime = await readLinuxProcessStartTime(observed.record.pid)
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code !== 'ENOENT' && code !== 'ESRCH')
      throw new Error('Edit workbench creation lock owner status is uncertain; lock preserved', {
        cause: error
      })
    throw new Error(
      `Edit workbench creation lock belongs to dead process ${observed.record.pid}; close all app processes and, after checking ownership, move the stale .create.lock to a backup manually`
    )
  }
  if (currentStartTime === observed.record.processStartTime)
    throw new Error(
      `Edit workbench creation is already locked by active process ${observed.record.pid}`
    )
  throw new Error(
    `Edit workbench creation lock belongs to dead process ${observed.record.pid}; close all app processes and, after checking ownership, move the stale .create.lock to a backup manually`
  )
}

async function removeOpenedLock(dataRoot: string, path: string, lock: OpenedLock): Promise<void> {
  let cleanupError: unknown
  try {
    const current = await readObservedLock(dataRoot, path)
    if (
      current.dev === lock.dev &&
      current.ino === lock.ino &&
      current.record.token === lock.token &&
      current.bytes.equals(lock.bytes)
    )
      await unlink(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') cleanupError = error
  }
  try {
    await lock.handle.close()
  } catch (error) {
    cleanupError ??= error
  }
  if (cleanupError) throw cleanupError
}

async function acquireLock(dataRoot: string, root: string): Promise<OpenedLock> {
  const path = join(root, '.create.lock')
  const processStartTime =
    process.platform === 'linux' ? await readLinuxProcessStartTime(process.pid) : null

  await assertNoSymlinks(dataRoot, path, true)
  let handle: FileHandle | undefined
  try {
    handle = await open(
      path,
      constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
      0o600
    )
    const token = randomUUID()
    const bytes = Buffer.from(
      `${JSON.stringify({ schemaVersion: 1, pid: process.pid, processStartTime, token })}\n`
    )
    const stat = await handle.stat()
    const lock = { handle, token, bytes, dev: stat.dev, ino: stat.ino }
    try {
      await handle.writeFile(bytes)
      await handle.sync()
      await assertNoSymlinks(dataRoot, path, false)
      return lock
    } catch (error) {
      try {
        await removeOpenedLock(dataRoot, path, lock)
      } catch (cleanupError) {
        if (error && typeof error === 'object')
          Object.defineProperty(error, 'lockCleanupError', {
            value: cleanupError,
            configurable: true
          })
      }
      throw error
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
    return failForExistingLock(dataRoot, path)
  }
}

async function releaseOwnedLock(dataRoot: string, root: string, lock: OpenedLock): Promise<void> {
  await removeOpenedLock(dataRoot, join(root, '.create.lock'), lock)
}

function sameWorkspace(first: WorkspaceSnapshot, second: WorkspaceSnapshot): boolean {
  return first.sha256 === second.sha256 && first.rawInputSha256 === second.rawInputSha256
}

function nextTimestamp(previous: string): string {
  return new Date(Math.max(Date.now(), new Date(previous).getTime() + 1)).toISOString()
}

function assertJobMetadataOptions(options: JobMetadataRecordOptions): void {
  assertOptions(options)
  if (!UUID_PATTERN.test(options.changeSetId)) throw new Error('Invalid edit workbench changeSetId')
  if (!JOB_ID_PATTERN.test(options.jobID)) throw new Error('Invalid job metadata jobID')
}

function assertJobMetadataString(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || value.length > 128 || hasControlCharacter(value))
    throw new Error(`Invalid job metadata after field: ${field}`)
}

function assertJobMetadataAfter(value: unknown): asserts value is JobMetadataAfter {
  if (!isObject(value) || !hasExactFields(value, JOB_METADATA_AFTER_FIELDS))
    throw new Error('Unsupported job metadata after fields')
  for (const field of ['englishName', 'classGroup', 'affiliation', 'mainStat', 'subStat'] as const)
    assertJobMetadataString(value[field], field)
  for (const field of ['primaryWeapons', 'secondaryWeapons'] as const) {
    const entries = value[field]
    if (!Array.isArray(entries) || entries.length > 100)
      throw new Error(`Invalid job metadata after field: ${field}`)
    for (const entry of entries) assertJobMetadataString(entry, field)
  }
}

function snapshotJobMetadataAfter(value: JobMetadataAfter): unknown {
  if (!isObject(value)) return value
  return {
    ...value,
    primaryWeapons: Array.isArray(value.primaryWeapons)
      ? [...value.primaryWeapons]
      : value.primaryWeapons,
    secondaryWeapons: Array.isArray(value.secondaryWeapons)
      ? [...value.secondaryWeapons]
      : value.secondaryWeapons
  }
}

function snapshotRecoveryCopyProvenance(value: RecoveryCopyProvenance): unknown {
  if (!isObject(value)) return value
  const source = isObject(value.source) ? { ...value.source } : value.source
  const target = isObject(value.target) ? { ...value.target } : value.target
  let excluded: unknown = value.excluded
  if (isObject(value.excluded)) {
    const candidates = Array.isArray(value.excluded.newWeaponTypes)
      ? value.excluded.newWeaponTypes.map((candidate) =>
          isObject(candidate)
            ? {
                ...candidate,
                classGroupKeys: Array.isArray(candidate.classGroupKeys)
                  ? [...candidate.classGroupKeys]
                  : candidate.classGroupKeys
              }
            : candidate
        )
      : value.excluded.newWeaponTypes
    const advancement = isObject(value.excluded.advancementJobIds)
      ? {
          ...value.excluded.advancementJobIds,
          value: Array.isArray(value.excluded.advancementJobIds.value)
            ? [...value.excluded.advancementJobIds.value]
            : value.excluded.advancementJobIds.value
        }
      : value.excluded.advancementJobIds
    excluded = { ...value.excluded, newWeaponTypes: candidates, advancementJobIds: advancement }
  }
  return { ...value, source, excluded, target }
}

const RECOVERY_COPY_CLASS_GROUP_KEYS = new Set(['warrior', 'mage', 'archer', 'thief', 'pirate'])

function assertRecoveryCopyString(
  value: unknown,
  field: string,
  maximum: number,
  required = false
): asserts value is string {
  if (
    typeof value !== 'string' ||
    value.length > maximum ||
    hasControlCharacter(value) ||
    (required && value.trim().length === 0)
  )
    throw new Error(`Invalid recovery copy provenance field: ${field}`)
}

function assertRecoveryCopyStringArray(
  value: unknown,
  field: string,
  maximumItems: number
): asserts value is string[] {
  if (!Array.isArray(value) || value.length > maximumItems)
    throw new Error(`Invalid recovery copy provenance field: ${field}`)
  for (const entry of value) assertRecoveryCopyString(entry, field, 100, true)
  if (new Set(value).size !== value.length)
    throw new Error(`Duplicate recovery copy provenance value: ${field}`)
}

function assertRecoveryCopyWeaponCandidate(
  value: unknown
): asserts value is RecoveryCopyWeaponCandidate {
  if (!isObject(value) || !hasExactFields(value, RECOVERY_COPY_WEAPON_FIELDS))
    throw new Error('Invalid recovery copy weapon candidate fields')
  assertRecoveryCopyString(value.key, 'excluded.newWeaponTypes.key', 36, true)
  if (!UUID_PATTERN.test(value.key)) throw new Error('Invalid recovery copy weapon candidate key')
  if (value.category !== 'weapon' && value.category !== 'subWeapon')
    throw new Error('Invalid recovery copy weapon candidate category')
  assertRecoveryCopyString(value.part, 'excluded.newWeaponTypes.part', 100, true)
  assertRecoveryCopyString(value.englishName, 'excluded.newWeaponTypes.englishName', 100, true)
  assertRecoveryCopyStringArray(value.classGroupKeys, 'excluded.newWeaponTypes.classGroupKeys', 2)
  if (
    value.classGroupKeys.length === 0 ||
    value.classGroupKeys.some((key) => !RECOVERY_COPY_CLASS_GROUP_KEYS.has(key))
  )
    throw new Error('Invalid recovery copy weapon candidate class group')
  if (value.handType !== null)
    assertRecoveryCopyString(value.handType, 'excluded.newWeaponTypes.handType', 9, true)
  if (value.weaponConstant !== null)
    assertRecoveryCopyString(
      value.weaponConstant,
      'excluded.newWeaponTypes.weaponConstant',
      9,
      true
    )
  if (value.category === 'weapon') {
    if (value.handType !== 'oneHanded' && value.handType !== 'twoHanded')
      throw new Error('Invalid recovery copy weapon candidate handType')
    if (
      value.weaponConstant === null ||
      !/^\d+(?:\.\d{1,4})?$/.test(value.weaponConstant) ||
      Number(value.weaponConstant) <= 0 ||
      Number(value.weaponConstant) > 9999.9999
    )
      throw new Error('Invalid recovery copy weapon candidate constant')
  } else if (value.handType !== null || value.weaponConstant !== null) {
    throw new Error('Invalid recovery copy subWeapon candidate values')
  }
}

function assertRecoveryCopyProvenance(value: unknown): asserts value is RecoveryCopyProvenance {
  if (!isObject(value) || !hasExactFields(value, RECOVERY_COPY_PROVENANCE_FIELDS))
    throw new Error('Invalid recovery copy provenance fields')
  const { source, excluded, target } = value
  if (!isObject(source) || !hasExactFields(source, RECOVERY_COPY_SOURCE_FIELDS))
    throw new Error('Invalid recovery copy provenance source fields')
  if (!isEnvironment(source.environment))
    throw new Error('Invalid recovery copy provenance source environment')
  if (typeof source.version !== 'string' || !VERSION_PATTERN.test(source.version))
    throw new Error('Invalid recovery copy provenance source version')
  if (typeof source.recoveryId !== 'string' || !UUID_PATTERN.test(source.recoveryId))
    throw new Error('Invalid recovery copy provenance recoveryId')
  if (typeof source.sourceSha256 !== 'string' || !SHA256_PATTERN.test(source.sourceSha256))
    throw new Error('Invalid recovery copy provenance sourceSha256')
  if (typeof source.jobId !== 'string' || !JOB_ID_PATTERN.test(source.jobId))
    throw new Error('Invalid recovery copy provenance jobId')
  if (!Number.isSafeInteger(source.revision) || (source.revision as number) < 0)
    throw new Error('Invalid recovery copy provenance revision')

  if (!isObject(excluded) || !hasExactFields(excluded, RECOVERY_COPY_EXCLUDED_FIELDS))
    throw new Error('Invalid recovery copy provenance excluded fields')
  assertRecoveryCopyString(excluded.jobName, 'excluded.jobName', 128)
  if (!Array.isArray(excluded.newWeaponTypes) || excluded.newWeaponTypes.length > 20)
    throw new Error('Invalid recovery copy provenance field: excluded.newWeaponTypes')
  excluded.newWeaponTypes.forEach(assertRecoveryCopyWeaponCandidate)
  const candidateKeys = excluded.newWeaponTypes.map((candidate) => candidate.key)
  if (new Set(candidateKeys).size !== candidateKeys.length)
    throw new Error('Duplicate recovery copy weapon candidate key')
  if (
    !isObject(excluded.advancementJobIds) ||
    !hasExactFields(excluded.advancementJobIds, ['present', 'value']) ||
    typeof excluded.advancementJobIds.present !== 'boolean'
  )
    throw new Error('Invalid recovery copy advancementJobIds')
  if (excluded.advancementJobIds.value !== null) {
    assertRecoveryCopyStringArray(
      excluded.advancementJobIds.value,
      'excluded.advancementJobIds.value',
      20
    )
    if (excluded.advancementJobIds.value.some((jobId) => !JOB_ID_PATTERN.test(jobId)))
      throw new Error('Invalid recovery copy advancement jobId')
  }
  if (excluded.advancementJobIds.present !== (excluded.advancementJobIds.value !== null))
    throw new Error('Invalid recovery copy advancementJobIds presence')

  if (!isObject(target) || !hasExactFields(target, RECOVERY_COPY_TARGET_FIELDS))
    throw new Error('Invalid recovery copy provenance target fields')
  if (
    typeof target.validationWorkspaceManifestSha256 !== 'string' ||
    !SHA256_PATTERN.test(target.validationWorkspaceManifestSha256) ||
    typeof target.rawInputSha256 !== 'string' ||
    !SHA256_PATTERN.test(target.rawInputSha256)
  )
    throw new Error('Invalid recovery copy provenance target hashes')
}

function isStagingEntry(name: string): boolean {
  return name.startsWith('.staging-') && UUID_PATTERN.test(name.slice('.staging-'.length))
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (isObject(value))
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(',')}}`
  return JSON.stringify(value)
}

function afterSha256(after: JobMetadataAfter): string {
  return createHash('sha256').update(canonicalJson(after)).digest('hex')
}

function revisionFileName(revision: number): string {
  return `${revision.toString().padStart(6, '0')}.json`
}

function parseJobMetadataRecord(
  value: unknown,
  recordId: string,
  revision: number,
  previous?: JobMetadataRecord
): JobMetadataRecord {
  const hasRecoveryCopy = isObject(value) && 'recoveryCopy' in value
  const expectedFields =
    revision === 1 && hasRecoveryCopy
      ? [...JOB_METADATA_RECORD_FIELDS, 'recoveryCopy']
      : JOB_METADATA_RECORD_FIELDS
  if (
    !isObject(value) ||
    !hasExactFields(value, expectedFields) ||
    (hasRecoveryCopy && revision !== 1) ||
    value.recordId !== recordId ||
    value.domain !== 'job-metadata' ||
    value.operation !== (revision === 1 ? 'add' : 'update') ||
    !isObject(value.rawIdentity) ||
    !hasExactFields(value.rawIdentity, ['jobID']) ||
    typeof value.rawIdentity.jobID !== 'string' ||
    !JOB_ID_PATTERN.test(value.rawIdentity.jobID) ||
    value.beforeSha256 !== (previous ? afterSha256(previous.after) : null) ||
    value.revision !== revision ||
    value.reviewStatus !== 'pending' ||
    !isIsoTimestamp(value.createdAt) ||
    !isIsoTimestamp(value.updatedAt) ||
    value.updatedAt < value.createdAt ||
    (previous !== undefined &&
      (value.rawIdentity.jobID !== previous.rawIdentity.jobID ||
        value.createdAt !== previous.createdAt ||
        value.updatedAt <= previous.updatedAt))
  )
    throw new Error(`Corrupt job metadata revision: ${recordId}/${revisionFileName(revision)}`)
  assertJobMetadataAfter(value.after)
  if (hasRecoveryCopy) assertRecoveryCopyProvenance(value.recoveryCopy)
  return value as JobMetadataRecord
}

async function readAllJobMetadataRecords(
  dataRoot: string,
  changeSetDirectory: string
): Promise<Map<string, JobMetadataRecord[]>> {
  const recordsRoot = join(changeSetDirectory, 'records')
  await assertNoSymlinks(dataRoot, recordsRoot, true)
  let rootEntries: import('node:fs').Dirent[]
  try {
    rootEntries = await readdir(recordsRoot, { withFileTypes: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return new Map()
    throw error
  }
  if (
    rootEntries.length !== 1 ||
    rootEntries[0].name !== 'job-metadata' ||
    rootEntries[0].isSymbolicLink() ||
    !rootEntries[0].isDirectory()
  )
    throw new Error('Unexpected edit workbench records entry')

  const domainDirectory = join(recordsRoot, 'job-metadata')
  await assertDirectory(dataRoot, domainDirectory)
  const recordEntries = await readdir(domainDirectory, { withFileTypes: true })
  const byJobID = new Map<string, JobMetadataRecord[]>()
  for (const recordEntry of recordEntries) {
    if (isStagingEntry(recordEntry.name)) {
      if (recordEntry.isSymbolicLink() || !recordEntry.isDirectory())
        throw new Error(`Unexpected job metadata record entry: ${recordEntry.name}`)
      continue
    }
    if (
      recordEntry.isSymbolicLink() ||
      !recordEntry.isDirectory() ||
      !UUID_PATTERN.test(recordEntry.name)
    )
      throw new Error(`Unexpected job metadata record entry: ${recordEntry.name}`)
    const recordDirectory = join(domainDirectory, recordEntry.name)
    await assertDirectory(dataRoot, recordDirectory)
    const revisionEntries = await readdir(recordDirectory, { withFileTypes: true })
    const revisions = revisionEntries.filter((entry) => {
      if (!isStagingEntry(entry.name)) return true
      if (entry.isSymbolicLink() || !entry.isFile())
        throw new Error(`Corrupt job metadata revision sequence: ${recordEntry.name}`)
      return false
    })
    if (revisions.length === 0) throw new Error(`Corrupt job metadata record: ${recordEntry.name}`)
    const history: JobMetadataRecord[] = []
    for (let index = 0; index < revisions.length; index += 1) {
      const revision = index + 1
      const expectedName = revisionFileName(revision)
      const entry = revisions.find((candidate) => candidate.name === expectedName)
      if (!entry || entry.isSymbolicLink() || !entry.isFile())
        throw new Error(`Corrupt job metadata revision sequence: ${recordEntry.name}`)
      const path = join(recordDirectory, expectedName)
      const bytes = await readRegularFileNoFollow(
        dataRoot,
        path,
        `Job metadata revision ${recordEntry.name}/${expectedName}`
      )
      history.push(
        parseJobMetadataRecord(
          parseJson(bytes, `Job metadata revision ${recordEntry.name}/${expectedName}`),
          recordEntry.name,
          revision,
          history.at(-1)
        )
      )
    }
    const jobID = history[0].rawIdentity.jobID
    if (byJobID.has(jobID)) throw new Error(`Duplicate job metadata raw identity: ${jobID}`)
    byJobID.set(jobID, history)
  }
  await assertNoSymlinks(dataRoot, recordsRoot, false)
  return byJobID
}

async function currentDraftForRecordOperation(
  dataRoot: string,
  root: string,
  workspaceDirectory: string,
  options: JobMetadataRecordOptions
): Promise<{ changeSet: ChangeSet; workspace: WorkspaceSnapshot }> {
  const workspace = await readWorkspaceSnapshot(dataRoot, workspaceDirectory, options)
  const history = await readHistory(dataRoot, root, options)
  if (!history.draft || history.draft.manifest.changeSetId !== options.changeSetId)
    throw new Error('Job metadata changeSetId is not the current draft')
  if (history.draft.manifest.rawInputSha256 !== workspace.rawInputSha256)
    throw new Error('Job metadata change set does not match ready validation workspace')
  return { changeSet: history.draft, workspace }
}

async function changeSetForRecordRead(
  dataRoot: string,
  root: string,
  workspaceDirectory: string,
  options: JobMetadataRecordOptions
): Promise<{ changeSet: ChangeSet; workspace: WorkspaceSnapshot }> {
  const workspace = await readWorkspaceSnapshot(dataRoot, workspaceDirectory, options)
  const history = await readHistory(dataRoot, root, options)
  if (history.draft?.manifest.changeSetId === options.changeSetId) {
    if (history.draft.manifest.rawInputSha256 !== workspace.rawInputSha256)
      throw new Error('Job metadata change set does not match ready validation workspace')
    return { changeSet: history.draft, workspace }
  }

  let changeSet = history.draft ?? history.tip
  while (changeSet) {
    if (
      changeSet.manifest.changeSetId === options.changeSetId &&
      changeSet.manifest.status === 'superseded'
    )
      return { changeSet, workspace }
    const parentChangeSetId = changeSet.manifest.parentChangeSetId
    changeSet = parentChangeSetId
      ? history.changeSets.find((candidate) => candidate.manifest.changeSetId === parentChangeSetId)
      : undefined
  }
  throw new Error('Job metadata changeSetId is not the current draft or a superseded ancestor')
}

async function publishJobMetadataRevision(
  dataRoot: string,
  domainDirectory: string,
  record: JobMetadataRecord
): Promise<void> {
  const fileName = revisionFileName(record.revision)
  const bytes = `${JSON.stringify(record, null, 2)}\n`
  if (record.revision === 1) {
    const stagingDirectory = join(domainDirectory, `.staging-${record.recordId}`)
    const finalDirectory = join(domainDirectory, record.recordId)
    await assertNoSymlinks(dataRoot, stagingDirectory, true)
    await mkdir(stagingDirectory, { mode: 0o700 })
    let handle: FileHandle | undefined
    try {
      handle = await open(
        join(stagingDirectory, fileName),
        constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
        0o600
      )
      await handle.writeFile(bytes, 'utf8')
      await handle.sync()
      await handle.close()
      handle = undefined
      await fsyncDirectory(stagingDirectory)
      await assertNoSymlinks(dataRoot, finalDirectory, true)
      await rename(stagingDirectory, finalDirectory)
      await fsyncDirectory(domainDirectory)
    } catch (error) {
      await handle?.close().catch(() => undefined)
      await unlink(join(stagingDirectory, fileName)).catch(() => undefined)
      await rmdir(stagingDirectory).catch(() => undefined)
      throw error
    }
    return
  }

  const recordDirectory = join(domainDirectory, record.recordId)
  const stagingPath = join(recordDirectory, `.staging-${randomUUID()}`)
  const finalPath = join(recordDirectory, fileName)
  let handle: FileHandle | undefined
  try {
    await assertNoSymlinks(dataRoot, finalPath, true)
    handle = await open(
      stagingPath,
      constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
      0o600
    )
    await handle.writeFile(bytes, 'utf8')
    await handle.sync()
    await handle.close()
    handle = undefined
    await assertNoSymlinks(dataRoot, finalPath, true)
    await rename(stagingPath, finalPath)
    await fsyncDirectory(recordDirectory)
  } catch (error) {
    await handle?.close().catch(() => undefined)
    await unlink(stagingPath).catch(() => undefined)
    throw error
  }
}

async function supersedeDraft(dataRoot: string, draft: ChangeSet): Promise<ChangeSet> {
  const manifest: EditWorkbenchManifest = {
    ...draft.manifest,
    status: 'superseded',
    updatedAt: nextTimestamp(draft.manifest.updatedAt)
  }
  const temporaryPath = join(draft.directory, `.manifest-${randomUUID()}.tmp`)
  await assertNoSymlinks(dataRoot, temporaryPath, true)
  let handle: FileHandle | undefined
  try {
    handle = await open(
      temporaryPath,
      constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
      0o600
    )
    await handle.writeFile(`${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
    await handle.sync()
    await handle.close()
    handle = undefined
    await assertNoSymlinks(dataRoot, draft.manifestPath, false)
    await rename(temporaryPath, draft.manifestPath)
    await fsyncDirectory(draft.directory)
    await assertNoSymlinks(dataRoot, draft.manifestPath, false)
    return { ...draft, manifest }
  } catch (error) {
    await handle?.close().catch(() => undefined)
    await unlink(temporaryPath).catch((cleanupError) => {
      if ((cleanupError as NodeJS.ErrnoException).code !== 'ENOENT') throw cleanupError
    })
    throw error
  }
}

async function publishDraft(
  options: OpenOrCreateEditWorkbenchOptions,
  dataRoot: string,
  root: string,
  workspaceDirectory: string,
  workspace: WorkspaceSnapshot,
  parentChangeSetId: string | null
): Promise<EditWorkbench> {
  const changeSetId = randomUUID()
  const stagingDirectory = join(root, `.staging-${changeSetId}`)
  const directory = join(root, changeSetId)
  await assertNoSymlinks(dataRoot, stagingDirectory, true)
  await mkdir(stagingDirectory, { mode: 0o700 })
  await assertDirectory(dataRoot, stagingDirectory)

  const now = new Date().toISOString()
  const manifest: EditWorkbenchManifest = {
    schemaVersion: 1,
    changeSetId,
    environment: options.environment,
    version: options.version,
    validationWorkspaceManifestSha256: workspace.sha256,
    rawInputSha256: workspace.rawInputSha256,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    creatorLocalId: options.creatorLocalId,
    parentChangeSetId
  }
  const stagingManifestPath = join(stagingDirectory, 'manifest.json')
  const manifestHandle = await open(
    stagingManifestPath,
    constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
    0o600
  )
  try {
    await manifestHandle.writeFile(`${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
    await manifestHandle.sync()
  } finally {
    await manifestHandle.close()
  }

  const finalWorkspace = await readWorkspaceSnapshot(dataRoot, workspaceDirectory, options)
  if (!sameWorkspace(finalWorkspace, workspace))
    throw new Error('Validation workspace changed while opening')
  await assertNoSymlinks(dataRoot, stagingDirectory, false)
  await fsyncDirectory(stagingDirectory)
  await assertNoSymlinks(dataRoot, directory, true)
  await rename(stagingDirectory, directory)
  await fsyncDirectory(root)
  await assertDirectory(dataRoot, directory)
  const manifestPath = join(directory, 'manifest.json')
  await readRegularFileNoFollow(dataRoot, manifestPath, 'Edit workbench manifest')
  return { directory, manifestPath, manifest, reused: false }
}

export async function openOrCreateEditWorkbench(
  options: OpenOrCreateEditWorkbenchOptions
): Promise<EditWorkbench> {
  assertOptions(options)
  const dataRoot = resolve(options.dataRoot)
  await assertDirectory(dataRoot, dataRoot)
  const workspaceDirectory = join(dataRoot, '.workspaces', options.environment, options.version)
  const root = join(dataRoot, '.edit-workbenches', options.environment, options.version)
  await ensureDirectory(dataRoot, root)
  const lock = await acquireLock(dataRoot, root)
  try {
    const workspace = await readWorkspaceSnapshot(dataRoot, workspaceDirectory, options)
    const history = await readHistory(dataRoot, root, options)
    if (history.draft?.manifest.rawInputSha256 === workspace.rawInputSha256) {
      const unchanged = await readWorkspaceSnapshot(dataRoot, workspaceDirectory, options)
      if (!sameWorkspace(unchanged, workspace))
        throw new Error('Validation workspace changed while opening')
      return { ...history.draft, reused: true }
    }

    const unchanged = await readWorkspaceSnapshot(dataRoot, workspaceDirectory, options)
    if (!sameWorkspace(unchanged, workspace))
      throw new Error('Validation workspace changed while opening')
    const parent = history.draft ? await supersedeDraft(dataRoot, history.draft) : history.tip
    const retained = await readWorkspaceSnapshot(dataRoot, workspaceDirectory, options)
    if (!sameWorkspace(retained, workspace))
      throw new Error('Validation workspace changed while opening')
    return publishDraft(
      options,
      dataRoot,
      root,
      workspaceDirectory,
      workspace,
      parent?.manifest.changeSetId ?? null
    )
  } finally {
    await releaseOwnedLock(dataRoot, root, lock)
  }
}

export async function readJobMetadataRecords(
  options: JobMetadataRecordOptions
): Promise<JobMetadataRecordHistory> {
  assertJobMetadataOptions(options)
  const dataRoot = resolve(options.dataRoot)
  await assertDirectory(dataRoot, dataRoot)
  const workspaceDirectory = join(dataRoot, '.workspaces', options.environment, options.version)
  const root = join(dataRoot, '.edit-workbenches', options.environment, options.version)
  await ensureDirectory(dataRoot, root)
  const lock = await acquireLock(dataRoot, root)
  try {
    const { changeSet, workspace } = await changeSetForRecordRead(
      dataRoot,
      root,
      workspaceDirectory,
      options
    )
    const records = await readAllJobMetadataRecords(dataRoot, changeSet.directory)
    const unchanged = await readWorkspaceSnapshot(dataRoot, workspaceDirectory, options)
    if (!sameWorkspace(unchanged, workspace))
      throw new Error('Validation workspace changed while reading job metadata')
    const history = records.get(options.jobID) ?? []
    return { latest: history.at(-1) ?? null, history }
  } finally {
    await releaseOwnedLock(dataRoot, root, lock)
  }
}

export async function saveRecoveredJobMetadataFirstRevision(
  options: SaveRecoveredJobMetadataFirstRevisionOptions
): Promise<JobMetadataRecord> {
  const after = snapshotJobMetadataAfter(options.after)
  const provenance = snapshotRecoveryCopyProvenance(options.provenance)
  const expectedValidationWorkspaceManifestSha256 =
    options.expectedValidationWorkspaceManifestSha256
  const expectedRawInputSha256 = options.expectedRawInputSha256
  const beforeFirstRevisionPublish = options.INTERNAL_beforeFirstRevisionPublish
  assertJobMetadataOptions(options)
  if (beforeFirstRevisionPublish !== undefined && typeof beforeFirstRevisionPublish !== 'function')
    throw new Error('Invalid recovered job metadata internal publish callback')
  if (options.expectedRevision !== 0)
    throw new Error('Recovered job metadata requires expectedRevision 0')
  assertJobMetadataAfter(after)
  assertRecoveryCopyProvenance(provenance)
  if (
    typeof expectedValidationWorkspaceManifestSha256 !== 'string' ||
    !SHA256_PATTERN.test(expectedValidationWorkspaceManifestSha256) ||
    typeof expectedRawInputSha256 !== 'string' ||
    !SHA256_PATTERN.test(expectedRawInputSha256)
  )
    throw new Error('Invalid recovered job metadata target hashes')
  if (
    provenance.source.environment !== options.environment ||
    provenance.source.version !== options.version ||
    provenance.source.jobId !== options.jobID
  )
    throw new Error('Recovery copy source identity does not match request')
  if (
    provenance.target.validationWorkspaceManifestSha256 !==
      expectedValidationWorkspaceManifestSha256 ||
    provenance.target.rawInputSha256 !== expectedRawInputSha256
  )
    throw new Error('Recovery copy provenance target does not match request')
  const excludedCandidateKeys = new Set(
    provenance.excluded.newWeaponTypes.map((candidate) => candidate.key)
  )
  if (
    [...after.primaryWeapons, ...after.secondaryWeapons].some((key) =>
      excludedCandidateKeys.has(key)
    )
  )
    throw new Error('Recovered job metadata references an excluded weapon candidate')

  const dataRoot = resolve(options.dataRoot)
  await assertDirectory(dataRoot, dataRoot)
  const workspaceDirectory = join(dataRoot, '.workspaces', options.environment, options.version)
  const root = join(dataRoot, '.edit-workbenches', options.environment, options.version)
  await ensureDirectory(dataRoot, root)
  const lock = await acquireLock(dataRoot, root)
  try {
    const { changeSet, workspace } = await currentDraftForRecordOperation(
      dataRoot,
      root,
      workspaceDirectory,
      options
    )
    if (
      workspace.sha256 !== expectedValidationWorkspaceManifestSha256 ||
      workspace.rawInputSha256 !== expectedRawInputSha256 ||
      changeSet.manifest.validationWorkspaceManifestSha256 !==
        expectedValidationWorkspaceManifestSha256 ||
      changeSet.manifest.rawInputSha256 !== expectedRawInputSha256
    )
      throw new Error('Recovery copy target does not match current edit workbench')

    const records = await readAllJobMetadataRecords(dataRoot, changeSet.directory)
    const existingHistory = records.get(options.jobID) ?? []
    const existing = existingHistory[0]
    if (existing) {
      if (
        existing.recoveryCopy === undefined ||
        canonicalJson(existing.after) !== canonicalJson(after) ||
        canonicalJson(existing.recoveryCopy) !== canonicalJson(provenance)
      )
        throw new Error('Job metadata first revision already exists')
      const unchanged = await readWorkspaceSnapshot(dataRoot, workspaceDirectory, options)
      if (
        !sameWorkspace(unchanged, workspace) ||
        unchanged.sha256 !== expectedValidationWorkspaceManifestSha256 ||
        unchanged.rawInputSha256 !== expectedRawInputSha256
      )
        throw new Error('Validation workspace changed while saving recovered job metadata')
      return existing
    }

    const now = new Date().toISOString()
    const record: JobMetadataRecord = {
      recordId: randomUUID(),
      domain: 'job-metadata',
      operation: 'add',
      rawIdentity: { jobID: options.jobID },
      beforeSha256: null,
      after,
      recoveryCopy: provenance,
      revision: 1,
      reviewStatus: 'pending',
      createdAt: now,
      updatedAt: now
    }
    const unchanged = await readWorkspaceSnapshot(dataRoot, workspaceDirectory, options)
    if (
      !sameWorkspace(unchanged, workspace) ||
      unchanged.sha256 !== expectedValidationWorkspaceManifestSha256 ||
      unchanged.rawInputSha256 !== expectedRawInputSha256
    )
      throw new Error('Validation workspace changed while saving recovered job metadata')

    await beforeFirstRevisionPublish?.()
    const recordsRoot = join(changeSet.directory, 'records')
    const domainDirectory = join(recordsRoot, 'job-metadata')
    await ensureDirectory(dataRoot, domainDirectory)
    await publishJobMetadataRevision(dataRoot, domainDirectory, record)
    return record
  } finally {
    await releaseOwnedLock(dataRoot, root, lock)
  }
}

export async function saveJobMetadataRecord(
  options: SaveJobMetadataRecordOptions
): Promise<JobMetadataRecord> {
  const after = snapshotJobMetadataAfter(options.after)
  assertJobMetadataOptions(options)
  if (!Number.isSafeInteger(options.expectedRevision) || options.expectedRevision < 0)
    throw new Error('Invalid job metadata expectedRevision')
  assertJobMetadataAfter(after)
  const dataRoot = resolve(options.dataRoot)
  await assertDirectory(dataRoot, dataRoot)
  const workspaceDirectory = join(dataRoot, '.workspaces', options.environment, options.version)
  const root = join(dataRoot, '.edit-workbenches', options.environment, options.version)
  await ensureDirectory(dataRoot, root)
  const lock = await acquireLock(dataRoot, root)
  try {
    const { changeSet, workspace } = await currentDraftForRecordOperation(
      dataRoot,
      root,
      workspaceDirectory,
      options
    )
    const records = await readAllJobMetadataRecords(dataRoot, changeSet.directory)
    const previousHistory = records.get(options.jobID) ?? []
    const previous = previousHistory.at(-1)
    if ((previous?.revision ?? 0) !== options.expectedRevision)
      throw new Error('Stale job metadata revision')

    const now = previous ? nextTimestamp(previous.updatedAt) : new Date().toISOString()
    const record: JobMetadataRecord = {
      recordId: previous?.recordId ?? randomUUID(),
      domain: 'job-metadata',
      operation: previous ? 'update' : 'add',
      rawIdentity: { jobID: options.jobID },
      beforeSha256: previous ? afterSha256(previous.after) : null,
      after,
      revision: options.expectedRevision + 1,
      reviewStatus: 'pending',
      createdAt: previous?.createdAt ?? now,
      updatedAt: now
    }
    const unchanged = await readWorkspaceSnapshot(dataRoot, workspaceDirectory, options)
    if (!sameWorkspace(unchanged, workspace))
      throw new Error('Validation workspace changed while saving job metadata')

    const recordsRoot = join(changeSet.directory, 'records')
    const domainDirectory = join(recordsRoot, 'job-metadata')
    await ensureDirectory(dataRoot, domainDirectory)
    await publishJobMetadataRevision(dataRoot, domainDirectory, record)
    return record
  } finally {
    await releaseOwnedLock(dataRoot, root, lock)
  }
}
