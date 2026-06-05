export type EditorToolMode =
  | 'select'
  | 'pan'
  | 'add-table'
  | 'add-memo'
  | 'add-relation'

export interface EntitySelectionState {
  entityId: string | null
  fieldIds: string[]
}

export interface EntityEditingState {
  entityId: string | null
  fieldId: string | null
  columnKey: string | null
}

export interface EditorState {
  toolMode: EditorToolMode
  selection: EntitySelectionState
  editing: EntityEditingState
}
