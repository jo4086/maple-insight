import { createHash } from 'node:crypto'
import { lstat, readFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'

import {
  affiliations,
  allClassKeyMap,
  classTree,
  classifyJobId,
  type ClassGroup,
  type ClassTreeNode
} from '@maple/data-core'

import {
  formatJobStats,
  parseJobStats,
  type JobDataSnapshot,
  type JobDraft,
  type JobDraftRecoveryPreview,
  type JobGroup,
  type JobSummary,
  type NewWeaponType,
  type SaveJobDraftRequest,
  type WeaponTypeOption
} from '../../../shared/job-data'
import {
  listJobMetadataRecords,
  openOrCreateEditWorkbench,
  readJobMetadataRecords,
  saveJobMetadataRecord,
  saveRecoveredJobMetadataFirstRevision,
  type JobMetadataAfter,
  type JobMetadataRecord
} from '../workbench/edit-workbench'

export type DatabaseWeaponType = {
  id: bigint
  category: string
  part: string
  normalizedPart: string
  classGroupKeys: string[]
  handType: string | null
  weaponConstant: { toString(): string } | null
}

export type JobDataRepository = {
  findGameJobsByVersion(version: string): Promise<JobSummary[]>
  findGlobalWeaponTypes(): Promise<DatabaseWeaponType[]>
}

type JobDataOptions = {
  dataRoot: string
  environment: 'test' | 'production' | 'copy'
  version: string
  repository?: JobDataRepository
}

export type CopySelectedJobDraftRecoveryRequest = {
  version: string
  recoveryId: string
  sourceSha256: string
  jobId: string
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
const OPTIONAL_DRAFT_FIELDS = ['advancementJobIds'] as const
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

function hasDraftFields(value: Record<string, unknown>): boolean {
  const keys = Object.keys(value)
  return (
    DRAFT_FIELDS.every((field) => keys.includes(field)) &&
    keys.every((key) =>
      ([...DRAFT_FIELDS, ...OPTIONAL_DRAFT_FIELDS] as readonly string[]).includes(key)
    )
  )
}

function isVersion(value: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(value)
}

function assertContext(options: JobDataOptions): void {
  if (typeof options.dataRoot !== 'string' || options.dataRoot.trim().length === 0)
    throw new Error('Invalid job data root')
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

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SHA256_PATTERN = /^[a-f0-9]{64}$/
const JOB_ID_PATTERN = /^\d{1,5}$/

async function readRecoveryId(options: JobDataOptions): Promise<string | null> {
  const path = recoveryLocatorPath(options)
  await assertNoSymlinks(options.dataRoot, path, true)
  try {
    const source = await readFile(path, 'utf8')
    await assertNoSymlinks(options.dataRoot, path, false)
    const parsed: unknown = JSON.parse(source)
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

type ReadDraftsResult = { drafts: unknown[]; sourceBytes: Buffer | null }

async function readDrafts(dataRoot: string, path: string): Promise<ReadDraftsResult> {
  await assertNoSymlinks(dataRoot, path, true)
  try {
    const sourceBytes = await readFile(path)
    await assertNoSymlinks(dataRoot, path, false)
    const parsed: unknown = JSON.parse(sourceBytes.toString('utf8'))
    if (!Array.isArray(parsed)) throw new Error('Job draft file must contain an array')
    return { drafts: parsed, sourceBytes }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { drafts: [], sourceBytes: null }
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

function validateAdvancementJobIds(value: unknown): string[] {
  const jobIds = assertStringArray(value, 'advancementJobIds', 20)
  for (const jobId of jobIds) {
    if (!/^\d{1,5}$/.test(jobId)) throw new Error('Advancement job IDs must contain 1 to 5 digits')
    const classification = classifyJobId(jobId)
    if (
      classification.kind === 'system' ||
      classification.kind === 'dummy' ||
      classification.kind === 'skillGroup' ||
      classification.kind === 'invalid'
    )
      throw new Error(`Invalid advancement job ID: ${jobId}`)
  }
  return jobIds
}

function validateDraft(
  value: unknown,
  catalog: WeaponTypeOption[],
  options: { allowCatalogCandidateConflict?: boolean; validateStats?: boolean } = {}
): JobDraft {
  if (!isObject(value) || !hasDraftFields(value)) throw new Error('Invalid job draft fields')
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

  const mainStat = assertString(value.mainStat, 'mainStat', 40)
  const subStat = assertString(value.subStat, 'subStat', 40)
  const parsedMainStat = options.validateStats ? parseJobStats(mainStat) : undefined
  const parsedSubStat = options.validateStats ? parseJobStats(subStat) : undefined
  if (parsedMainStat === null || parsedMainStat?.length === 0)
    throw new Error('Invalid job draft field: mainStat')
  if (parsedSubStat === null) throw new Error('Invalid job draft field: subStat')

  return {
    jobId,
    jobName: assertString(value.jobName, 'jobName', 100, true),
    englishName: assertString(value.englishName, 'englishName', 100),
    classGroup: assertString(value.classGroup, 'classGroup', 100),
    affiliation: assertString(value.affiliation, 'affiliation', 100),
    mainStat: parsedMainStat === undefined ? mainStat : formatJobStats(parsedMainStat),
    subStat: parsedSubStat === undefined ? subStat : formatJobStats(parsedSubStat),
    primaryWeapons,
    secondaryWeapons,
    newWeaponTypes,
    ...('advancementJobIds' in value
      ? { advancementJobIds: validateAdvancementJobIds(value.advancementJobIds) }
      : {}),
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

function canonicalTaxonomyJobs(jobs: JobSummary[]): JobSummary[] {
  const canonicalByNormalizedId = new Map<string, JobSummary>()
  for (const job of jobs) {
    const classification = classifyJobId(job.jobId)
    if (!('normalizedJobId' in classification)) continue
    const current = canonicalByNormalizedId.get(classification.normalizedJobId)
    if (
      current === undefined ||
      job.jobId.length < current.jobId.length ||
      (job.jobId.length === current.jobId.length && job.jobId.localeCompare(current.jobId) < 0)
    )
      canonicalByNormalizedId.set(classification.normalizedJobId, job)
  }
  return [...canonicalByNormalizedId.values()]
}

const DISPLAY_CLASS_GROUPS = [
  '전사',
  '마법사',
  '궁수',
  '도적',
  '해적'
] as const satisfies readonly ClassGroup[]

type JobDisplayOrder = {
  affiliation: number
  classGroup: number
}

const jobDisplayOrder = new Map<string, JobDisplayOrder>()

for (const { affiliation, roots } of classTree) {
  const visit = (
    node: ClassTreeNode,
    inheritedClassGroup?: ClassGroup | readonly ClassGroup[]
  ): void => {
    const classGroup = node.classGroup ?? inheritedClassGroup
    const classGroups = classGroup === undefined ? [] : [classGroup].flat()
    jobDisplayOrder.set(allClassKeyMap[node.className], {
      affiliation: affiliations.indexOf(affiliation),
      classGroup: Math.min(
        ...classGroups.map((value) => DISPLAY_CLASS_GROUPS.indexOf(value)),
        DISPLAY_CLASS_GROUPS.length
      )
    })
    node.children?.forEach((child) => visit(child, classGroup))
  }
  roots.forEach((root) => visit(root))
}

function compareJobGroups(left: JobGroup, right: JobGroup): number {
  const leftOrder = jobDisplayOrder.get(left.classKey)
  const rightOrder = jobDisplayOrder.get(right.classKey)
  return (
    (leftOrder?.affiliation ?? affiliations.length) -
      (rightOrder?.affiliation ?? affiliations.length) ||
    (leftOrder?.classGroup ?? DISPLAY_CLASS_GROUPS.length) -
      (rightOrder?.classGroup ?? DISPLAY_CLASS_GROUPS.length) ||
    Number(left.representativeJobId) - Number(right.representativeJobId) ||
    left.representativeJobId.localeCompare(right.representativeJobId) ||
    left.classKey.localeCompare(right.classKey)
  )
}

function groupJobs(jobs: JobSummary[]): JobGroup[] {
  const classified = canonicalTaxonomyJobs(jobs).map((job) => ({
    job,
    classification: classifyJobId(job.jobId)
  }))
  const groups: JobGroup[] = []

  for (const { job: representative, classification } of classified) {
    if (classification.kind !== 'job') continue
    for (const finalMatch of classification.matches.filter(({ stage }) => stage === 4)) {
      const advancements = classified.flatMap(({ job, classification: candidate }) => {
        if (candidate.kind !== 'job') return []
        return candidate.matches
          .filter(({ classKey }) => classKey === finalMatch.classKey)
          .map((match) => ({
            jobId: job.jobId,
            jobName: job.jobName,
            stage: match.stage,
            requiresReview: candidate.ambiguous
          }))
      })
      advancements.sort(
        (left, right) => left.stage - right.stage || left.jobId.localeCompare(right.jobId)
      )
      groups.push({
        classKey: finalMatch.classKey,
        representativeJobId: representative.jobId,
        representativeName: finalMatch.className,
        advancements
      })
    }
  }

  return groups.sort(compareJobGroups)
}

function workbenchOptions(options: JobDataOptions) {
  return {
    dataRoot: options.dataRoot,
    environment: options.environment,
    version: options.version,
    creatorLocalId: localCreatorId()
  }
}

async function validationWorkspaceExists(options: JobDataOptions): Promise<boolean> {
  const path = join(resolve(options.dataRoot), '.workspaces', options.environment, options.version)
  await assertNoSymlinks(options.dataRoot, path, true)
  try {
    if (!(await lstat(path)).isDirectory())
      throw new Error('Validation workspace path is not a directory')
    return true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
    throw error
  }
}

function unavailableValidationWorkspace(error: unknown): boolean {
  return error instanceof Error && error.message === 'Validation workspace is not ready'
}

function metadataDraft(job: JobSummary, record: JobMetadataRecord): JobDraft {
  return {
    jobId: job.jobId,
    jobName: job.jobName,
    ...record.after,
    newWeaponTypes: [],
    revision: record.revision
  }
}

export async function listJobData(options: JobDataOptions): Promise<JobDataSnapshot> {
  assertContext(options)
  const { jobs, weaponTypes } = await loadData(options)
  const snapshot = {
    jobs,
    jobGroups: groupJobs(jobs),
    weaponTypes
  }
  if (!(await validationWorkspaceExists(options)))
    return { ...snapshot, drafts: [], changeSetId: null, editorAvailable: false }

  let workbench
  try {
    workbench = await openOrCreateEditWorkbench(workbenchOptions(options))
  } catch (error) {
    if (unavailableValidationWorkspace(error))
      return { ...snapshot, drafts: [], changeSetId: null, editorAvailable: false }
    throw error
  }

  const records = await listJobMetadataRecords({
    ...workbenchOptions(options),
    changeSetId: workbench.manifest.changeSetId
  })
  const recordsByJobID = new Map(records.map((record) => [record.rawIdentity.jobID, record]))
  const drafts = jobs.flatMap((job) => {
    const record = recordsByJobID.get(job.jobId)
    return record ? [metadataDraft(job, record)] : []
  })

  return {
    ...snapshot,
    drafts: drafts.sort((left, right) => left.jobId.localeCompare(right.jobId)),
    changeSetId: workbench.manifest.changeSetId,
    editorAvailable: true
  }
}

export async function previewJobDraftRecovery(
  options: JobDataOptions
): Promise<JobDraftRecoveryPreview> {
  assertContext(options)
  const recoveryId = await readRecoveryId(options)
  if (recoveryId === null) return { recoveryId: null, sourceSha256: null, drafts: [] }

  const path = recoveryDraftPath(options, recoveryId)
  const source = await readDrafts(options.dataRoot, path)
  if (source.sourceBytes === null) throw new Error('Job draft recovery source is missing')

  const { weaponTypes } = await loadData(options)
  const drafts = source.drafts.map((draft) =>
    validateDraft(draft, weaponTypes, {
      allowCatalogCandidateConflict: true,
      validateStats: true
    })
  )
  const jobIds = new Set<string>()
  for (const draft of drafts) {
    if (jobIds.has(draft.jobId)) throw new Error(`Duplicate job draft ID: ${draft.jobId}`)
    jobIds.add(draft.jobId)
  }
  const unchangedRecoveryId = await readRecoveryId(options)
  const unchangedSource = await readDrafts(options.dataRoot, path)
  if (
    unchangedRecoveryId !== recoveryId ||
    unchangedSource.sourceBytes === null ||
    !source.sourceBytes.equals(unchangedSource.sourceBytes)
  )
    throw new Error('Job draft recovery source changed while reading')

  return {
    recoveryId,
    sourceSha256: createHash('sha256').update(source.sourceBytes).digest('hex'),
    drafts: drafts
      .map((draft) => {
        const selectedKeys = new Set([...draft.primaryWeapons, ...draft.secondaryWeapons])
        const blockingNewWeaponTypeKeys = draft.newWeaponTypes
          .map(({ key }) => key)
          .filter((key) => selectedKeys.has(key))
        return {
          jobId: draft.jobId,
          jobName: draft.jobName,
          revision: draft.revision,
          proposedAfter: {
            englishName: draft.englishName,
            classGroup: draft.classGroup,
            affiliation: draft.affiliation,
            mainStat: draft.mainStat,
            subStat: draft.subStat,
            primaryWeapons: draft.primaryWeapons,
            secondaryWeapons: draft.secondaryWeapons
          },
          excluded: {
            jobName: draft.jobName,
            newWeaponTypes: draft.newWeaponTypes,
            advancementJobIds: {
              present: draft.advancementJobIds !== undefined,
              value: draft.advancementJobIds ?? null
            }
          },
          blockedForCopy: blockingNewWeaponTypeKeys.length > 0,
          blockingNewWeaponTypeKeys
        }
      })
      .sort((left, right) => left.jobId.localeCompare(right.jobId))
  }
}

function assertCopySelectedJobDraftRecoveryRequest(
  options: JobDataOptions,
  request: unknown
): asserts request is CopySelectedJobDraftRecoveryRequest {
  if (
    !isObject(request) ||
    !hasExactFields(request, ['version', 'recoveryId', 'sourceSha256', 'jobId'])
  )
    throw new Error('Invalid copy job draft recovery request')
  if (typeof request.version !== 'string' || !isVersion(request.version))
    throw new Error('Invalid copy job draft recovery version')
  if (request.version !== options.version) throw new Error('Job draft recovery version mismatch')
  if (typeof request.recoveryId !== 'string' || !UUID_PATTERN.test(request.recoveryId))
    throw new Error('Invalid copy job draft recovery recoveryId')
  if (typeof request.sourceSha256 !== 'string' || !SHA256_PATTERN.test(request.sourceSha256))
    throw new Error('Invalid copy job draft recovery sourceSha256')
  if (typeof request.jobId !== 'string' || !JOB_ID_PATTERN.test(request.jobId))
    throw new Error('Invalid copy job draft recovery jobId')
}

function recoverySourceMatchesRequest(
  record: JobMetadataRecord,
  options: JobDataOptions,
  request: CopySelectedJobDraftRecoveryRequest
): boolean {
  const source = record.recoveryCopy?.source
  return (
    source !== undefined &&
    source.environment === options.environment &&
    source.version === request.version &&
    source.recoveryId === request.recoveryId &&
    source.sourceSha256 === request.sourceSha256 &&
    source.jobId === request.jobId
  )
}

function localCreatorId(): string {
  return process.platform === 'linux' && typeof process.getuid === 'function'
    ? `uid:${process.getuid()}`
    : 'local-operator'
}

export async function copySelectedJobDraftRecovery(
  options: JobDataOptions,
  request: CopySelectedJobDraftRecoveryRequest
): Promise<{ record: JobMetadataRecord; changeSetId: string }> {
  assertContext(options)
  assertCopySelectedJobDraftRecoveryRequest(options, request)

  // This in-process lock does not prevent recovery edits by another process.
  return serializeDraftMutation(recoveryLocatorPath(options), async () => {
    const workbenchOptions = {
      dataRoot: options.dataRoot,
      environment: options.environment,
      version: options.version,
      creatorLocalId: localCreatorId()
    }
    const workbench = await openOrCreateEditWorkbench(workbenchOptions)
    const target = {
      ...workbenchOptions,
      changeSetId: workbench.manifest.changeSetId,
      jobID: request.jobId
    }
    const existing = await readJobMetadataRecords(target)
    if (existing.history.length > 0) {
      const first = existing.history[0]
      if (!recoverySourceMatchesRequest(first, options, request))
        throw new Error('Job draft recovery target already exists')
      return { record: first, changeSetId: workbench.manifest.changeSetId }
    }

    const { jobs } = await loadData(options)
    if (!jobs.some(({ jobId }) => jobId === request.jobId))
      throw new Error('Selected job draft recovery must reference an existing DB job')

    const preview = await previewJobDraftRecovery(options)
    if (preview.recoveryId !== request.recoveryId || preview.sourceSha256 !== request.sourceSha256)
      throw new Error('Job draft recovery source does not match request')
    const selected = preview.drafts.filter(({ jobId }) => jobId === request.jobId)
    if (selected.length !== 1) throw new Error('Selected job draft recovery was not found')
    if (selected[0].blockedForCopy)
      throw new Error('Selected job draft recovery references a new weapon type')

    const record = await saveRecoveredJobMetadataFirstRevision({
      ...target,
      expectedRevision: 0,
      after: selected[0].proposedAfter,
      provenance: {
        source: {
          environment: options.environment,
          version: options.version,
          recoveryId: request.recoveryId,
          sourceSha256: request.sourceSha256,
          jobId: selected[0].jobId,
          revision: selected[0].revision
        },
        excluded: selected[0].excluded,
        target: {
          validationWorkspaceManifestSha256: workbench.manifest.validationWorkspaceManifestSha256,
          rawInputSha256: workbench.manifest.rawInputSha256
        }
      },
      expectedValidationWorkspaceManifestSha256:
        workbench.manifest.validationWorkspaceManifestSha256,
      expectedRawInputSha256: workbench.manifest.rawInputSha256,
      INTERNAL_beforeFirstRevisionPublish: async () => {
        const current = await previewJobDraftRecovery(options)
        const currentSelected = current.drafts.filter(({ jobId }) => jobId === request.jobId)
        if (
          current.recoveryId !== request.recoveryId ||
          current.sourceSha256 !== request.sourceSha256 ||
          currentSelected.length !== 1 ||
          currentSelected[0].jobId !== selected[0].jobId ||
          currentSelected[0].revision !== selected[0].revision
        )
          throw new Error('Job draft recovery source changed before copy')
      }
    })
    return { record, changeSetId: workbench.manifest.changeSetId }
  })
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

function metadataAfter(draft: JobDraft): JobMetadataAfter {
  return {
    englishName: draft.englishName,
    classGroup: draft.classGroup,
    affiliation: draft.affiliation,
    mainStat: draft.mainStat,
    subStat: draft.subStat,
    primaryWeapons: draft.primaryWeapons,
    secondaryWeapons: draft.secondaryWeapons
  }
}

export async function saveJobDraft(
  options: JobDataOptions,
  request: SaveJobDraftRequest
): Promise<JobDraft> {
  assertContext(options)
  if (
    !isObject(request) ||
    !hasExactFields(request, ['version', 'expectedChangeSetId', 'draft']) ||
    typeof request.expectedChangeSetId !== 'string' ||
    !UUID_PATTERN.test(request.expectedChangeSetId)
  )
    throw new Error('Invalid save job draft request')
  if (request.version !== options.version) throw new Error('Job draft version mismatch')

  const { jobs, weaponTypes } = await loadData(options)
  const requested = validateDraft(request.draft, weaponTypes, { validateStats: true })
  for (const field of ['englishName', 'classGroup', 'affiliation'] as const) {
    if (requested[field].trim().length === 0) throw new Error(`Invalid job draft field: ${field}`)
  }
  const databaseJob = jobs.find(({ jobId }) => jobId === requested.jobId)
  if (!databaseJob) throw new Error('Job draft must reference an existing DB job')
  if (requested.jobName !== databaseJob.jobName)
    throw new Error('Job name is immutable and must match the DB job')
  if (requested.newWeaponTypes.length > 0)
    throw new Error('Saving newWeaponTypes through job metadata is not supported')
  if (requested.advancementJobIds !== undefined)
    throw new Error('Saving advancementJobIds through job metadata is not supported')

  const workbench = await openOrCreateEditWorkbench(workbenchOptions(options))
  if (workbench.manifest.changeSetId !== request.expectedChangeSetId)
    throw new Error('Stale job metadata changeSetId')
  const record = await saveJobMetadataRecord({
    ...workbenchOptions(options),
    changeSetId: request.expectedChangeSetId,
    jobID: requested.jobId,
    expectedRevision: requested.revision,
    after: metadataAfter(requested)
  })
  return metadataDraft(databaseJob, record)
}
