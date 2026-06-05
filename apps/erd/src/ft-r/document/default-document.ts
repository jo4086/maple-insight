import { DEFAULT_DOCUMENT_TITLE } from './constants'
import type { ErdDocument } from './types'

export const createDefaultDocument = (): ErdDocument => ({
  id: '',
  thumbnail: null,
  title: DEFAULT_DOCUMENT_TITLE,
  updatedAt: '',
  entities: [],
  memos: [],
})

export const defaultDocument: ErdDocument = createDefaultDocument()
