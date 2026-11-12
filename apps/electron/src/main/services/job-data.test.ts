import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import type { JobDraft } from '../../shared/job-data'

import { openOrCreateEditWorkbench, saveJobMetadataRecord } from './edit-workbench'
import {
  copySelectedJobDraftRecovery,
  listJobData,
  previewJobDraftRecovery,
  saveJobDraft
} from './job-data'

const roots: string[] = []
const repository = {
  findGameJobsByVersion: async () => [
    { jobId: '100', jobName: '검사' },
    { jobId: '800000', jobName: '시스템' }
  ],
  findGlobalWeaponTypes: async () => [
    {
      id: 12n,
      category: 'weapon',
      part: '한손검',
      normalizedPart: '한손검',
      classGroupKeys: ['warrior'],
      handType: 'oneHanded',
      weaponConstant: { toString: () => '1.2' }
    },
    {
      id: 13n,
      category: 'subWeapon',
      part: '방패',
      normalizedPart: '방패',
      classGroupKeys: ['warrior'],
      handType: null,
      weaponConstant: null
    }
  ]
}

async function createOptions(repositoryOverride = repository) {
  const dataRoot = await mkdtemp(join(tmpdir(), 'job-data-'))
  roots.push(dataRoot)
  return {
    dataRoot,
    environment: 'production' as const,
    version: '1.2.419',
    repository: repositoryOverride
  }
}

const recoveryId = '123e4567-e89b-42d3-a456-426614174099'
const rotatedRecoveryId = '223e4567-e89b-42d3-a456-426614174099'

function sha256(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex')
}

function draft(overrides: Partial<JobDraft> = {}): JobDraft {
  return {
    jobId: '100',
    jobName: '검사',
    englishName: 'Swordman',
    classGroup: 'warrior',
    affiliation: 'adventurer',
    mainStat: 'STR',
    subStat: 'DEX',
    primaryWeapons: ['12'],
    secondaryWeapons: [],
    newWeaponTypes: [],
    revision: 0,
    ...overrides
  }
}

async function writeRecovery(
  options: Awaited<ReturnType<typeof createOptions>>,
  source: string,
  id = recoveryId
): Promise<string> {
  const root = join(options.dataRoot, '.job-draft-recovery', options.environment, options.version)
  const path = join(root, id, 'drafts.json')
  await mkdir(join(root, id), { recursive: true })
  await writeFile(join(root, 'current.json'), `${JSON.stringify({ recoveryId: id })}\n`)
  await writeFile(path, source)
  return path
}

async function createReadyValidationWorkspace(
  options: Awaited<ReturnType<typeof createOptions>>
): Promise<void> {
  const convertedDirectory = join(options.dataRoot, options.environment, options.version)
  const workspaceDirectory = join(
    options.dataRoot,
    '.workspaces',
    options.environment,
    options.version
  )
  await mkdir(join(workspaceDirectory, 'json'), { recursive: true })
  await mkdir(convertedDirectory, { recursive: true })

  const convertedManifest = `${JSON.stringify({ schemaVersion: 1, files: [{ output: 'json/jobs.json', records: 1 }] }, null, 2)}\n`
  const workspaceJobs = `${JSON.stringify([{ id: 100, name: 'Swordman' }], null, 2)}\n`
  const manifestSha256 = sha256(convertedManifest)
  const files = [
    {
      source: 'json/jobs.json',
      workspace: 'json/jobs.json',
      records: 1,
      sha256: sha256(workspaceJobs)
    }
  ]
  const inputSha256 = sha256(
    JSON.stringify({
      manifestSha256,
      files: files.map(({ workspace, sha256: digest }) => ({ workspace, sha256: digest }))
    })
  )
  await writeFile(join(convertedDirectory, 'manifest.json'), convertedManifest)
  await writeFile(join(workspaceDirectory, 'json/jobs.json'), workspaceJobs)
  await writeFile(
    join(workspaceDirectory, 'workspace.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        version: options.version,
        environment: options.environment,
        status: 'ready',
        input: { manifest: 'manifest.json', manifestSha256, inputSha256 },
        files
      },
      null,
      2
    )}\n`
  )
  await writeFile(
    join(workspaceDirectory, 'validation.json'),
    `${JSON.stringify({
      version: options.version,
      environment: options.environment,
      status: 'ready'
    })}\n`
  )
}

function copyRequest(
  options: Awaited<ReturnType<typeof createOptions>>,
  source: string,
  overrides: Partial<{
    version: string
    recoveryId: string
    sourceSha256: string
    jobId: string
  }> = {}
) {
  return {
    version: options.version,
    recoveryId,
    sourceSha256: sha256(source),
    jobId: '100',
    ...overrides
  }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe('job data grouping', () => {
  it('groups actual DB rows through every classifier match and keeps DB names and IDs', async () => {
    const jobs = [
      { jobId: '0', jobName: 'DB 초보자' },
      { jobId: '100', jobName: 'DB 검사' },
      { jobId: '110', jobName: 'DB 파이터' },
      { jobId: '112', jobName: 'Hero DB' },
      { jobId: '120', jobName: 'DB 페이지' },
      { jobId: '122', jobName: 'Paladin DB' },
      { jobId: '130', jobName: 'DB 스피어맨' },
      { jobId: '132', jobName: 'Dark Knight DB' },
      { jobId: '200', jobName: 'DB 매지션' },
      { jobId: '210', jobName: 'DB 위자드' },
      { jobId: '212', jobName: 'Arch Mage F/P DB' },
      { jobId: '230', jobName: 'DB 클레릭' },
      { jobId: '430', jobName: 'DB 세미듀어러' },
      { jobId: '431', jobName: 'DB 듀어러' },
      { jobId: '432', jobName: 'DB 듀얼마스터' },
      { jobId: '433', jobName: 'DB 슬래셔' },
      { jobId: '434', jobName: 'Dual Blade DB' },
      { jobId: '2200', jobName: 'Evan 1 DB' },
      { jobId: '2211', jobName: 'Evan 2 DB' },
      { jobId: '2214', jobName: 'Evan 3 DB' },
      { jobId: '2217', jobName: 'Evan 4 DB' },
      { jobId: '2220', jobName: 'Evan 6 DB' },
      { jobId: '3001', jobName: 'Demon beginner DB' },
      { jobId: '3112', jobName: 'Demon Slayer DB' },
      { jobId: '3122', jobName: 'Demon Avenger DB' },
      { jobId: '3212', jobName: '최상급 흑마법' },
      { jobId: '7000', jobName: 'Dummy DB' },
      { jobId: '40000', jobName: 'Skill group DB' },
      { jobId: '30000', jobName: 'Unknown DB' }
    ]
    const options = await createOptions({
      ...repository,
      findGameJobsByVersion: async () => jobs
    })

    const snapshot = await listJobData(options)
    const groups = new Map(snapshot.jobGroups.map((group) => [group.classKey, group]))

    expect(groups.get('hero')).toMatchObject({
      representativeJobId: '112',
      representativeName: '히어로'
    })
    expect(groups.get('dark-knight')?.representativeName).toBe('다크나이트')
    expect(groups.get('paladin')?.representativeName).toBe('팔라딘')
    expect(groups.get('arch-mage-fire-poison')?.representativeName).toBe('아크메이지(불,독)')
    expect(groups.get('battle-mage')).toMatchObject({
      representativeJobId: '3212',
      representativeName: '배틀메이지',
      advancements: [
        {
          jobId: '3212',
          jobName: '최상급 흑마법',
          stage: 4,
          requiresReview: false
        }
      ]
    })
    expect(groups.has('bishop')).toBe(false)
    expect(groups.get('hero')?.advancements).toEqual([
      { jobId: '0', jobName: 'DB 초보자', stage: 0, requiresReview: false },
      { jobId: '100', jobName: 'DB 검사', stage: 1, requiresReview: false },
      { jobId: '110', jobName: 'DB 파이터', stage: 2, requiresReview: false },
      { jobId: '112', jobName: 'Hero DB', stage: 4, requiresReview: false }
    ])
    expect(groups.get('dual-blader')?.advancements.map(({ stage }) => stage)).toEqual([
      0, 1.5, 2, 2.5, 3, 4
    ])
    expect(groups.get('evan')?.advancements.map(({ stage }) => stage)).toEqual([1, 2, 3, 4, 6])
    expect(groups.get('demon-slayer')?.advancements[0]).toEqual({
      jobId: '3001',
      jobName: 'Demon beginner DB',
      stage: 0,
      requiresReview: true
    })
    expect(groups.get('demon-avenger')?.advancements[0]).toEqual({
      jobId: '3001',
      jobName: 'Demon beginner DB',
      stage: 0,
      requiresReview: true
    })
    expect(snapshot.jobGroups.flatMap(({ advancements }) => advancements)).not.toContainEqual(
      expect.objectContaining({ stage: 5 })
    )
    expect(snapshot.jobs).toEqual(jobs)
  })

  it('orders groups by taxonomy affiliation, class group, and representative ID', async () => {
    const options = await createOptions({
      ...repository,
      findGameJobsByVersion: async () => [
        { jobId: '3512', jobName: 'Mechanic DB' },
        { jobId: '212', jobName: 'Arch Mage DB' },
        { jobId: '312', jobName: 'Bowmaster DB' },
        { jobId: '3612', jobName: 'Xenon DB' },
        { jobId: '5112', jobName: 'Mikhail DB' },
        { jobId: '122', jobName: 'Paladin DB' },
        { jobId: '3212', jobName: 'Battle Mage DB' },
        { jobId: '2112', jobName: 'Aran DB' },
        { jobId: '112', jobName: 'Hero DB' },
        { jobId: '3712', jobName: 'Blaster DB' },
        { jobId: '3000', jobName: 'Citizen DB' }
      ]
    })

    const snapshot = await listJobData(options)

    expect(snapshot.jobGroups.map(({ classKey }) => classKey)).toEqual([
      'hero',
      'paladin',
      'arch-mage-fire-poison',
      'bow-master',
      'mikhail',
      'aran',
      'blaster',
      'battle-mage',
      'xenon',
      'mechanic'
    ])
    expect(
      snapshot.jobGroups
        .filter(({ advancements }) => advancements.some(({ jobId }) => jobId === '3000'))
        .map(({ classKey }) => classKey)
    ).toEqual(['blaster', 'battle-mage', 'mechanic'])
  })

  it('retains a zero-padded representative ID without synthesizing missing rows', async () => {
    const options = await createOptions({
      ...repository,
      findGameJobsByVersion: async () => [
        { jobId: '00100', jobName: 'Padded Swordman DB' },
        { jobId: '00112', jobName: 'Padded Hero DB' }
      ]
    })

    const snapshot = await listJobData(options)
    expect(snapshot.jobGroups).toEqual([
      {
        classKey: 'hero',
        representativeJobId: '00112',
        representativeName: '히어로',
        advancements: [
          {
            jobId: '00100',
            jobName: 'Padded Swordman DB',
            stage: 1,
            requiresReview: false
          },
          {
            jobId: '00112',
            jobName: 'Padded Hero DB',
            stage: 4,
            requiresReview: false
          }
        ]
      }
    ])

    const colliding = await createOptions({
      ...repository,
      findGameJobsByVersion: async () => [
        { jobId: '100', jobName: '검사' },
        { jobId: '00100', jobName: '별도 DB 검사' },
        { jobId: '112', jobName: '히어로' },
        { jobId: '00112', jobName: '별도 DB 히어로' }
      ]
    })
    const collisionSnapshot = await listJobData(colliding)
    expect(collisionSnapshot.jobGroups).toHaveLength(1)
    expect(collisionSnapshot.jobGroups[0].representativeJobId).toBe('112')
    expect(collisionSnapshot.jobGroups[0].advancements.map(({ jobId }) => jobId)).toEqual([
      '100',
      '112'
    ])
    expect(collisionSnapshot.jobs).toHaveLength(4)
  })
})

describe('job draft recovery preview', () => {
  it('previews multiple drafts with exact provenance and blocks selected candidate weapons', async () => {
    const options = await createOptions()
    const candidate = {
      key: '123e4567-e89b-42d3-a456-426614174010',
      category: 'weapon' as const,
      part: '건틀렛',
      englishName: 'Gauntlet',
      classGroupKeys: ['pirate'],
      handType: 'twoHanded',
      weaponConstant: '1.5'
    }
    const source = ` [\n${JSON.stringify(
      draft({
        jobId: '00100',
        jobName: '원본 검사',
        primaryWeapons: [candidate.key],
        newWeaponTypes: [candidate],
        advancementJobIds: ['00100'],
        revision: 7
      }),
      null,
      2
    )},\n${JSON.stringify(
      draft({
        jobId: '200',
        jobName: '마법사',
        englishName: 'Magician',
        classGroup: 'mage',
        mainStat: 'INT',
        subStat: 'LUK',
        primaryWeapons: ['12'],
        revision: 8
      })
    )}\n] `
    const path = await writeRecovery(options, source)

    await expect(previewJobDraftRecovery(options)).resolves.toEqual({
      recoveryId,
      sourceSha256: createHash('sha256').update(source).digest('hex'),
      drafts: [
        {
          jobId: '00100',
          jobName: '원본 검사',
          revision: 7,
          proposedAfter: {
            englishName: 'Swordman',
            classGroup: 'warrior',
            affiliation: 'adventurer',
            mainStat: 'STR',
            subStat: 'DEX',
            primaryWeapons: [candidate.key],
            secondaryWeapons: []
          },
          excluded: {
            jobName: '원본 검사',
            newWeaponTypes: [candidate],
            advancementJobIds: { present: true, value: ['00100'] }
          },
          blockedForCopy: true,
          blockingNewWeaponTypeKeys: [candidate.key]
        },
        {
          jobId: '200',
          jobName: '마법사',
          revision: 8,
          proposedAfter: {
            englishName: 'Magician',
            classGroup: 'mage',
            affiliation: 'adventurer',
            mainStat: 'INT',
            subStat: 'LUK',
            primaryWeapons: ['12'],
            secondaryWeapons: []
          },
          excluded: {
            jobName: '마법사',
            newWeaponTypes: [],
            advancementJobIds: { present: false, value: null }
          },
          blockedForCopy: false,
          blockingNewWeaponTypeKeys: []
        }
      ]
    })
    await expect(readFile(path, 'utf8')).resolves.toBe(source)
  })

  it('rejects duplicate job IDs while preserving leading-zero distinctions', async () => {
    const duplicateOptions = await createOptions()
    const duplicateSource = JSON.stringify([
      draft({ jobId: '100', revision: 1 }),
      draft({ jobId: '100', revision: 2 })
    ])
    const duplicatePath = await writeRecovery(duplicateOptions, duplicateSource)

    await expect(previewJobDraftRecovery(duplicateOptions)).rejects.toThrow(
      'Duplicate job draft ID: 100'
    )
    await expect(readFile(duplicatePath, 'utf8')).resolves.toBe(duplicateSource)

    const distinctOptions = await createOptions()
    const distinctSource = JSON.stringify([
      draft({ jobId: '00100', revision: 1 }),
      draft({ jobId: '100', revision: 2 })
    ])
    const distinctPath = await writeRecovery(distinctOptions, distinctSource)

    await expect(previewJobDraftRecovery(distinctOptions)).resolves.toMatchObject({
      drafts: [{ jobId: '00100' }, { jobId: '100' }]
    })
    await expect(readFile(distinctPath, 'utf8')).resolves.toBe(distinctSource)
  })

  it('fails closed for unknown or invalid draft fields and malformed locators', async () => {
    const unknownOptions = await createOptions()
    await writeRecovery(unknownOptions, JSON.stringify([{ ...draft(), unexpected: 'not allowed' }]))
    await expect(previewJobDraftRecovery(unknownOptions)).rejects.toThrow(
      'Invalid job draft fields'
    )

    const invalidOptions = await createOptions()
    await writeRecovery(invalidOptions, JSON.stringify([draft({ mainStat: 'HP' })]))
    await expect(previewJobDraftRecovery(invalidOptions)).rejects.toThrow(
      'Invalid job draft field: mainStat'
    )

    const locatorOptions = await createOptions()
    const root = join(
      locatorOptions.dataRoot,
      '.job-draft-recovery',
      locatorOptions.environment,
      locatorOptions.version
    )
    await mkdir(root, { recursive: true })
    await writeFile(join(root, 'current.json'), '{"recoveryId":"../escape"}\n')
    await expect(previewJobDraftRecovery(locatorOptions)).rejects.toThrow(
      'Invalid job draft recovery locator'
    )
  })

  it('returns null provenance without a current recovery and rejects a missing source', async () => {
    const emptyOptions = await createOptions()
    await expect(previewJobDraftRecovery(emptyOptions)).resolves.toEqual({
      recoveryId: null,
      sourceSha256: null,
      drafts: []
    })

    const missingOptions = await createOptions()
    const root = join(
      missingOptions.dataRoot,
      '.job-draft-recovery',
      missingOptions.environment,
      missingOptions.version
    )
    await mkdir(root, { recursive: true })
    await writeFile(join(root, 'current.json'), `${JSON.stringify({ recoveryId })}\n`)
    await expect(previewJobDraftRecovery(missingOptions)).rejects.toThrow(
      'Job draft recovery source is missing'
    )
  })

  it('fails closed when source changes between reads or uses a symbolic link', async () => {
    let changingPath = ''
    const changedSource = JSON.stringify([draft({ revision: 2 })])
    const changingOptions = await createOptions({
      ...repository,
      findGameJobsByVersion: async () => {
        await writeFile(changingPath, changedSource)
        return repository.findGameJobsByVersion()
      }
    })
    changingPath = await writeRecovery(changingOptions, JSON.stringify([draft({ revision: 1 })]))
    await expect(previewJobDraftRecovery(changingOptions)).rejects.toThrow(
      'Job draft recovery source changed while reading'
    )

    const linkedOptions = await createOptions()
    const outside = await mkdtemp(join(tmpdir(), 'job-data-preview-outside-'))
    roots.push(outside)
    const outsidePath = join(outside, 'drafts.json')
    await writeFile(outsidePath, JSON.stringify([draft()]))
    const path = await writeRecovery(linkedOptions, JSON.stringify([draft()]))
    await rm(path)
    await symlink(outsidePath, path)
    await expect(previewJobDraftRecovery(linkedOptions)).rejects.toThrow(
      'Symbolic links are not allowed'
    )
  })
})

describe('selected job draft recovery copy', () => {
  it('copies one validated job with source, target, and excluded provenance', async () => {
    const options = await createOptions()
    await createReadyValidationWorkspace(options)
    const excludedCandidate = {
      key: '123e4567-e89b-42d3-a456-426614174010',
      category: 'weapon' as const,
      part: '건틀렛',
      englishName: 'Gauntlet',
      classGroupKeys: ['pirate'],
      handType: 'twoHanded',
      weaponConstant: '1.5'
    }
    const source = JSON.stringify([
      draft({
        jobName: '원본 검사',
        newWeaponTypes: [excludedCandidate],
        advancementJobIds: ['100'],
        revision: 4
      })
    ])
    const path = await writeRecovery(options, source)
    const locatorPath = join(
      options.dataRoot,
      '.job-draft-recovery',
      options.environment,
      options.version,
      'current.json'
    )
    const beforeSource = await readFile(path)
    const beforeLocator = await readFile(locatorPath)

    const copied = await copySelectedJobDraftRecovery(options, copyRequest(options, source))

    expect(copied.changeSetId).toMatch(/^[0-9a-f-]{36}$/)
    expect(copied.record).toMatchObject({
      rawIdentity: { jobID: '100' },
      after: {
        englishName: 'Swordman',
        primaryWeapons: ['12'],
        secondaryWeapons: []
      },
      revision: 1,
      recoveryCopy: {
        source: {
          environment: options.environment,
          version: options.version,
          recoveryId,
          sourceSha256: sha256(source),
          jobId: '100',
          revision: 4
        },
        excluded: {
          jobName: '원본 검사',
          newWeaponTypes: [excludedCandidate],
          advancementJobIds: { present: true, value: ['100'] }
        },
        target: {
          validationWorkspaceManifestSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
          rawInputSha256: expect.stringMatching(/^[a-f0-9]{64}$/)
        }
      }
    })
    expect(await readFile(path)).toEqual(beforeSource)
    expect(await readFile(locatorPath)).toEqual(beforeLocator)
  })

  it('serializes recovery copy with concurrent draft saves and keeps retries idempotent', async () => {
    let releaseCopyLoad!: () => void
    let markCopyLoadStarted!: () => void
    let markSaveLoadStarted!: () => void
    const copyLoadHeld = new Promise<void>((resolve) => {
      releaseCopyLoad = resolve
    })
    const copyLoadStarted = new Promise<void>((resolve) => {
      markCopyLoadStarted = resolve
    })
    const saveLoadStarted = new Promise<void>((resolve) => {
      markSaveLoadStarted = resolve
    })
    let loadCount = 0
    const options = await createOptions({
      ...repository,
      findGameJobsByVersion: async () => {
        loadCount += 1
        if (loadCount === 1) {
          markCopyLoadStarted()
          await copyLoadHeld
        } else if (loadCount === 2) markSaveLoadStarted()
        return repository.findGameJobsByVersion()
      }
    })
    await createReadyValidationWorkspace(options)
    const source = JSON.stringify([draft()])
    const path = await writeRecovery(options, source)
    const request = copyRequest(options, source)

    const copying = copySelectedJobDraftRecovery(options, request)
    await copyLoadStarted
    const saving = saveJobDraft(options, {
      version: options.version,
      draft: draft({ englishName: 'Updated Swordman' })
    })
    await saveLoadStarted
    await new Promise<void>((resolve) => setImmediate(resolve))
    await expect(readFile(path, 'utf8')).resolves.toBe(source)

    releaseCopyLoad()
    const [copied, saved] = await Promise.all([copying, saving])

    expect(copied.record.after.englishName).toBe('Swordman')
    expect(copied.record.recoveryCopy?.source).toMatchObject({
      sourceSha256: sha256(source),
      revision: 0
    })
    expect(saved).toMatchObject({ englishName: 'Updated Swordman', revision: 1 })
    await expect(copySelectedJobDraftRecovery(options, request)).resolves.toEqual(copied)
  })

  it('rejects a rotated recovery before first revision publication', async () => {
    let options!: Awaited<ReturnType<typeof createOptions>>
    let loadCount = 0
    const rotatedSource = JSON.stringify([draft({ jobId: '200', revision: 8 })])
    options = await createOptions({
      ...repository,
      findGameJobsByVersion: async () => {
        loadCount += 1
        if (loadCount === 2) await writeRecovery(options, rotatedSource, rotatedRecoveryId)
        return repository.findGameJobsByVersion()
      }
    })
    await createReadyValidationWorkspace(options)
    const source = JSON.stringify([draft({ revision: 4 })])
    const path = await writeRecovery(options, source)
    const request = copyRequest(options, source)
    const requestSnapshot = structuredClone(request)

    await expect(copySelectedJobDraftRecovery(options, request)).rejects.toThrow(
      'Job draft recovery source changed while reading'
    )

    expect(request).toEqual(requestSnapshot)
    expect(await readFile(path, 'utf8')).toBe(source)
    const rotatedPath = join(
      options.dataRoot,
      '.job-draft-recovery',
      options.environment,
      options.version,
      rotatedRecoveryId,
      'drafts.json'
    )
    expect(await readFile(rotatedPath, 'utf8')).toBe(rotatedSource)
    const workbenchRoot = join(
      options.dataRoot,
      '.edit-workbenches',
      options.environment,
      options.version
    )
    const [changeSetId] = await readdir(workbenchRoot)
    expect(await readdir(join(workbenchRoot, changeSetId))).toEqual(['manifest.json'])
  })

  it('rejects malformed, extra, mismatched version, SHA, and recovery ID requests', async () => {
    const options = await createOptions()
    await createReadyValidationWorkspace(options)
    const source = JSON.stringify([draft()])
    const path = await writeRecovery(options, source)
    const original = await readFile(path)
    const valid = copyRequest(options, source)

    for (const request of [
      { ...valid, extra: true },
      { recoveryId, sourceSha256: valid.sourceSha256, jobId: '100' },
      { ...valid, jobId: 'abc' },
      { ...valid, sourceSha256: 'bad' },
      { ...valid, recoveryId: 'bad' },
      { ...valid, version: '1.2.420' }
    ])
      await expect(copySelectedJobDraftRecovery(options, request as typeof valid)).rejects.toThrow()

    await expect(
      copySelectedJobDraftRecovery(options, {
        ...valid,
        sourceSha256: 'a'.repeat(64)
      })
    ).rejects.toThrow('Job draft recovery source does not match request')
    await expect(
      copySelectedJobDraftRecovery(options, {
        ...valid,
        recoveryId: rotatedRecoveryId
      })
    ).rejects.toThrow('Job draft recovery source does not match request')
    expect(await readFile(path)).toEqual(original)
  })

  it('blocks selected jobs that reference excluded new weapon types', async () => {
    const options = await createOptions()
    await createReadyValidationWorkspace(options)
    const candidate = {
      key: '123e4567-e89b-42d3-a456-426614174010',
      category: 'weapon' as const,
      part: '건틀렛',
      englishName: 'Gauntlet',
      classGroupKeys: ['pirate'],
      handType: 'twoHanded',
      weaponConstant: '1.5'
    }
    const source = JSON.stringify([
      draft({ primaryWeapons: [candidate.key], newWeaponTypes: [candidate] })
    ])
    const path = await writeRecovery(options, source)

    await expect(
      copySelectedJobDraftRecovery(options, copyRequest(options, source))
    ).rejects.toThrow('Selected job draft recovery references a new weapon type')
    expect(await readFile(path, 'utf8')).toBe(source)
  })

  it('rejects unknown IDs and preserves a selected leading-zero ID', async () => {
    const options = await createOptions()
    await createReadyValidationWorkspace(options)
    const source = JSON.stringify([
      draft(),
      draft({ jobId: '00100', jobName: '앞자리 검사', revision: 2 })
    ])
    await writeRecovery(options, source)

    await expect(
      copySelectedJobDraftRecovery(options, copyRequest(options, source, { jobId: '99999' }))
    ).rejects.toThrow('Selected job draft recovery was not found')
    const copied = await copySelectedJobDraftRecovery(
      options,
      copyRequest(options, source, { jobId: '00100' })
    )
    expect(copied.record.rawIdentity.jobID).toBe('00100')
    expect(copied.record.recoveryCopy?.source.jobId).toBe('00100')
  })

  it('returns the persisted first record before reading a rotated source', async () => {
    const options = await createOptions()
    await createReadyValidationWorkspace(options)
    const source = JSON.stringify([draft({ revision: 3 })])
    await writeRecovery(options, source)
    const request = copyRequest(options, source)
    const first = await copySelectedJobDraftRecovery(options, request)
    const rotatedSource = JSON.stringify([draft({ jobId: '200', revision: 8 })])
    await writeRecovery(options, rotatedSource, rotatedRecoveryId)

    const retried = await copySelectedJobDraftRecovery(options, request)

    expect(retried).toEqual(first)
    const revisionDirectory = join(
      options.dataRoot,
      '.edit-workbenches',
      options.environment,
      options.version,
      first.changeSetId,
      'records/job-metadata',
      first.record.recordId
    )
    expect(await readdir(revisionDirectory)).toEqual(['000001.json'])
  })

  it('rejects an existing target record from another source', async () => {
    const options = await createOptions()
    await createReadyValidationWorkspace(options)
    const source = JSON.stringify([draft()])
    await writeRecovery(options, source)
    const workbench = await openOrCreateEditWorkbench({
      dataRoot: options.dataRoot,
      environment: options.environment,
      version: options.version,
      creatorLocalId: 'test-operator'
    })
    await saveJobMetadataRecord({
      dataRoot: options.dataRoot,
      environment: options.environment,
      version: options.version,
      creatorLocalId: 'test-operator',
      changeSetId: workbench.manifest.changeSetId,
      jobID: '100',
      expectedRevision: 0,
      after: {
        englishName: 'Existing',
        classGroup: 'warrior',
        affiliation: 'adventurer',
        mainStat: 'STR',
        subStat: 'DEX',
        primaryWeapons: ['12'],
        secondaryWeapons: []
      }
    })

    await expect(
      copySelectedJobDraftRecovery(options, copyRequest(options, source))
    ).rejects.toThrow('Job draft recovery target already exists')
  })

  it('fails explicitly without a ready validation workspace and preserves source', async () => {
    const options = await createOptions()
    const source = JSON.stringify([draft()])
    const path = await writeRecovery(options, source)

    await expect(
      copySelectedJobDraftRecovery(options, copyRequest(options, source))
    ).rejects.toThrow()
    expect(await readFile(path, 'utf8')).toBe(source)
  })
})

describe('job data drafts', () => {
  it('canonicalizes valid stats at save boundary', async () => {
    const xenonOptions = await createOptions()
    await expect(
      saveJobDraft(xenonOptions, {
        version: xenonOptions.version,
        draft: draft({ jobId: '3612', mainStat: 'STR,DEX,LUK', subStat: '' })
      })
    ).resolves.toMatchObject({ mainStat: 'STR, DEX, LUK', subStat: '' })

    const dexOptions = await createOptions()
    await expect(
      saveJobDraft(dexOptions, {
        version: dexOptions.version,
        draft: draft({ mainStat: 'DEX', subStat: 'STR' })
      })
    ).resolves.toMatchObject({ mainStat: 'DEX', subStat: 'STR' })
  })

  it.each([
    ['unknown stat', { mainStat: 'HP' }],
    ['duplicate stat', { mainStat: 'STR, STR' }],
    ['malformed stat', { subStat: 'DEX,,STR' }]
  ])('rejects %s at save boundary', async (_label, overrides) => {
    const options = await createOptions()
    await expect(
      saveJobDraft(options, {
        version: options.version,
        draft: draft(overrides)
      })
    ).rejects.toThrow('Invalid job draft field')
  })

  it('reads legacy stat values without rewriting them', async () => {
    const options = await createOptions()
    const recoveryId = '123e4567-e89b-42d3-a456-426614174099'
    const root = join(options.dataRoot, '.job-draft-recovery', options.environment, options.version)
    const draftPath = join(root, recoveryId, 'drafts.json')
    const legacyContent = `${JSON.stringify([draft({ mainStat: 'HP', subStat: 'MP' })])}\n`
    await mkdir(join(root, recoveryId), { recursive: true })
    await writeFile(join(root, 'current.json'), `${JSON.stringify({ recoveryId })}\n`)
    await writeFile(draftPath, legacyContent)

    await expect(listJobData(options)).resolves.toMatchObject({
      drafts: [{ mainStat: 'HP', subStat: 'MP' }]
    })
    await expect(readFile(draftPath, 'utf8')).resolves.toBe(legacyContent)
  })

  it('saves atomically and reopens a version-isolated draft', async () => {
    const options = await createOptions()
    const saved = await saveJobDraft(options, { version: options.version, draft: draft() })

    expect(saved.revision).toBe(1)
    const recoveryEntries = await readdir(
      join(options.dataRoot, '.job-draft-recovery', 'production', options.version),
      { withFileTypes: true }
    )
    expect(
      recoveryEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
    ).toEqual([
      expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      )
    ])
    await expect(listJobData(options)).resolves.toEqual({
      jobs: [{ jobId: '100', jobName: '검사' }],
      jobGroups: [],
      weaponTypes: [
        {
          key: '12',
          category: 'weapon',
          part: '한손검',
          classGroupKeys: ['warrior'],
          handType: 'oneHanded',
          weaponConstant: '1.2'
        },
        {
          key: '13',
          category: 'subWeapon',
          part: '방패',
          classGroupKeys: ['warrior'],
          handType: null,
          weaponConstant: null
        }
      ],
      drafts: [saved]
    })
    await expect(listJobData({ ...options, version: '1.2.420' })).resolves.toMatchObject({
      drafts: []
    })
  })

  it('loads and saves legacy drafts without adding advancement linkage', async () => {
    const options = await createOptions()
    const saved = await saveJobDraft(options, { version: options.version, draft: draft() })

    expect(saved).not.toHaveProperty('advancementJobIds')
    const snapshot = await listJobData(options)
    expect(snapshot.drafts[0]).not.toHaveProperty('advancementJobIds')
  })

  it('accepts one exact canonical group and rejects cross-branch or missing representatives', async () => {
    const options = await createOptions({
      ...repository,
      findGameJobsByVersion: async () => [
        { jobId: '0', jobName: '초보자' },
        { jobId: '100', jobName: '검사' },
        { jobId: '110', jobName: '파이터' },
        { jobId: '112', jobName: '히어로' },
        { jobId: '120', jobName: '페이지' },
        { jobId: '122', jobName: '팔라딘' }
      ]
    })
    await expect(
      saveJobDraft(options, {
        version: options.version,
        draft: draft({ jobId: '112', advancementJobIds: ['0', '100', '110', '112'] })
      })
    ).resolves.toMatchObject({ advancementJobIds: ['0', '100', '110', '112'] })

    await expect(
      saveJobDraft(options, {
        version: options.version,
        draft: draft({ jobId: '112', advancementJobIds: ['100', '110'] })
      })
    ).rejects.toThrow('must include the owning job')
    await expect(
      saveJobDraft(options, {
        version: options.version,
        draft: draft({ jobId: '112', advancementJobIds: ['100', '112', '122'] })
      })
    ).rejects.toThrow('one canonical job group')
  })

  it('allows only own linkage for nonrepresentative and unknown drafts', async () => {
    const options = await createOptions()
    await expect(
      saveJobDraft(options, {
        version: options.version,
        draft: draft({ jobId: '30000', advancementJobIds: ['30000'] })
      })
    ).resolves.toMatchObject({ advancementJobIds: ['30000'] })

    for (const advancementJobIds of [
      [],
      ['100', '112'],
      ['100', '100'],
      ['7000'],
      ['40000'],
      ['123456'],
      ['abc'],
      Array.from({ length: 21 }, (_, index) => String(index + 1))
    ]) {
      await expect(
        saveJobDraft(options, {
          version: options.version,
          draft: draft({ advancementJobIds })
        })
      ).rejects.toThrow()
    }
  })

  it('rejects invalid fields, system IDs, unknown weapon keys, and duplicate new types', async () => {
    const options = await createOptions()
    await expect(
      saveJobDraft(options, {
        version: options.version,
        draft: { ...draft(), unexpected: true } as JobDraft
      })
    ).rejects.toThrow('Invalid job draft fields')
    await expect(
      saveJobDraft(options, { version: options.version, draft: draft({ jobId: '800000' }) })
    ).rejects.toThrow('System job drafts are excluded')
    await expect(
      saveJobDraft(options, {
        version: options.version,
        draft: draft({ primaryWeapons: ['missing'] })
      })
    ).rejects.toThrow('Primary weapons must reference weapon category keys')

    const type = {
      key: '123e4567-e89b-12d3-a456-426614174000',
      category: 'subWeapon' as const,
      part: '방패',
      englishName: 'Shield',
      classGroupKeys: ['warrior'],
      handType: null,
      weaponConstant: null
    }
    await expect(
      saveJobDraft(options, {
        version: options.version,
        draft: draft({
          newWeaponTypes: [type, { ...type, key: '123e4567-e89b-12d3-a456-426614174001' }]
        })
      })
    ).rejects.toThrow('New weapon types must be unique')
  })

  it('enforces weapon categories and DB catalog boundaries', async () => {
    const options = await createOptions()
    await expect(
      saveJobDraft(options, {
        version: options.version,
        draft: draft({ primaryWeapons: ['13'] })
      })
    ).rejects.toThrow('Primary weapons must reference weapon category keys')
    await expect(
      saveJobDraft(options, {
        version: options.version,
        draft: draft({ secondaryWeapons: ['12'] })
      })
    ).rejects.toThrow('Secondary weapons must reference subWeapon category keys')

    const primary = {
      key: '123e4567-e89b-42d3-a456-426614174000',
      category: 'weapon' as const,
      part: '에너지 소드',
      englishName: 'Energy Sword',
      classGroupKeys: ['thief', 'pirate'],
      handType: 'twoHanded',
      weaponConstant: '1.3125'
    }
    await expect(
      saveJobDraft(options, {
        version: options.version,
        draft: draft({ primaryWeapons: [primary.key], newWeaponTypes: [primary] })
      })
    ).resolves.toMatchObject({ revision: 1 })

    for (const invalid of [
      { ...primary, key: '123e4567-e89b-42d3-a456-426614174001', classGroupKeys: ['thief'] },
      {
        ...primary,
        key: '123e4567-e89b-42d3-a456-426614174002',
        part: '건틀렛',
        englishName: 'Gauntlet',
        classGroupKeys: ['mage', 'pirate']
      },
      {
        ...primary,
        key: '123e4567-e89b-42d3-a456-426614174003',
        part: '건틀렛',
        englishName: 'Gauntlet',
        classGroupKeys: ['invalid']
      },
      {
        ...primary,
        key: '123e4567-e89b-42d3-a456-426614174004',
        part: '건틀렛',
        englishName: 'Gauntlet',
        handType: null
      },
      {
        ...primary,
        key: '123e4567-e89b-42d3-a456-426614174005',
        part: '건틀렛',
        englishName: 'Gauntlet',
        weaponConstant: '0'
      },
      {
        ...primary,
        key: '123e4567-e89b-42d3-a456-426614174006',
        part: '건틀렛',
        englishName: 'Gauntlet',
        weaponConstant: '10000'
      },
      {
        ...primary,
        key: '123e4567-e89b-42d3-a456-426614174007',
        part: '건틀렛',
        englishName: 'Gauntlet',
        weaponConstant: '1.00001'
      }
    ]) {
      await expect(
        saveJobDraft(options, {
          version: options.version,
          draft: draft({ primaryWeapons: [invalid.key], newWeaponTypes: [invalid] })
        })
      ).rejects.toThrow()
    }

    const secondary = {
      key: '123e4567-e89b-42d3-a456-426614174008',
      category: 'subWeapon' as const,
      part: '마도서',
      englishName: 'Spellbook',
      classGroupKeys: ['mage'],
      handType: 'oneHanded',
      weaponConstant: null
    }
    await expect(
      saveJobDraft(options, {
        version: options.version,
        draft: draft({ secondaryWeapons: [secondary.key], newWeaponTypes: [secondary] })
      })
    ).rejects.toThrow('Secondary weapon handType and weaponConstant must be null')
  })

  it('rejects normalized-space catalog duplicates', async () => {
    const options = await createOptions()
    const duplicate = {
      key: '123e4567-e89b-42d3-a456-426614174009',
      category: 'weapon' as const,
      part: '한 손 검',
      englishName: 'One-handed Sword',
      classGroupKeys: ['warrior'],
      handType: 'oneHanded',
      weaponConstant: '1.2'
    }
    await expect(
      saveJobDraft(options, {
        version: options.version,
        draft: draft({ primaryWeapons: [duplicate.key], newWeaponTypes: [duplicate] })
      })
    ).rejects.toThrow('conflicts with the global catalog')
  })

  it('rejects normalized-space candidate duplicates across job drafts', async () => {
    const options = await createOptions()
    const firstCandidate = {
      key: '123e4567-e89b-42d3-a456-426614174010',
      category: 'weapon' as const,
      part: '건 틀렛',
      englishName: 'Gauntlet',
      classGroupKeys: ['pirate'],
      handType: 'twoHanded',
      weaponConstant: '1.5'
    }
    await saveJobDraft(options, {
      version: options.version,
      draft: draft({
        jobId: '200',
        jobName: '신규 A',
        primaryWeapons: [firstCandidate.key],
        newWeaponTypes: [firstCandidate]
      })
    })

    const duplicateCandidate = {
      ...firstCandidate,
      key: '123e4567-e89b-42d3-a456-426614174011',
      part: '건틀렛'
    }
    await expect(
      saveJobDraft(options, {
        version: options.version,
        draft: draft({
          jobId: '201',
          jobName: '신규 B',
          primaryWeapons: [duplicateCandidate.key],
          newWeaponTypes: [duplicateCandidate]
        })
      })
    ).rejects.toThrow('New weapon type conflicts with another job draft: weapon/건틀렛')
  })

  it('keeps a draft visible when its candidate later appears in the catalog', async () => {
    let catalogChanged = false
    const changingRepository = {
      ...repository,
      findGlobalWeaponTypes: async () => [
        ...(await repository.findGlobalWeaponTypes()),
        ...(catalogChanged
          ? [
              {
                id: 14n,
                category: 'weapon',
                part: '건틀렛',
                normalizedPart: '건틀렛',
                classGroupKeys: ['pirate'],
                handType: 'twoHanded',
                weaponConstant: { toString: () => '1.5' }
              }
            ]
          : [])
      ]
    }
    const options = await createOptions(changingRepository)
    const candidate = {
      key: '123e4567-e89b-42d3-a456-426614174012',
      category: 'weapon' as const,
      part: '건틀렛',
      englishName: 'Gauntlet',
      classGroupKeys: ['pirate'],
      handType: 'twoHanded',
      weaponConstant: '1.5'
    }
    const saved = await saveJobDraft(options, {
      version: options.version,
      draft: draft({ primaryWeapons: [candidate.key], newWeaponTypes: [candidate] })
    })

    catalogChanged = true
    await expect(listJobData(options)).resolves.toMatchObject({ drafts: [saved] })
    await expect(saveJobDraft(options, { version: options.version, draft: saved })).rejects.toThrow(
      'New weapon type conflicts with the global catalog'
    )
  })

  it('allows new valid job IDs and blocks ID mutation from overwriting another draft', async () => {
    const options = await createOptions()
    const first = await saveJobDraft(options, {
      version: options.version,
      draft: draft({ jobId: '200', jobName: '신규 A' })
    })
    const second = await saveJobDraft(options, {
      version: options.version,
      draft: draft({ jobId: '201', jobName: '신규 B' })
    })
    expect([first.revision, second.revision]).toEqual([1, 2])

    await expect(
      saveJobDraft(options, {
        version: options.version,
        draft: { ...first, jobId: second.jobId, jobName: '덮어쓰기' }
      })
    ).rejects.toThrow('revision conflict')
  })

  it('rejects stale revisions and symbolic-link storage', async () => {
    const options = await createOptions()
    await saveJobDraft(options, { version: options.version, draft: draft() })
    await expect(
      saveJobDraft(options, { version: options.version, draft: draft() })
    ).rejects.toThrow('revision conflict')

    const linkedOptions = await createOptions()
    const outside = await mkdtemp(join(tmpdir(), 'job-data-outside-'))
    roots.push(outside)
    await mkdir(join(linkedOptions.dataRoot, '.job-draft-recovery'), { recursive: true })
    await symlink(outside, join(linkedOptions.dataRoot, '.job-draft-recovery', 'production'))
    await expect(listJobData(linkedOptions)).rejects.toThrow('Symbolic links are not allowed')
  })
})
