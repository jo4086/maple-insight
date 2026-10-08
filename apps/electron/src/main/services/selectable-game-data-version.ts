export type SelectableGameDataVersionStatus = 'importing' | 'ready' | 'failed'
export type VisibleGameDataVersionStatus = Exclude<SelectableGameDataVersionStatus, 'failed'>

export function isSelectableGameDataVersionStatus(
  status: string
): status is VisibleGameDataVersionStatus {
  return status === 'importing' || status === 'ready'
}
