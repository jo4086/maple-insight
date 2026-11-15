import type { JobGroup } from '../../../../shared/job-data'

export function stages(group: JobGroup): string[] {
  const numericStages = [
    ...new Set([...group.advancements.map(({ stage }) => String(stage)), '5', '6'])
  ].sort((a, b) => Number(a) - Number(b))
  const fifthIndex = numericStages.indexOf('5')
  numericStages.splice(fifthIndex, 0, 'hyper')
  return numericStages
}

export function stageLabel(stage: string): string {
  if (stage === 'hyper') return '하이퍼'
  return stage === '0' ? '0차' : `${stage}차`
}
