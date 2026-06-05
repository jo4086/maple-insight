import type { Entity } from '../model'
import type { EntityLayout } from '../layout'

export interface EntityTableViewProps {
  entity: Entity
  layout: EntityLayout
  isSelected: boolean
  selectedFieldIds: string[]
}
