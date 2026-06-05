import type { Entity } from '../model'
import type { EntityLayout } from './types'
import {
  ENTITY_CELL_HORIZONTAL_PADDING,
  ENTITY_HEADER_HEIGHT,
  ENTITY_MIN_PORT_OFFSET,
  ENTITY_MIN_WIDTH,
  ENTITY_ROW_HEIGHT,
  ENTITY_TEXT_CHAR_WIDTH,
} from './constants'

const COLUMN_HEADERS = [
  'key',
  'name',
  'pname',
  'domain',
  'type',
  'null',
  'default',
  'comment',
] as const

const GRID_UNIT = 6
const BORDER_WIDTH = 1

function snapToGrid(value: number): number {
  return Math.ceil(value / GRID_UNIT) * GRID_UNIT
}

function measureTextWidth(value: string): number {
  return value.length * ENTITY_TEXT_CHAR_WIDTH
}

function getKeyLabel(entity: Entity, field: Entity['fields'][number]): string {
  const isPk = entity.keys.pks.some((pkField) => pkField._id === field._id)
  const isFk = entity.keys.fks.some((fkField) => fkField._id === field._id)

  if (field.isUnique && isPk) {
    return 'PK, UQ'
  }

  if (isPk) {
    return 'PK'
  }

  if (isFk) {
    return field.relType === 'one' || field.relType === 'one_only' ? 'IFK' : 'FK'
  }

  if (field.isUnique) {
    return 'UQ'
  }

  return '-'
}

function getDomainLabel(field: Entity['fields'][number]): string {
  return field.domain || '-'
}

function getTypeLabel(field: Entity['fields'][number]): string {
  return field.type || '-'
}

function getNullLabel(field: Entity['fields'][number]): string {
  return field.isAllowNull ? 'Y' : 'N'
}

function getDefaultLabel(field: Entity['fields'][number]): string {
  return field.defaultValue || '-'
}

function getCommentLabel(field: Entity['fields'][number]): string {
  return field.comment || '-'
}

function getColumnValue(field: Entity['fields'][number], columnKey: typeof COLUMN_HEADERS[number]): string {
  switch (columnKey) {
    case 'key':
      return '-'
    case 'name':
      return field.name || '-'
    case 'pname':
      return field.pName || '-'
    case 'domain':
      return getDomainLabel(field)
    case 'type':
      return getTypeLabel(field)
    case 'null':
      return getNullLabel(field)
    case 'default':
      return getDefaultLabel(field)
    case 'comment':
      return getCommentLabel(field)
  }
}

function getColumnWidth(entity: Entity, columnKey: typeof COLUMN_HEADERS[number]): number {
  const headerWidth = measureTextWidth(columnKey.toUpperCase())
  const contentWidth = entity.fields.reduce((maxWidth, field) => {
    const value =
      columnKey === 'key'
        ? getKeyLabel(entity, field)
        : getColumnValue(field, columnKey)

    return Math.max(maxWidth, measureTextWidth(value))
  }, 0)

  return snapToGrid(
    Math.max(headerWidth, contentWidth) + ENTITY_CELL_HORIZONTAL_PADDING * 2,
  )
}

function getTableWidth(entity: Entity): number {
  const metaWidth =
    measureTextWidth(entity.name || '-') +
    measureTextWidth(entity.pName || '-') +
    ENTITY_CELL_HORIZONTAL_PADDING * 4

  const columnsWidth = COLUMN_HEADERS.reduce((totalWidth, columnKey) => {
    return totalWidth + getColumnWidth(entity, columnKey)
  }, 0)

  return snapToGrid(Math.max(ENTITY_MIN_WIDTH, metaWidth, columnsWidth))
}

function getTableHeight(entity: Entity): number {
  const bodyHeight = entity.fields.length * ENTITY_ROW_HEIGHT
  return snapToGrid(ENTITY_HEADER_HEIGHT + bodyHeight)
}

function getPortsForAxis(length: number): number[] {
  const ports: number[] = []

  for (let offset = ENTITY_MIN_PORT_OFFSET; offset < length; offset += GRID_UNIT) {
    ports.push(offset)
  }

  if (ports.length === 0) {
    ports.push(ENTITY_MIN_PORT_OFFSET)
  }

  return ports
}

export function computeEntityLayout(entity: Entity): EntityLayout {
  const width = getTableWidth(entity)
  const height = getTableHeight(entity)
  const rowStartY = ENTITY_HEADER_HEIGHT

  const rows = entity.fields.map((field, index) => ({
    fieldId: field._id,
    x: 0,
    y: rowStartY + index * ENTITY_ROW_HEIGHT,
    width,
    height: ENTITY_ROW_HEIGHT - BORDER_WIDTH,
  }))

  const topBottomOffsets = getPortsForAxis(width - GRID_UNIT)
  const leftRightOffsets = getPortsForAxis(height - GRID_UNIT)

  const ports = [
    ...topBottomOffsets.map((offset) => ({ side: 'top' as const, offset })),
    ...topBottomOffsets.map((offset) => ({ side: 'bottom' as const, offset })),
    ...leftRightOffsets.map((offset) => ({ side: 'left' as const, offset })),
    ...leftRightOffsets.map((offset) => ({ side: 'right' as const, offset })),
  ]

  return {
    x: entity.position.x,
    y: entity.position.y,
    width,
    height,
    headerHeight: ENTITY_HEADER_HEIGHT,
    rowHeight: ENTITY_ROW_HEIGHT,
    rows,
    ports,
  }
}
