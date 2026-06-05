export interface EditorCanvasSampleEntity {
  alias: string
  fields: string[]
  height: number
  id: string
  title: string
  width: number
  x: number
  y: number
}

export const editorCanvasSampleEntities: EditorCanvasSampleEntity[] = [
  {
    alias: 'table_desc',
    fields: ['name', 'email', 'created_at'],
    height: 168,
    id: 'entity-1',
    title: 'new_table',
    width: 300,
    x: 4320,
    y: 1080,
  },
  {
    alias: 'sales',
    fields: ['order_id', 'product_id'],
    height: 132,
    id: 'entity-2',
    title: 'order_item',
    width: 240,
    x: 3760,
    y: 1520,
  },
]
