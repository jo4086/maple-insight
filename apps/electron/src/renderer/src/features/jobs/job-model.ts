import type {
  JobDraft,
  JobSummary,
  NewWeaponType,
  WeaponTypeOption
} from '../../../../shared/job-data'
import type { RawDataComparison, RawDataRecord } from '../../../../shared/raw-data-diff'

export type JobFilters = {
  classGroups: string[]
  affiliations: string[]
  search: string
}

export const emptyJobFilters = (): JobFilters => ({
  classGroups: [],
  affiliations: [],
  search: ''
})

export type NewJobNotice = {
  baseVersion: string
  jobs: JobSummary[]
}

export const weaponClassGroups = [
  { key: 'warrior', label: '전사' },
  { key: 'mage', label: '마법사' },
  { key: 'archer', label: '궁수' },
  { key: 'thief', label: '도적' },
  { key: 'pirate', label: '해적' }
] as const

export function mergeSavedDraft(current: JobDraft, saved: JobDraft): JobDraft {
  return { ...current, revision: saved.revision }
}

export function withPersistedRevision(draft: JobDraft, revision: number): JobDraft {
  return { ...draft, revision }
}

export function jobsWithDrafts(jobs: JobSummary[], drafts: JobDraft[]): JobSummary[] {
  const byId = new Map(jobs.map((job) => [job.jobId, job]))
  for (const draft of drafts) {
    if (!byId.has(draft.jobId))
      byId.set(draft.jobId, { jobId: draft.jobId, jobName: draft.jobName })
  }
  return [...byId.values()]
}

export function jobDraftChanged(before: JobDraft, after: JobDraft): boolean {
  return JSON.stringify(before) !== JSON.stringify(after)
}

export function shouldConfirmInlineNavigation(changed: boolean, saving: boolean): boolean {
  return changed || saving
}

export function weaponOptionLabel(option: WeaponTypeOption): string {
  return option.part || option.key
}

export function olderVersions(current: string, versions: string[]): string[] {
  return versions
    .filter(
      (version) =>
        version !== current && version.localeCompare(current, undefined, { numeric: true }) < 0
    )
    .sort((left, right) => right.localeCompare(left, undefined, { numeric: true }))
}

export const emptyJobDraft = (job: JobSummary): JobDraft => ({
  jobId: job.jobId,
  jobName: job.jobName,
  englishName: '',
  classGroup: '',
  affiliation: '',
  mainStat: '',
  subStat: '',
  primaryWeapons: [],
  secondaryWeapons: [],
  newWeaponTypes: [],
  revision: 0
})

export function filterJobs(
  jobs: JobSummary[],
  drafts: JobDraft[],
  filters: JobFilters
): JobSummary[] {
  const draftsById = new Map(drafts.map((draft) => [draft.jobId, draft]))
  const query = filters.search.trim().toLocaleLowerCase()

  return jobs.filter((job) => {
    const draft = draftsById.get(job.jobId)
    const matchesSearch =
      !query ||
      job.jobId.toLocaleLowerCase().includes(query) ||
      job.jobName.toLocaleLowerCase().includes(query) ||
      draft?.englishName.toLocaleLowerCase().includes(query)
    const matchesClass =
      filters.classGroups.length === 0 ||
      (draft ? filters.classGroups.includes(draft.classGroup) : false)
    const matchesAffiliation =
      filters.affiliations.length === 0 ||
      (draft ? filters.affiliations.includes(draft.affiliation) : false)
    return Boolean(matchesSearch && matchesClass && matchesAffiliation)
  })
}

export function validateJobDraft(draft: JobDraft): string[] {
  const errors: string[] = []
  const numericId = /^\d+$/.test(draft.jobId)
  const userId = /^\d{1,5}$/.test(draft.jobId)
  const systemId = numericId && Number(draft.jobId) >= 800000

  if (!numericId || (!userId && !systemId)) errors.push('jobID는 유효한 숫자 문자열이어야 합니다.')
  if (!draft.jobName.trim()) errors.push('직업 이름을 입력하세요.')
  if (!draft.englishName.trim()) errors.push('영문 이름을 입력하세요.')
  if (!draft.classGroup.trim()) errors.push('직업군을 선택하세요.')
  if (!draft.affiliation.trim()) errors.push('소속을 선택하세요.')
  if (!draft.mainStat.trim()) errors.push('주스탯을 입력하세요.')
  if (!draft.subStat.trim()) errors.push('부스탯을 입력하세요.')
  return errors
}

export function validateNewWeaponType(
  weapon: NewWeaponType,
  existing: WeaponTypeOption[],
  staged: NewWeaponType[]
): string[] {
  const errors: string[] = []
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(weapon.key)) {
    errors.push('무기 키 생성에 실패했습니다.')
  }
  if ([...existing, ...staged].some((option) => option.key === weapon.key)) {
    errors.push('이미 사용 중인 무기 키입니다.')
  }
  if (!weapon.part.trim()) errors.push('부위를 입력하세요.')
  if (!weapon.englishName.trim()) errors.push('영문 이름을 입력하세요.')
  if (weapon.classGroupKeys.length === 0) errors.push('직업군을 선택하세요.')
  const isEnergySword = /energy[- ]?sword|에너지\s*소드/i.test(
    `${weapon.part} ${weapon.englishName}`
  )
  if (!isEnergySword && weapon.classGroupKeys.length > 1) {
    errors.push('에너지소드를 제외한 무기 직업군은 하나만 선택할 수 있습니다.')
  }
  if (
    isEnergySword &&
    (weapon.classGroupKeys.length !== 2 ||
      !weapon.classGroupKeys.includes('thief') ||
      !weapon.classGroupKeys.includes('pirate'))
  ) {
    errors.push('에너지소드는 도적과 해적 직업군을 함께 선택해야 합니다.')
  }
  if (weapon.category === 'weapon' && !weapon.handType) errors.push('한손/두손을 선택하세요.')
  if (weapon.category === 'weapon' && !weapon.weaponConstant?.trim()) {
    errors.push('무기 상수를 입력하세요.')
  }
  return errors
}

function rawJob(record: RawDataRecord): JobSummary | null {
  const jobId = record.jobID
  const jobName = record.jobName
  return typeof jobId === 'string' && /^\d{1,5}$/.test(jobId) && typeof jobName === 'string'
    ? { jobId, jobName }
    : null
}

export function newJobsFromComparison(comparison: RawDataComparison | null): JobSummary[] {
  if (!comparison || comparison.filename !== 'ms_job.json') return []
  return comparison.add.flatMap((record) => {
    const job = rawJob(record)
    return job ? [job] : []
  })
}

export function jobEditPath(jobId: string): string {
  return `/class/edit/${encodeURIComponent(jobId)}`
}

export function decodeJobId(value: string | undefined): string {
  if (!value) return ''
  try {
    return decodeURIComponent(value)
  } catch {
    return ''
  }
}
