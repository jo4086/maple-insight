import { describe, expect, it } from 'vitest'

import type { JobDraft, JobGroup, NewWeaponType } from '../../../../shared/job-data'
import type { RawDataComparison } from '../../../../shared/raw-data-diff'

import {
  emptyJobDraft,
  emptyJobFilters,
  fallbackJobs,
  filterJobGroups,
  filterJobs,
  isStaleJobDraftError,
  jobDraftForSave,
  jobEditPath,
  jobsWithDrafts,
  mergeSavedDraft,
  newJobsFromComparison,
  olderVersions,
  prefillEnglishName,
  shouldConfirmInlineNavigation,
  validateJobDraft,
  validateNewWeaponType,
  weaponOptionLabel,
  withPersistedRevision
} from './job-model'

const draft: JobDraft = {
  jobId: '0100',
  jobName: '히어로',
  englishName: 'Hero',
  classGroup: '전사',
  affiliation: '모험가',
  mainStat: 'STR',
  subStat: 'DEX',
  primaryWeapons: [],
  secondaryWeapons: [],
  newWeaponTypes: [],
  revision: 1
}

const heroGroup: JobGroup = {
  classKey: 'hero',
  representativeJobId: '112',
  representativeName: '히어로 DB',
  advancements: [
    { jobId: '100', jobName: '검사 DB', stage: 1, requiresReview: false },
    { jobId: '110', jobName: '파이터 DB', stage: 2, requiresReview: false },
    { jobId: '112', jobName: '히어로 DB', stage: 4, requiresReview: false }
  ]
}

describe('job model', () => {
  it('combines multi-select filters and searches ID, Korean name, and English name', () => {
    const jobs = [
      { jobId: '0100', jobName: '히어로' },
      { jobId: '0200', jobName: '아크메이지' },
      { jobId: '0300', jobName: '윈드브레이커' },
      { jobId: '0400', jobName: '카이저' }
    ]
    const drafts = [
      draft,
      {
        ...draft,
        jobId: '0200',
        jobName: '아크메이지',
        englishName: 'Arch Mage',
        classGroup: '마법사'
      },
      {
        ...draft,
        jobId: '0300',
        jobName: '윈드브레이커',
        englishName: 'Wind Breaker',
        classGroup: '궁수',
        affiliation: '시그너스 기사단'
      },
      {
        ...draft,
        jobId: '0400',
        jobName: '카이저',
        englishName: 'Kaiser',
        classGroup: '전사',
        affiliation: '노바'
      }
    ]

    expect(
      filterJobs(jobs, drafts, {
        classGroups: ['전사', '마법사'],
        affiliations: [],
        search: ''
      })
    ).toEqual([jobs[0], jobs[1], jobs[3]])
    expect(
      filterJobs(jobs, drafts, {
        classGroups: ['전사', '마법사'],
        affiliations: ['노바'],
        search: ''
      })
    ).toEqual([jobs[3]])
    expect(filterJobs(jobs, drafts, { ...emptyJobFilters(), search: 'hero' })).toEqual([jobs[0]])
    expect(filterJobs(jobs, drafts, { ...emptyJobFilters(), search: '0200' })).toEqual([jobs[1]])
    expect(filterJobs(jobs, drafts, emptyJobFilters())).toEqual(jobs)
  })

  it('searches grouped jobs by every DB advancement and the representative draft', () => {
    const representativeDraft = {
      ...draft,
      jobId: '112',
      jobName: '복구 초안 이름',
      englishName: 'Hero Draft'
    }

    expect(
      filterJobGroups([heroGroup], [representativeDraft], {
        ...emptyJobFilters(),
        search: '110'
      })
    ).toEqual([heroGroup])
    expect(
      filterJobGroups([heroGroup], [representativeDraft], {
        ...emptyJobFilters(),
        search: '검사 DB'
      })
    ).toEqual([heroGroup])
    expect(
      filterJobGroups([heroGroup], [representativeDraft], {
        ...emptyJobFilters(),
        search: '히어로 DB'
      })
    ).toEqual([heroGroup])
    expect(
      filterJobGroups([heroGroup], [representativeDraft], {
        ...emptyJobFilters(),
        search: 'Hero Draft'
      })
    ).toEqual([heroGroup])
    expect(
      filterJobGroups([heroGroup], [representativeDraft], {
        classGroups: ['마법사'],
        affiliations: [],
        search: '히어로 DB'
      })
    ).toEqual([])
  })

  it('filters DB-backed groups from representative classification and lets drafts override it', () => {
    const xenonGroup: JobGroup = {
      classKey: 'xenon',
      representativeJobId: '3614',
      representativeName: '제논 DB',
      advancements: [{ jobId: '3614', jobName: '제논 DB', stage: 4, requiresReview: false }]
    }

    expect(
      filterJobGroups([heroGroup], [], {
        classGroups: ['마법사', '전사'],
        affiliations: ['노바', '모험가'],
        search: ''
      })
    ).toEqual([heroGroup])
    expect(
      filterJobGroups([heroGroup], [], {
        classGroups: ['마법사'],
        affiliations: ['모험가'],
        search: ''
      })
    ).toEqual([])
    expect(
      filterJobGroups([heroGroup], [], {
        classGroups: ['전사'],
        affiliations: ['노바'],
        search: ''
      })
    ).toEqual([])

    const overriddenHero = {
      ...draft,
      jobId: heroGroup.representativeJobId,
      classGroup: '마법사',
      affiliation: '노바'
    }
    expect(
      filterJobGroups([heroGroup], [overriddenHero], {
        classGroups: ['전사'],
        affiliations: ['모험가'],
        search: ''
      })
    ).toEqual([])
    expect(
      filterJobGroups([heroGroup], [overriddenHero], {
        classGroups: ['마법사'],
        affiliations: ['노바'],
        search: ''
      })
    ).toEqual([heroGroup])

    expect(
      filterJobGroups([xenonGroup], [], {
        classGroups: ['전사', '해적'],
        affiliations: ['레지스탕스'],
        search: ''
      })
    ).toEqual([xenonGroup])
    expect(
      filterJobGroups([xenonGroup], [], {
        classGroups: ['도적'],
        affiliations: ['레지스탕스'],
        search: ''
      })
    ).toEqual([xenonGroup])
  })

  it('normalizes Mikhail affiliation while preserving ordinary group filters', () => {
    const mikhailGroup: JobGroup = {
      classKey: 'mikhail',
      representativeJobId: '5112',
      representativeName: '미하일',
      advancements: [{ jobId: '5112', jobName: '미하일', stage: 4, requiresReview: false }]
    }
    const soulMasterGroup: JobGroup = {
      classKey: 'soul-master',
      representativeJobId: '1112',
      representativeName: '소울마스터',
      advancements: [{ jobId: '1112', jobName: '소울마스터', stage: 4, requiresReview: false }]
    }
    const groups = [mikhailGroup, soulMasterGroup, heroGroup]
    const cygnusFilters = {
      classGroups: ['전사'],
      affiliations: ['시그너스 기사단'],
      search: ''
    }

    expect(filterJobGroups(groups, [], cygnusFilters)).toEqual([mikhailGroup, soulMasterGroup])
    expect(
      filterJobGroups(groups, [], {
        classGroups: ['전사'],
        affiliations: ['모험가'],
        search: ''
      })
    ).toEqual([heroGroup])

    const staleMikhailDraft = {
      ...draft,
      jobId: mikhailGroup.representativeJobId,
      jobName: '미하일',
      englishName: 'Mikhail',
      affiliation: '노바'
    }
    expect(filterJobGroups(groups, [staleMikhailDraft], cygnusFilters)).toEqual([
      mikhailGroup,
      soulMasterGroup
    ])
    expect(
      filterJobGroups(groups, [staleMikhailDraft], {
        ...emptyJobFilters(),
        affiliations: ['노바']
      })
    ).toEqual([])
    expect(
      filterJobGroups(groups, [staleMikhailDraft], {
        ...cygnusFilters,
        search: 'Mikhail'
      })
    ).toEqual([mikhailGroup])
  })

  it('keeps ungrouped DB jobs and nonrepresentative drafts in fallback access', () => {
    expect(
      fallbackJobs(
        [
          ...heroGroup.advancements.map(({ jobId, jobName }) => ({ jobId, jobName })),
          { jobId: '30000', jobName: '미분류 DB' }
        ],
        [heroGroup],
        [
          { ...draft, jobId: '110', jobName: '레거시 파이터 초안' },
          { ...draft, jobId: '99999', jobName: '초안 전용' },
          { ...draft, jobId: '112', jobName: '대표 초안' }
        ]
      )
    ).toEqual([
      { jobId: '30000', jobName: '미분류 DB' },
      { jobId: '110', jobName: '레거시 파이터 초안' },
      { jobId: '99999', jobName: '초안 전용' }
    ])
  })

  it('validates canonical multi-stat values and allows Xenon without a secondary stat', () => {
    expect(
      validateJobDraft({
        ...draft,
        jobId: '3612',
        mainStat: 'STR, DEX, LUK',
        subStat: ''
      })
    ).toEqual([])
    expect(validateJobDraft({ ...draft, mainStat: 'DEX', subStat: 'STR' })).toEqual([])
    expect(validateJobDraft({ ...draft, mainStat: '' })).toContain('주스탯을 입력하세요.')
  })

  it.each([
    ['unknown stat', { mainStat: 'HP' }],
    ['duplicate stat', { mainStat: 'STR, STR' }],
    ['malformed stat', { subStat: 'DEX,,STR' }]
  ])('rejects %s tokens', (_label, overrides) => {
    expect(validateJobDraft({ ...draft, ...overrides })).not.toEqual([])
  })

  it('prefills readable English from known internal class keys only', () => {
    expect(
      emptyJobDraft({ jobId: '212', jobName: '아크메이지' }, 'arch-mage-fire-poison').englishName
    ).toBe('Arch Mage Fire Poison')
    expect(emptyJobDraft({ jobId: '99999', jobName: '미분류' }, 'unknown-class').englishName).toBe(
      ''
    )
    expect(prefillEnglishName('Custom English', 'hero')).toBe('Custom English')
  })

  it('preserves valid leading-zero and system IDs while rejecting invalid IDs', () => {
    expect(validateJobDraft(draft)).toEqual([])
    expect(validateJobDraft({ ...draft, jobId: '800000' })).toEqual([])
    expect(validateJobDraft({ ...draft, jobId: '123456' })).toContain(
      'jobID는 유효한 숫자 문자열이어야 합니다.'
    )
    expect(validateJobDraft({ ...draft, jobId: '../100' })).toContain(
      'jobID는 유효한 숫자 문자열이어야 합니다.'
    )
  })

  it('validates single-class weapons and the energy sword exception', () => {
    const weapon: NewWeaponType = {
      key: '550e8400-e29b-41d4-a716-446655440000',
      category: 'weapon',
      part: '한손검',
      englishName: 'Sword',
      classGroupKeys: ['warrior', 'thief'],
      handType: 'oneHanded',
      weaponConstant: '1.2'
    }
    expect(validateNewWeaponType(weapon, [], [])).toContain(
      '에너지소드를 제외한 무기 직업군은 하나만 선택할 수 있습니다.'
    )
    expect(
      validateNewWeaponType(
        {
          ...weapon,
          key: '650e8400-e29b-41d4-a716-446655440000',
          part: '에너지소드',
          englishName: 'Energy Sword',
          classGroupKeys: ['thief', 'pirate']
        },
        [],
        []
      )
    ).toEqual([])
  })

  it('reads only well-formed added jobs from saved raw comparison', () => {
    const comparison: RawDataComparison = {
      baseVersion: '1.2.420',
      compareVersion: '1.2.421',
      filename: 'ms_job.json',
      inputHash: 'hash',
      add: [
        { jobID: '0100', jobName: '히어로' },
        { jobID: '800000', jobName: '시스템 직업' },
        { jobID: 200, jobName: '잘못된 직업' }
      ],
      modify: [],
      delete: []
    }

    expect(newJobsFromComparison(comparison)).toEqual([{ jobId: '0100', jobName: '히어로' }])
  })

  it('merges only saved revision so newer text survives an autosave response', () => {
    expect(
      mergeSavedDraft({ ...draft, jobName: '최신 입력' }, { ...draft, revision: 2 }).jobName
    ).toBe('최신 입력')
    expect(mergeSavedDraft(draft, { ...draft, revision: 2 }).revision).toBe(2)
  })

  it('uses latest persisted revision without replacing queued field values', () => {
    expect(withPersistedRevision({ ...draft, jobName: '두 번째 입력', revision: 1 }, 2)).toEqual({
      ...draft,
      jobName: '두 번째 입력',
      revision: 2
    })
  })

  it('omits excluded fields from every workbench save payload', () => {
    expect(
      jobDraftForSave(
        {
          ...draft,
          advancementJobIds: ['0100'],
          newWeaponTypes: [
            {
              key: '550e8400-e29b-41d4-a716-446655440000',
              category: 'weapon',
              part: '한손검',
              englishName: 'Sword',
              classGroupKeys: ['warrior'],
              handType: 'oneHanded',
              weaponConstant: '1.2'
            }
          ]
        },
        3
      )
    ).toEqual({ ...draft, newWeaponTypes: [], revision: 3 })
  })

  it('includes saved draft-only jobs once for list and reload', () => {
    expect(
      jobsWithDrafts(
        [{ jobId: '0100', jobName: '히어로' }],
        [draft, { ...draft, jobId: '99999', jobName: '새 직업' }]
      )
    ).toEqual([
      { jobId: '0100', jobName: '히어로' },
      { jobId: '99999', jobName: '새 직업' }
    ])
  })

  it('recognizes stale change-set and revision failures only', () => {
    expect(isStaleJobDraftError(new Error('Stale job metadata changeSetId'))).toBe(true)
    expect(isStaleJobDraftError(new Error('Stale job metadata revision'))).toBe(true)
    expect(isStaleJobDraftError(new Error('Invalid job draft revision'))).toBe(false)
    expect(isStaleJobDraftError(new Error('Mock draft save failure'))).toBe(false)
  })

  it('blocks inline navigation for unsaved changes and active saves', () => {
    expect(shouldConfirmInlineNavigation(true, false)).toBe(true)
    expect(shouldConfirmInlineNavigation(false, true)).toBe(true)
    expect(shouldConfirmInlineNavigation(false, false)).toBe(false)
  })

  it('orders only older versions newest first', () => {
    expect(olderVersions('1.2.421', ['1.2.419', '1.2.422', '1.2.420'])).toEqual([
      '1.2.420',
      '1.2.419'
    ])
  })

  it('shows weapon part instead of storage key', () => {
    expect(
      weaponOptionLabel({
        key: '123',
        category: 'weapon',
        part: '한손검',
        classGroupKeys: ['warrior'],
        handType: 'oneHanded',
        weaponConstant: '1.2'
      })
    ).toBe('한손검')
  })

  it('encodes route IDs', () => {
    expect(jobEditPath('10/20')).toBe('/class/edit/10%2F20')
  })
})
