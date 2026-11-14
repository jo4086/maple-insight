export type SelectableGameDataVersionStatus =
  'importing' | 'ready' | 'failed' | 'copying' | 'deleted'
export type VisibleGameDataVersionStatus = 'importing' | 'ready'

export function isSelectableGameDataVersionStatus(
  status: string
): status is VisibleGameDataVersionStatus {
  return status === 'importing' || status === 'ready'
}
