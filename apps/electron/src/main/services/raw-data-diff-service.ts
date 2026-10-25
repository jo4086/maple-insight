import { createHash } from 'node:crypto'
import { lstat, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'

import { resolveGameDataVersion } from '@maple/db/game-data-version'

import type {
  CompareRawDataRequest,
  ListComparableFilesRequest,
  RawDataComparison,
  RawDataFieldChange,
  RawDataFieldValue,
  RawDataModifiedRecord,
  RawDataRecord,
  RawDataValue,
  SaveRawDataDiffRequest
} from '../../shared/raw-data-diff'

import { diffRawData } from './raw-data-diff'

export const RAW_DATA_DIFF_FILENAMES = [
  'ms_job.json',
  'ms_skill.json',
  'ms_skillH.json',
  'ms_skillCommon.json',
  'ms_skillLevel.json'
] as const

const writeLocks = new Map<string, Promise<void>>()

function assertVersion(version: unknown, name: string): { version: string; environment: string } {
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`Invalid ${name}`)
  }
  return { version, environment: resolveGameDataVersion(version).environment }
}

function assertFilename(
  filename: unknown
): asserts filename is (typeof RAW_DATA_DIFF_FILENAMES)[number] {
  if (typeof filename !== 'string' || !RAW_DATA_DIFF_FILENAMES.includes(filename as never)) {
    throw new Error('Unsupported raw data diff filename')
  }
}

type VersionLocation = { version: string; environment: string }
type ResolveVersion = (version: string) => Promise<VersionLocation>

async function assertRequestVersions(
  request: ListComparableFilesRequest,
  resolveVersion?: ResolveVersion
): Promise<{ base: VersionLocation; compare: VersionLocation }> {
  if (typeof request.baseVersion !== 'string' || !/^\d+\.\d+\.\d+$/.test(request.baseVersion))
    throw new Error('Invalid baseVersion')
  if (typeof request.compareVersion !== 'string' || !/^\d+\.\d+\.\d+$/.test(request.compareVersion))
    throw new Error('Invalid compareVersion')
  if (request.baseVersion === request.compareVersion)
    throw new Error('baseVersion and compareVersion must differ')
  const base = resolveVersion
    ? await resolveVersion(request.baseVersion)
    : assertVersion(request.baseVersion, 'baseVersion')
  const compare = resolveVersion
    ? await resolveVersion(request.compareVersion)
    : assertVersion(request.compareVersion, 'compareVersion')
  if (
    !['test', 'production', 'copy'].includes(base.environment) ||
    !['test', 'production', 'copy'].includes(compare.environment) ||
    base.version !== request.baseVersion ||
    compare.version !== request.compareVersion
  )
    throw new Error('Invalid data version environment')
  return { base, compare }
}

function isWithin(root: string, path: string): boolean {
  const pathRelative = relative(root, path)
  return (
    pathRelative === '' || (!pathRelative.startsWith('..') && !pathRelative.includes(`..${sep}`))
  )
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
      const entry = await lstat(pathPart)
      if (entry.isSymbolicLink()) throw new Error(`Symbolic links are not allowed: ${pathPart}`)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT' && allowMissing) return
      if ((error as NodeJS.ErrnoException).code === 'ENOENT')
        throw new Error(`Missing input: ${current}`)
      throw error
    }
  }
}

async function assertDirectory(root: string, path: string, allowMissing = false): Promise<void> {
  await assertNoSymlinks(root, path, allowMissing)
  try {
    if (!(await lstat(path)).isDirectory()) throw new Error(`Expected directory: ${path}`)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT' && allowMissing) return
    throw error
  }
}

async function ensureDirectory(root: string, path: string): Promise<void> {
  await assertNoSymlinks(root, path, true)
  await mkdir(path, { recursive: true })
  await assertDirectory(root, path)
}

function versionJsonDirectory(dataRoot: string, environment: string, version: string): string {
  return join(dataRoot, environment, version, 'json')
}

function outputPath(
  dataRoot: string,
  baseVersion: string,
  compareVersion: string,
  filename: string
): string {
  return join(dataRoot, 'diff', `${baseVersion}_to_${compareVersion}`, filename)
}

async function readRawInput(dataRoot: string, path: string): Promise<Buffer> {
  await assertNoSymlinks(dataRoot, path, false)
  const entry = await lstat(path)
  if (!entry.isFile()) throw new Error(`Expected input file: ${path}`)
  return readFile(path)
}

function parseRecords(bytes: Buffer, path: string): unknown {
  try {
    return JSON.parse(bytes.toString('utf8'))
  } catch (error) {
    throw new Error(
      `Invalid JSON input ${path}: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

function hashInputs(base: Buffer, compare: Buffer): string {
  const hash = createHash('sha256')
  for (const input of [base, compare]) {
    const size = Buffer.allocUnsafe(8)
    size.writeBigUInt64BE(BigInt(input.length))
    hash.update(size)
    hash.update(input)
  }
  return hash.digest('hex')
}

async function compare(
  dataRoot: string,
  request: CompareRawDataRequest,
  resolveVersion?: ResolveVersion
): Promise<RawDataComparison> {
  const { base, compare: compareVersion } = await assertRequestVersions(request, resolveVersion)
  assertFilename(request.filename)
  const baseDirectory = versionJsonDirectory(dataRoot, base.environment, base.version)
  const compareDirectory = versionJsonDirectory(
    dataRoot,
    compareVersion.environment,
    compareVersion.version
  )
  await assertDirectory(dataRoot, baseDirectory)
  await assertDirectory(dataRoot, compareDirectory)
  const basePath = join(baseDirectory, request.filename)
  const comparePath = join(compareDirectory, request.filename)
  const [baseInput, compareInput] = await Promise.all([
    readRawInput(dataRoot, basePath),
    readRawInput(dataRoot, comparePath)
  ])
  const result = diffRawData(
    request.filename,
    parseRecords(baseInput, basePath),
    parseRecords(compareInput, comparePath)
  )
  return {
    baseVersion: base.version,
    compareVersion: compareVersion.version,
    filename: request.filename,
    inputHash: hashInputs(baseInput, compareInput),
    ...result
  }
}

function isRawDataValue(value: unknown): value is RawDataValue {
  if (value === null || ['string', 'boolean'].includes(typeof value)) return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.every(isRawDataValue)
  if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype)
    return false
  return Object.values(value as Record<string, unknown>).every(isRawDataValue)
}

function isRecord(value: unknown): value is RawDataRecord {
  return (
    Boolean(value) && typeof value === 'object' && !Array.isArray(value) && isRawDataValue(value)
  )
}

function isFieldValue(value: unknown): value is RawDataFieldValue {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    ((value as { kind?: unknown }).kind === 'absent' ||
      ((value as { kind?: unknown }).kind === 'value' &&
        isRawDataValue((value as { value?: unknown }).value)))
  )
}

function isModifiedRecord(value: unknown): value is RawDataModifiedRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as {
    identity?: unknown
    fields?: unknown
    before?: unknown
    after?: unknown
  }
  return (
    Boolean(record.identity) &&
    typeof record.identity === 'object' &&
    !Array.isArray(record.identity) &&
    Object.values(record.identity as Record<string, unknown>).every(
      (item) => typeof item === 'string'
    ) &&
    Object.hasOwn(record, 'before') === Object.hasOwn(record, 'after') &&
    (!Object.hasOwn(record, 'before') || (isRecord(record.before) && isRecord(record.after))) &&
    Array.isArray(record.fields) &&
    record.fields.every((field): field is RawDataFieldChange => {
      if (!field || typeof field !== 'object') return false
      const change = field as { field?: unknown; before?: unknown; after?: unknown }
      return (
        typeof change.field === 'string' &&
        isFieldValue(change.before) &&
        isFieldValue(change.after)
      )
    })
  )
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_, item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return item
    return Object.fromEntries(
      Object.entries(item as Record<string, unknown>).sort(([left], [right]) =>
        left < right ? -1 : left > right ? 1 : 0
      )
    )
  })
}

function hasConsistentSnapshots(filename: string, record: RawDataModifiedRecord): boolean {
  if (!record.before || !record.after) return true
  try {
    const snapshotDiff = diffRawData(filename, [record.before], [record.after])
    return (
      snapshotDiff.add.length === 0 &&
      snapshotDiff.delete.length === 0 &&
      snapshotDiff.modify.length === 1 &&
      canonicalJson(snapshotDiff.modify[0].identity) === canonicalJson(record.identity) &&
      canonicalJson(snapshotDiff.modify[0].fields) === canonicalJson(record.fields)
    )
  } catch {
    return false
  }
}

function hashResult(result: RawDataComparison): string {
  return createHash('sha256').update(canonicalJson(result)).digest('hex')
}

function assertStoredComparison(
  value: unknown,
  expected: CompareRawDataRequest
): RawDataComparison {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid saved raw data diff')
  const stored = value as Partial<RawDataComparison> & { resultHash?: unknown }
  if (
    stored.baseVersion !== expected.baseVersion ||
    stored.compareVersion !== expected.compareVersion ||
    stored.filename !== expected.filename ||
    typeof stored.inputHash !== 'string' ||
    !/^[a-f0-9]{64}$/.test(stored.inputHash) ||
    !Array.isArray(stored.add) ||
    !stored.add.every(isRecord) ||
    !Array.isArray(stored.modify) ||
    !stored.modify.every(isModifiedRecord) ||
    !Array.isArray(stored.delete) ||
    !stored.delete.every(isRecord) ||
    typeof stored.resultHash !== 'string' ||
    !/^[a-f0-9]{64}$/.test(stored.resultHash)
  ) {
    throw new Error('Invalid saved raw data diff')
  }
  if (!stored.modify.every((record) => hasConsistentSnapshots(expected.filename, record))) {
    throw new Error('Invalid saved raw data diff')
  }
  const result: RawDataComparison = {
    baseVersion: stored.baseVersion,
    compareVersion: stored.compareVersion,
    filename: stored.filename,
    inputHash: stored.inputHash,
    add: stored.add,
    modify: stored.modify,
    delete: stored.delete
  }
  if (stored.resultHash !== hashResult(result)) throw new Error('Invalid saved raw data diff')
  return result
}

async function readStoredComparison(
  dataRoot: string,
  request: CompareRawDataRequest
): Promise<RawDataComparison | null> {
  const path = outputPath(dataRoot, request.baseVersion, request.compareVersion, request.filename)
  await assertNoSymlinks(dataRoot, dirname(path), true)
  let entry
  try {
    entry = await lstat(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
  await assertNoSymlinks(dataRoot, path, false)
  if (!entry.isFile()) throw new Error(`Expected saved raw data diff file: ${path}`)
  try {
    return assertStoredComparison(JSON.parse(await readFile(path, 'utf8')), request)
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error('Invalid saved raw data diff')
    throw error
  }
}

async function withWriteLock<T>(path: string, operation: () => Promise<T>): Promise<T> {
  const previous = writeLocks.get(path) ?? Promise.resolve()
  let release: () => void = () => undefined
  const current = new Promise<void>((resolve) => {
    release = resolve
  })
  const queued = previous.then(() => current)
  writeLocks.set(path, queued)
  await previous
  try {
    return await operation()
  } finally {
    release()
    if (writeLocks.get(path) === queued) writeLocks.delete(path)
  }
}

export async function listComparableRawDataFiles(
  dataRoot: string,
  request: ListComparableFilesRequest,
  resolveVersion?: ResolveVersion
): Promise<string[]> {
  const { base, compare } = await assertRequestVersions(request, resolveVersion)
  const baseDirectory = versionJsonDirectory(dataRoot, base.environment, base.version)
  const compareDirectory = versionJsonDirectory(dataRoot, compare.environment, compare.version)
  await assertDirectory(dataRoot, baseDirectory)
  await assertDirectory(dataRoot, compareDirectory)
  const files = await Promise.all(
    RAW_DATA_DIFF_FILENAMES.map(async (filename) => {
      const isRegularFile = async (path: string): Promise<boolean> => {
        try {
          const entry = await lstat(path)
          return entry.isFile() && !entry.isSymbolicLink()
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
          throw error
        }
      }
      const [baseFile, compareFile] = await Promise.all([
        isRegularFile(join(baseDirectory, filename)),
        isRegularFile(join(compareDirectory, filename))
      ])
      return { filename, baseFile, compareFile }
    })
  )
  const shared = files
    .filter(({ baseFile, compareFile }) => baseFile && compareFile)
    .map(({ filename }) => filename)
  if (shared.length > 0) return shared

  const missing = files.find(({ baseFile, compareFile }) => baseFile !== compareFile)
  if (missing) {
    const version = missing.baseFile ? compare.version : base.version
    const name = missing.baseFile ? 'compare' : 'base'
    throw new Error(
      `Missing raw JSON file ${missing.filename} for ${name} version ${version}. Import raw JSON for this version.`
    )
  }
  return shared
}

export async function compareRawData(
  dataRoot: string,
  request: CompareRawDataRequest,
  resolveVersion?: ResolveVersion
): Promise<RawDataComparison> {
  return compare(dataRoot, request, resolveVersion)
}

export async function saveRawDataDiff(
  dataRoot: string,
  request: SaveRawDataDiffRequest,
  resolveVersion?: ResolveVersion
): Promise<{ status: 'created' | 'reused' | 'replaced'; result: RawDataComparison }> {
  if (typeof request.inputHash !== 'string' || !/^[a-f0-9]{64}$/.test(request.inputHash)) {
    throw new Error('Invalid inputHash')
  }
  if (request.replaceExisting !== undefined && typeof request.replaceExisting !== 'boolean') {
    throw new Error('Invalid replaceExisting')
  }
  const result = await compare(dataRoot, request, resolveVersion)
  if (request.inputHash !== result.inputHash) throw new Error('Raw data input hash is stale')
  const path = outputPath(dataRoot, result.baseVersion, result.compareVersion, result.filename)

  return withWriteLock(path, async () => {
    let existing: RawDataComparison | null
    let invalidExisting = false
    try {
      existing = await readStoredComparison(dataRoot, result)
    } catch (error) {
      if (!(error instanceof Error) || error.message !== 'Invalid saved raw data diff') throw error
      if (!request.replaceExisting) throw error
      existing = null
      invalidExisting = true
    }
    if (existing) {
      if (existing.inputHash === result.inputHash) return { status: 'reused', result: existing }
      if (!request.replaceExisting)
        throw new Error('Raw data diff exists for different input; replaceExisting is required')
    }

    const directory = dirname(path)
    await ensureDirectory(dataRoot, directory)
    const staging = join(directory, `.${basename(path)}.${process.pid}.${Date.now()}.tmp`)
    try {
      await writeFile(
        staging,
        `${JSON.stringify({ ...result, resultHash: hashResult(result) }, null, 2)}\n`,
        {
          encoding: 'utf8',
          flag: 'wx'
        }
      )
      await assertNoSymlinks(dataRoot, directory, false)
      await rename(staging, path)
    } catch (error) {
      await rm(staging, { force: true }).catch(() => undefined)
      throw error
    }
    return { status: existing || invalidExisting ? 'replaced' : 'created', result }
  })
}

export async function openRawDataDiff(
  dataRoot: string,
  request: CompareRawDataRequest,
  resolveVersion?: ResolveVersion
): Promise<RawDataComparison | null> {
  await assertRequestVersions(request, resolveVersion)
  assertFilename(request.filename)
  return readStoredComparison(dataRoot, request)
}
