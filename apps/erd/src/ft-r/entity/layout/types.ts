import type { Rect } from '../../shared'

export interface EntityPort {
  side: 'top' | 'right' | 'bottom' | 'left'
  offset: number
}

export interface EntityRowLayout extends Rect {
  fieldId: string
}

export interface EntityLayout extends Rect {
  headerHeight: number
  rowHeight: number
  rows: EntityRowLayout[]
  ports: EntityPort[]
}
