import { randomUUID } from 'node:crypto'
import { lstat, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'

import type {
  JobDataSnapshot,
  JobDraft,
  JobSummary,
  NewWeaponType,
  SaveJobDraftRequest,
  WeaponTypeOption
} from '../../shared/job-data'

type DatabaseWeaponType = {
  id: bigint
  category: string
  part: string
  normalizedPart: string
  classGroupKeys: string[]
  handType: string | null
  weaponConstant: { toString(): string } | null
}

type JobDataRepository = {
  findGameJobsByVersion(version: string): Promise<JobSummary[]>
  findGlobalWeaponTypes(): Promise<DatabaseWeaponType[]>
}

type JobDataOptions = {
  dataRoot: string
  environment: 'test' | 'production' | 'copy'
  version: string
  repository?: JobDataRepository
}

const draftMutations = new Map<string, Promise<void>>()
const DRAFT_FIELDS = [
  'jobId',
  'jobName',
  'englishName',
  'classGroup',
  'affiliation',
  'mainStat',
  'subStat',
  'primaryWeapons',
  'secondaryWeapons',
  'newWeaponTypes',
  'revision'
] as const
const NEW_WEAPON_TYPE_FIELDS = [
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

function isVersion(value: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(value)
}

function assertContext(options: JobDataOptions): void {
  if (!isVersion(options.version)) throw new Error('Invalid job data version')
  if (!['test', 'production', 'copy'].includes(options.environment))
    throw new Error('Invalid job data environment')
}

function isWithin(root: string, path: string): boolean {
  const child = relative(root, path)
  return child === '' || (!child.startsWith(`..${sep}`) && child !== '..' && !isAbsolute(child))
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

// Recovery snapshots have no publish manifest and are not Phase 4 edit workbenches.
function recoveryRoot(options: JobDataOptions): string {
  return join(
    resolve(options.dataRoot),
    '.job-draft-recovery',
    options.environment,
    options.version
  )
}

function recoveryLocatorPath(options: JobDataOptions): string {
  return join(recoveryRoot(options), 'current.json')
}

function recoveryDraftPath(options: JobDataOptions, recoveryId: string): string {
  return join(recoveryRoot(options), recoveryId, 'drafts.json')
}

async function ensureDraftDirectory(dataRoot: string, path: string): Promise<void> {
  await assertNoSymlinks(dataRoot, dirname(path), true)
  await mkdir(dirname(path), { recursive: true })
  await assertNoSymlinks(dataRoot, dirname(path), false)
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function readRecoveryId(options: JobDataOptions): Promise<string | null> {
  const path = recoveryLocatorPath(options)
  await assertNoSymlinks(options.dataRoot, path, true)
  try {
    const parsed: unknown = JSON.parse(await readFile(path, 'utf8'))
    if (
      !isObject(parsed) ||
      !hasExactFields(parsed, ['recoveryId']) ||
      typeof parsed.recoveryId !== 'string' ||
      !UUID_PATTERN.test(parsed.recoveryId)
    )
      throw new Error('Invalid job draft recovery locator')
    return parsed.recoveryId
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    if (error instanceof SyntaxError)
      throw new Error('Job draft recovery locator contains invalid JSON')
    throw error
  }
}

async function writeRecoveryId(options: JobDataOptions, recoveryId: string): Promise<void> {
  const path = recoveryLocatorPath(options)
  await ensureDraftDirectory(options.dataRoot, path)
  const temporaryPath = join(dirname(path), `.${randomUUID()}.tmp`)
  try {
    await writeFile(temporaryPath, `${JSON.stringify({ recoveryId })}\n`, {
      encoding: 'utf8',
      flag: 'wx'
    })
    await rename(temporaryPath, path)
  } finally {
    await rm(temporaryPath, { force: true })
  }
}

async function readDrafts(dataRoot: string, path: string): Promise<unknown[]> {
  await assertNoSymlinks(dataRoot, path, true)
  try {
    const parsed: unknown = JSON.parse(await readFile(path, 'utf8'))
    if (!Array.isArray(parsed)) throw new Error('Job draft file must contain an array')
    return parsed
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    if (error instanceof SyntaxError) throw new Error('Job draft file contains invalid JSON')
    throw error
  }
}

function assertString(value: unknown, field: string, maximum: number, required = false): string {
  if (
    typeof value !== 'string' ||
    value.length > maximum ||
    (required && value.trim().length === 0)
  )
    throw new Error(`Invalid job draft field: ${field}`)
  return value
}

function assertStringArray(value: unknown, field: string, maximumItems = 20): string[] {
  if (!Array.isArray(value) || value.length > maximumItems)
    throw new Error(`Invalid job draft field: ${field}`)
  const values = value.map((item) => assertString(item, field, 100, true))
  if (new Set(values).size !== values.length) throw new Error(`Duplicate job draft value: ${field}`)
  return values
}

const CLASS_GROUP_KEYS = new Set(['warrior', 'mage', 'archer', 'thief', 'pirate'])

function normalizedPart(part: string): string {
  return part.replace(/\s+/gu, '')
}

function validateNewWeaponType(value: unknown): NewWeaponType {
  if (!isObject(value) || !hasExactFields(value, NEW_WEAPON_TYPE_FIELDS))
    throw new Error('Invalid new weapon type fields')
  const key = assertString(value.key, 'newWeaponTypes.key', 36, true)
  if (!UUID_PATTERN.test(key)) throw new Error('New weapon type key must be a UUID')
  if (value.category !== 'weapon' && value.category !== 'subWeapon')
    throw new Error('Invalid new weapon type category')

  const category = value.category
  const part = assertString(value.part, 'newWeaponTypes.part', 100, true)
  const englishName = assertString(value.englishName, 'newWeaponTypes.englishName', 100, true)
  const classGroupKeys = assertStringArray(value.classGroupKeys, 'newWeaponTypes.classGroupKeys', 2)
  if (classGroupKeys.some((classGroupKey) => !CLASS_GROUP_KEYS.has(classGroupKey)))
    throw new Error('Invalid new weapon type class group key')
  const energySword =
    normalizedPart(part) === '에너지소드' ||
    normalizedPart(englishName).toLowerCase() === 'energysword'
  if (
    (energySword &&
      (classGroupKeys.length !== 2 ||
        !classGroupKeys.includes('thief') ||
        !classGroupKeys.includes('pirate'))) ||
    (!energySword && classGroupKeys.length !== 1)
  )
    throw new Error('Invalid new weapon type class group selection')

  const handType =
    value.handType === null
      ? null
      : assertString(value.handType, 'newWeaponTypes.handType', 9, true)
  const weaponConstant =
    value.weaponConstant === null
      ? null
      : assertString(value.weaponConstant, 'newWeaponTypes.weaponConstant', 9, true)
  if (category === 'weapon') {
    if (handType !== 'oneHanded' && handType !== 'twoHanded')
      throw new Error('Primary weapon handType must be oneHanded or twoHanded')
    if (
      weaponConstant === null ||
      !/^\d+(?:\.\d{1,4})?$/.test(weaponConstant) ||
      Number(weaponConstant) <= 0 ||
      Number(weaponConstant) > 9999.9999
    )
      throw new Error('Invalid primary weapon constant')
  } else if (handType !== null || weaponConstant !== null) {
    throw new Error('Secondary weapon handType and weaponConstant must be null')
  }

  return {
    key,
    category,
    part,
    englishName,
    classGroupKeys,
    handType,
    weaponConstant
  }
}

function weaponIdentity(category: string, part: string): string {
  return `${category}:${normalizedPart(part)}`
}

function validateDraft(
  value: unknown,
  catalog: WeaponTypeOption[],
  options: { allowCatalogCandidateConflict?: boolean } = {}
): JobDraft {
  if (!isObject(value) || !hasExactFields(value, DRAFT_FIELDS))
    throw new Error('Invalid job draft fields')
  const jobId = assertString(value.jobId, 'jobId', 20, true)
  if (!/^\d+$/.test(jobId)) throw new Error('Job ID must be numeric')
  if (Number(jobId) >= 800000) throw new Error('System job drafts are excluded')
  if (!/^\d{1,5}$/.test(jobId)) throw new Error('Job ID must contain 1 to 5 digits')
  if (!Number.isSafeInteger(value.revision) || (value.revision as number) < 0)
    throw new Error('Invalid job draft revision')

  if (!Array.isArray(value.newWeaponTypes) || value.newWeaponTypes.length > 20)
    throw new Error('Invalid job draft field: newWeaponTypes')
  const newWeaponTypes = value.newWeaponTypes.map(validateNewWeaponType)
  const keys = newWeaponTypes.map(({ key }) => key)
  const identities = newWeaponTypes.map(({ category, part }) => weaponIdentity(category, part))
  if (new Set(keys).size !== keys.length || new Set(identities).size !== identities.length)
    throw new Error('New weapon types must be unique')

  const catalogKeys = new Set(catalog.map(({ key }) => key))
  const catalogIdentities = new Set(
    catalog.map(({ category, part }) => weaponIdentity(category, part))
  )
  if (
    !options.allowCatalogCandidateConflict &&
    (keys.some((key) => catalogKeys.has(key)) ||
      identities.some((item) => catalogIdentities.has(item)))
  )
    throw new Error('New weapon type conflicts with the global catalog')

  const primaryWeapons = assertStringArray(value.primaryWeapons, 'primaryWeapons')
  const secondaryWeapons = assertStringArray(value.secondaryWeapons, 'secondaryWeapons')
  const primaryKeys = new Set([
    ...catalog.filter(({ category }) => category === 'weapon').map(({ key }) => key),
    ...newWeaponTypes.filter(({ category }) => category === 'weapon').map(({ key }) => key)
  ])
  const secondaryKeys = new Set([
    ...catalog.filter(({ category }) => category === 'subWeapon').map(({ key }) => key),
    ...newWeaponTypes.filter(({ category }) => category === 'subWeapon').map(({ key }) => key)
  ])
  if (primaryWeapons.some((key) => !primaryKeys.has(key)))
    throw new Error('Primary weapons must reference weapon category keys')
  if (secondaryWeapons.some((key) => !secondaryKeys.has(key)))
    throw new Error('Secondary weapons must reference subWeapon category keys')

  return {
    jobId,
    jobName: assertString(value.jobName, 'jobName', 100, true),
    englishName: assertString(value.englishName, 'englishName', 100),
    classGroup: assertString(value.classGroup, 'classGroup', 100),
    affiliation: assertString(value.affiliation, 'affiliation', 100),
    mainStat: assertString(value.mainStat, 'mainStat', 40),
    subStat: assertString(value.subStat, 'subStat', 40),
    primaryWeapons,
    secondaryWeapons,
    newWeaponTypes,
    revision: value.revision as number
  }
}

function mapWeaponTypes(rows: DatabaseWeaponType[]): WeaponTypeOption[] {
  return rows.map((row) => {
    if (row.category !== 'weapon' && row.category !== 'subWeapon')
      throw new Error(`Unsupported weapon type category: ${row.category}`)
    return {
      key: row.id.toString(),
      category: row.category,
      part: row.part,
      classGroupKeys: row.classGroupKeys,
      handType: row.handType,
      weaponConstant: row.weaponConstant?.toString() ?? null
    }
  })
}

async function repository(options: JobDataOptions): Promise<JobDataRepository> {
  return options.repository ?? (await import('@maple/db'))
}

async function loadData(options: JobDataOptions): Promise<{
  jobs: JobSummary[]
  weaponTypes: WeaponTypeOption[]
}> {
  const source = await repository(options)
  const [jobs, weaponRows] = await Promise.all([
    source.findGameJobsByVersion(options.version),
    source.findGlobalWeaponTypes()
  ])
  return {
    jobs: jobs.filter(({ jobId }) => /^\d{1,5}$/.test(jobId) && Number(jobId) < 800000),
    weaponTypes: mapWeaponTypes(weaponRows)
  }
}

export async function listJobData(options: JobDataOptions): Promise<JobDataSnapshot> {
  assertContext(options)
  const { jobs, weaponTypes } = await loadData(options)
  const recoveryId = await readRecoveryId(options)
  const drafts =
    recoveryId === null
      ? []
      : (await readDrafts(options.dataRoot, recoveryDraftPath(options, recoveryId))).map((draft) =>
          validateDraft(draft, weaponTypes, { allowCatalogCandidateConflict: true })
        )
  return {
    jobs,
    weaponTypes,
    drafts: drafts.sort((left, right) => left.jobId.localeCompare(right.jobId))
  }
}

async function atomicWriteDrafts(
  dataRoot: string,
  path: string,
  drafts: JobDraft[]
): Promise<void> {
  await ensureDraftDirectory(dataRoot, path)
  await assertNoSymlinks(dataRoot, path, true)
  const temporaryPath = join(dirname(path), `.${randomUUID()}.tmp`)
  try {
    await writeFile(temporaryPath, `${JSON.stringify(drafts, null, 2)}\n`, {
      encoding: 'utf8',
      flag: 'wx'
    })
    await rename(temporaryPath, path)
  } finally {
    await rm(temporaryPath, { force: true })
  }
}

async function serializeDraftMutation<T>(path: string, operation: () => Promise<T>): Promise<T> {
  const previous = draftMutations.get(path) ?? Promise.resolve()
  let release!: () => void
  const current = new Promise<void>((resolvePromise) => {
    release = resolvePromise
  })
  const queued = previous.then(() => current)
  draftMutations.set(path, queued)
  await previous
  try {
    return await operation()
  } finally {
    release()
    if (draftMutations.get(path) === queued) draftMutations.delete(path)
  }
}

export async function saveJobDraft(
  options: JobDataOptions,
  request: SaveJobDraftRequest
): Promise<JobDraft> {
  assertContext(options)
  if (!isObject(request) || !hasExactFields(request, ['version', 'draft']))
    throw new Error('Invalid save job draft request')
  if (request.version !== options.version) throw new Error('Job draft version mismatch')

  const { weaponTypes } = await loadData(options)
  const requested = validateDraft(request.draft, weaponTypes)
  const locatorPath = recoveryLocatorPath(options)
  return serializeDraftMutation(locatorPath, async () => {
    const existingRecoveryId = await readRecoveryId(options)
    const recoveryId = existingRecoveryId ?? randomUUID()
    const path = recoveryDraftPath(options, recoveryId)
    const drafts =
      existingRecoveryId === null
        ? []
        : (await readDrafts(options.dataRoot, path)).map((draft) =>
            validateDraft(draft, weaponTypes, { allowCatalogCandidateConflict: true })
          )
    const otherCandidates = drafts
      .filter(({ jobId }) => jobId !== requested.jobId)
      .flatMap(({ newWeaponTypes }) => newWeaponTypes)
    const otherKeys = new Set(otherCandidates.map(({ key }) => key))
    const otherIdentities = new Set(
      otherCandidates.map(({ category, part }) => weaponIdentity(category, part))
    )
    const conflictingCandidate = requested.newWeaponTypes.find(
      ({ key, category, part }) =>
        otherKeys.has(key) || otherIdentities.has(weaponIdentity(category, part))
    )
    if (conflictingCandidate)
      throw new Error(
        `New weapon type conflicts with another job draft: ${conflictingCandidate.category}/${normalizedPart(conflictingCandidate.part)}`
      )

    const index = drafts.findIndex(({ jobId }) => jobId === requested.jobId)
    const currentRevision = index < 0 ? 0 : drafts[index].revision
    if (requested.revision !== currentRevision)
      throw new Error(
        `Job draft revision conflict: expected ${currentRevision}, received ${requested.revision}`
      )
    const nextRevision = drafts.reduce((maximum, draft) => Math.max(maximum, draft.revision), 0) + 1
    const saved = { ...requested, revision: nextRevision }
    if (index < 0) drafts.push(saved)
    else drafts[index] = saved
    drafts.sort((left, right) => left.jobId.localeCompare(right.jobId))
    await atomicWriteDrafts(options.dataRoot, path, drafts)
    if (existingRecoveryId === null) await writeRecoveryId(options, recoveryId)
    return saved
  })
}
