import { mkdir, mkdtemp, readdir, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import type { JobDraft } from '../../shared/job-data'

import { listJobData, saveJobDraft } from './job-data'

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

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe('job data drafts', () => {
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
