import { describe, expect, it } from 'vitest'

import type { JobDraft, NewWeaponType } from '../../../../shared/job-data'
import type { RawDataComparison } from '../../../../shared/raw-data-diff'

import {
  emptyJobFilters,
  filterJobs,
  jobEditPath,
  jobsWithDrafts,
  mergeSavedDraft,
  newJobsFromComparison,
  olderVersions,
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
