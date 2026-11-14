import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import type { JobDraft } from '../../../shared/job-data'
import {
  openOrCreateEditWorkbench,
  readJobMetadataRecords,
  saveJobMetadataRecord
} from '../workbench/edit-workbench'

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
  options: Awaited<ReturnType<typeof createOptions>>,
  workspaceJobs = `${JSON.stringify([{ id: 100, name: 'Swordman' }], null, 2)}\n`
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
          displayName: '배틀메이지',
          stage: 4,
          requiresReview: false
        }
      ]
    })
    expect(groups.has('bishop')).toBe(false)
    expect(groups.get('hero')?.advancements).toEqual([
      { jobId: '0', jobName: 'DB 초보자', displayName: '초보자', stage: 0, requiresReview: false },
      { jobId: '100', jobName: 'DB 검사', displayName: '검사', stage: 1, requiresReview: false },
      {
        jobId: '110',
        jobName: 'DB 파이터',
        displayName: '파이터',
        stage: 2,
        requiresReview: false
      },
      { jobId: '112', jobName: 'Hero DB', displayName: '히어로', stage: 4, requiresReview: false }
    ])
    expect(groups.get('dual-blader')?.advancements.map(({ stage }) => stage)).toEqual([
      0, 1.5, 2, 2.5, 3, 4
    ])
    expect(groups.get('evan')?.advancements.map(({ stage }) => stage)).toEqual([1, 2, 3, 4, 6])
    expect(groups.get('demon-slayer')?.advancements[0]).toMatchObject({
      jobId: '3001',
      jobName: 'Demon beginner DB',
      stage: 0,
      requiresReview: true
    })
    expect(groups.get('demon-avenger')?.advancements[0]).toMatchObject({
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
            displayName: '검사',
            stage: 1,
            requiresReview: false
          },
          {
            jobId: '00112',
            jobName: 'Padded Hero DB',
            displayName: '히어로',
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

  it('preserves recovery source while copied metadata is saved and keeps copy retries idempotent', async () => {
    const options = await createOptions()
    await createReadyValidationWorkspace(options)
    const source = JSON.stringify([draft()])
    const path = await writeRecovery(options, source)
    const request = copyRequest(options, source)

    const copied = await copySelectedJobDraftRecovery(options, request)
    const saved = await saveJobDraft(options, {
      version: options.version,
      expectedChangeSetId: copied.changeSetId,
      draft: draft({ englishName: 'Updated Swordman', revision: 1 })
    })

    expect(copied.record.after.englishName).toBe('Swordman')
    expect(saved).toMatchObject({ englishName: 'Updated Swordman', revision: 2 })
    await expect(readFile(path, 'utf8')).resolves.toBe(source)
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
        if (loadCount === 3) await writeRecovery(options, rotatedSource, rotatedRecoveryId)
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

  it('rejects unknown and exact leading-zero mismatched DB IDs without workbench records', async () => {
    const options = await createOptions()
    await createReadyValidationWorkspace(options)
    const source = JSON.stringify([
      draft(),
      draft({ jobId: '00100', jobName: '앞자리 검사', revision: 2 }),
      draft({ jobId: '99999', jobName: '없는 직업', revision: 3 })
    ])
    const path = await writeRecovery(options, source)

    for (const jobId of ['99999', '00100'])
      await expect(
        copySelectedJobDraftRecovery(options, copyRequest(options, source, { jobId }))
      ).rejects.toThrow('Selected job draft recovery must reference an existing DB job')

    const workbenchRoot = join(
      options.dataRoot,
      '.edit-workbenches',
      options.environment,
      options.version
    )
    const [changeSetId] = await readdir(workbenchRoot)
    expect(await readdir(join(workbenchRoot, changeSetId))).toEqual(['manifest.json'])
    await expect(listJobData(options)).resolves.toMatchObject({ drafts: [] })
    await expect(readFile(path, 'utf8')).resolves.toBe(source)
  })

  it('lists a newly copied record without stale results among many DB jobs', async () => {
    const jobs = [
      { jobId: '100', jobName: '검사' },
      ...Array.from({ length: 400 }, (_, index) => ({
        jobId: String(10000 + index),
        jobName: `직업 ${index}`
      }))
    ]
    const options = await createOptions({
      ...repository,
      findGameJobsByVersion: async () => jobs
    })
    await createReadyValidationWorkspace(options)
    const source = JSON.stringify([draft({ englishName: 'Recovered Swordman' })])
    await writeRecovery(options, source)
    await expect(listJobData(options)).resolves.toMatchObject({ drafts: [] })

    const copied = await copySelectedJobDraftRecovery(options, copyRequest(options, source))

    const snapshot = await listJobData(options)
    expect(snapshot.jobs).toHaveLength(401)
    expect(snapshot).toMatchObject({
      changeSetId: copied.changeSetId,
      drafts: [{ jobId: '100', englishName: 'Recovered Swordman', revision: 1 }]
    })
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

describe('job data workbench editor', () => {
  async function readyEditor(options: Awaited<ReturnType<typeof createOptions>>) {
    await createReadyValidationWorkspace(options)
    const snapshot = await listJobData(options)
    if (snapshot.changeSetId === null) throw new Error('Expected available editor')
    return snapshot
  }

  function saveRequest(
    options: Awaited<ReturnType<typeof createOptions>>,
    changeSetId: string,
    value: JobDraft = draft()
  ) {
    return {
      version: options.version,
      expectedChangeSetId: changeSetId,
      draft: value
    }
  }

  it('reads copied metadata as editor state with immutable DB name', async () => {
    const options = await createOptions()
    await createReadyValidationWorkspace(options)
    const source = JSON.stringify([draft({ jobName: '복구 이름', englishName: 'Recovered' })])
    await writeRecovery(options, source)
    const copied = await copySelectedJobDraftRecovery(options, copyRequest(options, source))

    const snapshot = await listJobData(options)
    expect(snapshot).toMatchObject({
      editorAvailable: true,
      changeSetId: copied.changeSetId,
      drafts: [
        {
          jobId: '100',
          jobName: '검사',
          englishName: 'Recovered',
          newWeaponTypes: [],
          revision: 1
        }
      ]
    })
  })

  it('saves and reopens metadata without writing legacy recovery', async () => {
    const options = await createOptions()
    const snapshot = await readyEditor(options)
    const source = JSON.stringify([draft({ englishName: 'Legacy' })])
    const legacyPath = await writeRecovery(options, source)
    await expect(listJobData(options)).resolves.toMatchObject({ drafts: [] })

    const saved = await saveJobDraft(
      options,
      saveRequest(options, snapshot.changeSetId!, draft({ englishName: 'Workbench' }))
    )
    expect(saved).toMatchObject({ englishName: 'Workbench', revision: 1, jobName: '검사' })
    await expect(listJobData(options)).resolves.toMatchObject({ drafts: [saved] })
    await expect(readFile(legacyPath, 'utf8')).resolves.toBe(source)
  })

  it('rejects blank required metadata without changing history or legacy recovery', async () => {
    const options = await createOptions()
    const snapshot = await readyEditor(options)
    const source = JSON.stringify([draft({ englishName: 'Legacy' })])
    const legacyPath = await writeRecovery(options, source)
    const first = await saveJobDraft(
      options,
      saveRequest(options, snapshot.changeSetId!, draft({ englishName: 'First' }))
    )
    const historyOptions = {
      dataRoot: options.dataRoot,
      environment: options.environment,
      version: options.version,
      creatorLocalId: 'test-operator',
      changeSetId: snapshot.changeSetId!,
      jobID: first.jobId
    }
    const beforeHistory = await readJobMetadataRecords(historyOptions)

    for (const field of ['englishName', 'classGroup', 'affiliation'] as const) {
      await expect(
        saveJobDraft(
          options,
          saveRequest(options, snapshot.changeSetId!, { ...first, [field]: ' \t ' })
        )
      ).rejects.toThrow(`Invalid job draft field: ${field}`)
    }

    await expect(readJobMetadataRecords(historyOptions)).resolves.toEqual(beforeHistory)
    await expect(readFile(legacyPath, 'utf8')).resolves.toBe(source)
  })

  it('rejects stale change sets and revisions while preserving history', async () => {
    const options = await createOptions()
    const firstSnapshot = await readyEditor(options)
    const first = await saveJobDraft(
      options,
      saveRequest(options, firstSnapshot.changeSetId!, draft({ englishName: 'First' }))
    )

    await expect(
      saveJobDraft(
        options,
        saveRequest(options, firstSnapshot.changeSetId!, draft({ englishName: 'Stale revision' }))
      )
    ).rejects.toThrow('Stale job metadata revision')
    await expect(listJobData(options)).resolves.toMatchObject({ drafts: [first] })

    await createReadyValidationWorkspace(options, '[{"id":100,"name":"Changed input"}]\n')
    const secondSnapshot = await listJobData(options)
    expect(secondSnapshot.changeSetId).not.toBe(firstSnapshot.changeSetId)
    await expect(
      saveJobDraft(
        options,
        saveRequest(options, firstSnapshot.changeSetId!, { ...first, revision: 1 })
      )
    ).rejects.toThrow('Stale job metadata changeSetId')
  })

  it('returns DB browse data when workspace is missing or not ready', async () => {
    const missing = await createOptions()
    await expect(listJobData(missing)).resolves.toMatchObject({
      jobs: [{ jobId: '100', jobName: '검사' }],
      drafts: [],
      changeSetId: null,
      editorAvailable: false
    })

    const notReady = await createOptions()
    await createReadyValidationWorkspace(notReady)
    const workspacePath = join(
      notReady.dataRoot,
      '.workspaces',
      notReady.environment,
      notReady.version,
      'workspace.json'
    )
    const workspace = JSON.parse(await readFile(workspacePath, 'utf8'))
    workspace.status = 'review'
    await writeFile(workspacePath, `${JSON.stringify(workspace)}\n`)
    await expect(listJobData(notReady)).resolves.toMatchObject({
      drafts: [],
      changeSetId: null,
      editorAvailable: false
    })
  })

  it('fails closed on corrupt workbench state', async () => {
    const options = await createOptions()
    const snapshot = await readyEditor(options)
    const manifestPath = join(
      options.dataRoot,
      '.edit-workbenches',
      options.environment,
      options.version,
      snapshot.changeSetId!,
      'manifest.json'
    )
    await writeFile(manifestPath, '{}\n')
    await expect(listJobData(options)).rejects.toThrow('Corrupt edit workbench manifest')
  })

  it.each([
    ['jobName', draft({ jobName: '변경 이름' }), 'Job name is immutable'],
    [
      'newWeaponTypes',
      draft({
        primaryWeapons: ['123e4567-e89b-42d3-a456-426614174000'],
        newWeaponTypes: [
          {
            key: '123e4567-e89b-42d3-a456-426614174000',
            category: 'weapon',
            part: '건틀렛',
            englishName: 'Gauntlet',
            classGroupKeys: ['pirate'],
            handType: 'twoHanded',
            weaponConstant: '1.5'
          }
        ]
      }),
      'Saving newWeaponTypes'
    ],
    ['advancementJobIds', draft({ advancementJobIds: ['100'] }), 'Saving advancementJobIds'],
    ['non-DB job', draft({ jobId: '200', jobName: '신규' }), 'existing DB job']
  ])('rejects excluded %s changes', async (_field, value, message) => {
    const options = await createOptions()
    const snapshot = await readyEditor(options)
    await expect(
      saveJobDraft(options, saveRequest(options, snapshot.changeSetId!, value as JobDraft))
    ).rejects.toThrow(message)
  })

  it('validates exact request, metadata fields, stats, and weapon categories', async () => {
    const options = await createOptions()
    const snapshot = await readyEditor(options)
    const valid = saveRequest(options, snapshot.changeSetId!)

    await expect(
      saveJobDraft(options, { version: options.version, draft: draft() } as never)
    ).rejects.toThrow('Invalid save job draft request')
    await expect(saveJobDraft(options, { ...valid, unexpected: true } as never)).rejects.toThrow(
      'Invalid save job draft request'
    )
    await expect(
      saveJobDraft(options, { ...valid, draft: { ...draft(), unexpected: true } as JobDraft })
    ).rejects.toThrow('Invalid job draft fields')
    await expect(
      saveJobDraft(options, saveRequest(options, snapshot.changeSetId!, draft({ mainStat: 'HP' })))
    ).rejects.toThrow('Invalid job draft field: mainStat')
    await expect(
      saveJobDraft(
        options,
        saveRequest(options, snapshot.changeSetId!, draft({ primaryWeapons: ['13'] }))
      )
    ).rejects.toThrow('Primary weapons must reference weapon category keys')
  })
})
