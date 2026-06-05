import type { EditorState } from './types'

export const initialEditorState: EditorState = {
  toolMode: 'select',
  selection: {
    entityId: null,
    fieldIds: [],
  },
  editing: {
    entityId: null,
    fieldId: null,
    columnKey: null,
  },
}
