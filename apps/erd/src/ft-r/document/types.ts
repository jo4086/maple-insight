import type { Entity } from '../entity'
import type { Memo } from '../memo'

export interface ErdDocument {
  id: string
  thumbnail: string | null
  title: string
  updatedAt: string
  entities: Entity[]
  memos: Memo[]
}
