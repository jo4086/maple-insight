import type { ErdColumn, ErdEntity } from '@/features/erd';

const SLOT_FONT = '500 11px ui-sans-serif, system-ui, sans-serif';

function estimateWidthPx(value: string, minWidth: number) {
  const canvas = window.document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) return minWidth;

  context.font = SLOT_FONT;
  const measured = Math.ceil(context.measureText(value).width) + 28;
  return Math.max(minWidth, measured);
}

export function getColumnSlotWidths(columns: ErdColumn[], isUniqueVisible = false) {
  return {
    key: Math.max(56, ...columns.map((column) => estimateWidthPx((column.keyType ?? '-').toUpperCase(), 56))),
    name: Math.max(88, ...columns.map((column) => estimateWidthPx(column.name || 'name', 88))),
    pName: Math.max(72, ...columns.map((column) => estimateWidthPx(column.pName || '별칭', 72))),
    type: Math.max(112, ...columns.map((column) => estimateWidthPx(column.type || 'VARCHAR(255)', 112))),
    null: 52,
    unique: isUniqueVisible ? 64 : 0,
    defaultValue: Math.max(88, ...columns.map((column) => estimateWidthPx(column.defaultValue || 'default', 88))),
    comment: Math.max(88, ...columns.map((column) => estimateWidthPx(column.comment || 'comment', 88))),
  };
}

export function getColumnTemplate(slotWidths: ReturnType<typeof getColumnSlotWidths>, isUniqueVisible = false) {
  return `${slotWidths.key}px ${slotWidths.name}px ${slotWidths.pName}px ${slotWidths.type}px ${slotWidths.null}px ${isUniqueVisible ? `${slotWidths.unique}px ` : ''}${slotWidths.defaultValue}px ${slotWidths.comment}px`;
}

export function estimateEntitySize(entity: ErdEntity) {
  const slotWidths = getColumnSlotWidths(entity.columns, entity.isUniqueColumnVisible);
  const rowWidth = slotWidths.key + slotWidths.name + slotWidths.pName + slotWidths.type + slotWidths.null + slotWidths.unique + slotWidths.defaultValue + slotWidths.comment;
  const headerWidth = Math.max(rowWidth, 260);
  const width = headerWidth + 24;
  const rowHeight = 36;
  const headerHeight = 74;
  const bodyPadding = 14;
  const rowGap = Math.max(0, entity.columns.length - 1);
  const height = headerHeight + bodyPadding + entity.columns.length * rowHeight + rowGap;

  return { width, height };
}
