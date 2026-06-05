import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdDragIndicator, MdOutlineKey, MdPalette, MdTune } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { FaPlus } from 'react-icons/fa';

import type { ErdColumn, ErdEntity } from '@/features/erd';
import { ColumnPropertiesModal } from './ColumnPropertiesModal';
import { getColumnSlotWidths, getColumnTemplate } from '../../utils/entity-metrics';

type EntityCardProps = {
  entity: ErdEntity;
  isDragging: boolean;
  isSelected: boolean;
  onColumnChange: <K extends keyof ErdColumn>(columnId: string, field: K, value: ErdColumn[K]) => void;
  onDragStart: (event: React.PointerEvent<HTMLElement>) => void;
  onEntityFieldChange: (field: 'name' | 'comment' | 'isUniqueColumnVisible', value: string | boolean) => void;
  onMoveToTop: () => void;
  onSelect: (append: boolean) => void;
  onAddNormalColumn: () => void;
  onAddPrimaryColumn: () => void;
  onMoveColumn: (fromColumnId: string, toColumnId: string) => void;
  onOpenPalette: () => void;
  onOpenProperties: () => void;
  onRemoveEntity: () => void;
  onRemoveColumn: (columnId: string) => void;
  onResize: (entityId: string, width: number, height: number) => void;
};

type RowDragState = {
  columnId: string;
  height: number;
  pointerId: number;
  startLeft: number;
  startTop: number;
  startClientY: number;
  currentClientY: number;
  width: number;
};

const BORDER_TICK_SPACING = 12;
const BORDER_TICK_LENGTH = 2;

const EntityCard = ({
  entity,
  isDragging,
  isSelected,
  onColumnChange,
  onDragStart,
  onEntityFieldChange,
  onMoveToTop,
  onSelect,
  onAddNormalColumn,
  onAddPrimaryColumn,
  onMoveColumn,
  onOpenPalette,
  onOpenProperties,
  onRemoveEntity,
  onRemoveColumn,
  onResize,
}: EntityCardProps) => {
  const articleRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragHoverColumnIdRef = useRef<string | null>(null);
  const [contentMinSize, setContentMinSize] = useState({ width: 0, height: 0 });
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [rowDragState, setRowDragState] = useState<RowDragState | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ columnId: string; field: keyof ErdColumn } | null>(null);
  const [isColumnPropertiesOpen, setIsColumnPropertiesOpen] = useState(false);
  const slotWidths = useMemo(() => getColumnSlotWidths(entity.columns, entity.isUniqueColumnVisible), [entity.columns, entity.isUniqueColumnVisible]);
  const columnTemplate = useMemo(() => getColumnTemplate(slotWidths, entity.isUniqueColumnVisible), [entity.isUniqueColumnVisible, slotWidths]);
  const rowWidth = slotWidths.key + slotWidths.name + slotWidths.pName + slotWidths.type + slotWidths.null + slotWidths.unique + slotWidths.defaultValue + slotWidths.comment;
  const headerWidth = Math.max(rowWidth, 260);

  useEffect(() => {
    const content = contentRef.current;

    if (!content) return;

    const measure = () => {
      const childWidths = Array.from(content.querySelectorAll('[data-entity-row="true"]')).map((child) => (child as HTMLElement).scrollWidth);
      const widestChild = childWidths.length > 0 ? Math.max(...childWidths) : 0;

      setContentMinSize({
        width: Math.max(headerWidth + 24, widestChild + 16),
        height: content.scrollHeight,
      });
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(content);

    return () => observer.disconnect();
  }, [entity.columns, entity.comment, entity.name, headerWidth]);

  useEffect(() => {
    if (!isSelected) {
      setSelectedColumnId(null);
      setEditingCell(null);
      setDraggedColumnId(null);
      setDragOverColumnId(null);
      setRowDragState(null);
      dragHoverColumnIdRef.current = null;
    }
  }, [isSelected]);

  useEffect(() => {
    if (!rowDragState) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== rowDragState.pointerId) return;

      setRowDragState((current) => (current ? { ...current, currentClientY: event.clientY } : current));

      const nextColumnId =
        entity.columns.find((column) => {
          if (column.id === rowDragState.columnId) return false;

          const row = rowRefs.current[column.id];
          if (!row) return false;

          const rect = row.getBoundingClientRect();
          const midpoint = rect.top + rect.height / 2;

          return event.clientY >= midpoint - 4 && event.clientY <= rect.bottom + 4;
        })?.id ?? null;

      if (!nextColumnId || nextColumnId === rowDragState.columnId) {
        dragHoverColumnIdRef.current = null;
        setDragOverColumnId(null);
        return;
      }

      setDragOverColumnId(nextColumnId);

      if (dragHoverColumnIdRef.current === nextColumnId) return;

      dragHoverColumnIdRef.current = nextColumnId;
      onMoveColumn(rowDragState.columnId, nextColumnId);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerId !== rowDragState.pointerId) return;

      setDraggedColumnId(null);
      setDragOverColumnId(null);
      setRowDragState(null);
      dragHoverColumnIdRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [entity.columns, onMoveColumn, rowDragState]);

  const activeColumn = entity.columns.find((column) => column.id === selectedColumnId) ?? null;
  const draggedColumn = entity.columns.find((column) => column.id === rowDragState?.columnId) ?? null;

  return (
    <>
      <article
        ref={articleRef}
        className={`absolute border-0 outline-2 bg-white shadow-sm transition-shadow ${isSelected ? 'outline-sky-500 ring-3 ring-sky-300' : 'outline-transparent'} ${isDragging ? 'shadow-xl' : 'shadow-sm'}`}
        style={{
          left: entity.position.x,
          top: entity.position.y,
          width: contentMinSize.width,
          height: contentMinSize.height,
          overflow: 'visible',
        }}
        onPointerDown={(event) => {
          const target = event.target as HTMLElement;
          const isInteractive = !!target.closest('input,select,button,label,textarea');
          const isRowArea = !!target.closest('[data-column-row="true"]');

          onSelect(event.shiftKey);
          onMoveToTop();

          if (!isSelected) return;
          if (isInteractive || isRowArea) return;
          if (event.shiftKey) return;

          onDragStart(event);
        }}
        onMouseUp={() => {
          if (!articleRef.current) return;
          onResize(entity.id, contentMinSize.width, contentMinSize.height);
        }}
      >
        <BorderTicks height={contentMinSize.height} width={contentMinSize.width} />
        {isSelected ? (
          <div className="absolute -top-9.5 right-0 z-10 flex items-center gap-1 border border-slate-200 bg-white px-1.5 py-1 shadow-sm">
            <button
              className="flex h-6 min-w-6 items-center justify-center rounded-sm border border-slate-300 bg-white px-1 text-slate-700 hover:bg-slate-100"
              onClick={(event) => {
                event.stopPropagation();
                onOpenProperties();
              }}
              type="button"
            >
              <MdTune size="1.15em" />
            </button>
            <button
              className="flex h-6 min-w-6 items-center justify-center rounded-sm border border-slate-300 bg-white px-1 text-slate-700 hover:bg-slate-100"
              onClick={(event) => {
                event.stopPropagation();
                onOpenPalette();
              }}
              type="button"
            >
              <MdPalette size="1.15em" />
            </button>
            <button
              className="flex h-6 min-w-6 items-center justify-center rounded-sm border border-rose-200 bg-rose-100/30 px-1 text-[10px] font-semibold text-rose-600 hover:bg-rose-100/70"
              onClick={(event) => {
                event.stopPropagation();
                onRemoveEntity();
              }}
              type="button"
            >
              <RiDeleteBin6Line size="1.5em" />
            </button>
            <button
              className="flex h-6 min-w-6 items-center justify-center rounded-sm border border-amber-200 bg-amber-100/30 px-1 text-[10px] font-semibold text-amber-500 hover:bg-amber-100/70"
              onClick={(event) => {
                event.stopPropagation();
                onAddPrimaryColumn();
              }}
              type="button"
            >
              <FaPlus size="1.5em" />
            </button>
            <button
              className="flex h-6 min-w-6 items-center justify-center rounded-sm border border-slate-300 bg-slate-100/30 px-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-100/70"
              onClick={(event) => {
                event.stopPropagation();
                onAddNormalColumn();
              }}
              type="button"
            >
              <FaPlus size="1.5em" />
            </button>
          </div>
        ) : null}
        <div ref={contentRef} className="overflow-visible bg-slate-800">
          <div className="border-slate-200 justify-self-center px-1 py-[3px] text-white" style={{ backgroundColor: entity.color }}>
            <div
              className="justify-self-center grid w-full min-w-full items-center gap-4 p-1"
              style={{ minWidth: `${headerWidth}px`, gridTemplateColumns: 'minmax(max-content,1fr) max-content' }}
            >
              <AutoFitInput
                className="border-transparent bg-transparent text-sm font-semibold text-black placeholder:text-slate-500"
                minWidthPx={88}
                placeholder="table_name"
                value={entity.name}
                onChange={(value) => onEntityFieldChange('name', value)}
              />
              <AutoFitInput
                className="justify-self-end border-transparent bg-transparent text-[11px] text-slate-300 placeholder:text-slate-500 text-right"
                minWidthPx={100}
                placeholder="table_desc"
                value={entity.comment}
                onChange={(value) => onEntityFieldChange('comment', value)}
              />
            </div>
            <div
              className="mt-1 grid w-max items-center bg-slate-600/30 p-[1px] text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400"
              style={{ minWidth: `${rowWidth}px`, gridTemplateColumns: columnTemplate, columnGap: '2px' }}
            >
              <HeaderCell width={slotWidths.key} label="key" />
              <HeaderCell width={slotWidths.name} label="name" />
              <HeaderCell width={slotWidths.pName} label="pName" />
              <HeaderCell width={slotWidths.type} label="type" />
              <HeaderCell width={slotWidths.null} label="null" center />
              {entity.isUniqueColumnVisible ? <HeaderCell width={slotWidths.unique} label="unique" center /> : null}
              <HeaderCell width={slotWidths.defaultValue} label="default" />
              <HeaderCell width={slotWidths.comment} label="comment" />
            </div>
          </div>

          <div className="grid justify-self-center gap-[1px] bg-slate-400 px-2 py-[3px]">
            {entity.columns.map((column) => (
              <ColumnEditor
                key={column.id}
                column={column}
                columnTemplate={columnTemplate}
                editingField={editingCell?.columnId === column.id ? editingCell.field : null}
                isEntitySelected={isSelected}
                isDragging={draggedColumnId === column.id}
                isDropTarget={dragOverColumnId === column.id && draggedColumnId !== column.id}
                isSelected={selectedColumnId === column.id}
                isUniqueVisible={entity.isUniqueColumnVisible}
                slotWidths={slotWidths}
                onDragEnd={() => {
                  setDraggedColumnId(null);
                  setDragOverColumnId(null);
                  setRowDragState(null);
                  dragHoverColumnIdRef.current = null;
                }}
                onDragStart={(event) => {
                  setDraggedColumnId(column.id);
                  setSelectedColumnId(column.id);
                  setDragOverColumnId(null);
                  setRowDragState({
                    columnId: column.id,
                    height: rowRefs.current[column.id]?.getBoundingClientRect().height ?? 32,
                    pointerId: event.pointerId,
                    startLeft: rowRefs.current[column.id]?.getBoundingClientRect().left ?? 0,
                    startTop: rowRefs.current[column.id]?.getBoundingClientRect().top ?? 0,
                    startClientY: event.clientY,
                    currentClientY: event.clientY,
                    width: rowRefs.current[column.id]?.getBoundingClientRect().width ?? rowWidth,
                  });
                  dragHoverColumnIdRef.current = null;
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onChange={(field, value) => onColumnChange(column.id, field, value)}
                onDragOverRow={() => {
                  if (!draggedColumnId || draggedColumnId === column.id) return;
                  setDragOverColumnId(column.id);
                }}
                onDropRow={() => {
                  if (!draggedColumnId || draggedColumnId === column.id) return;
                  onMoveColumn(draggedColumnId, column.id);
                  setDraggedColumnId(null);
                  setDragOverColumnId(null);
                }}
                onOpenProperties={() => {
                  setSelectedColumnId(column.id);
                  setIsColumnPropertiesOpen(true);
                }}
                onRequestEntitySelect={() => {
                  onSelect(false);
                  onMoveToTop();
                }}
                onRemove={() => onRemoveColumn(column.id)}
                onRegisterRowRef={(node) => {
                  rowRefs.current[column.id] = node;
                }}
                onSelect={() => {
                  setSelectedColumnId(column.id);
                  setEditingCell(null);
                }}
                onStartEdit={(field) => {
                  setSelectedColumnId(column.id);
                  setEditingCell({ columnId: column.id, field });
                }}
              />
            ))}
          </div>
        </div>
      </article>
      <ColumnPropertiesModal
        column={activeColumn}
        isOpen={isColumnPropertiesOpen}
        onChange={(field, value) => {
          if (!activeColumn) return;
          onColumnChange(activeColumn.id, field, value);
        }}
        onClose={() => setIsColumnPropertiesOpen(false)}
      />
      {rowDragState && draggedColumn
        ? createPortal(
            <DragPreviewRow
              column={draggedColumn}
              columnTemplate={columnTemplate}
              left={rowDragState.startLeft}
              offsetY={rowDragState.currentClientY - rowDragState.startClientY}
              slotWidths={slotWidths}
              top={rowDragState.startTop}
              width={rowDragState.width}
              isUniqueVisible={entity.isUniqueColumnVisible}
            />,
            document.body,
          )
        : null}
    </>
  );
};

function BorderTicks({ height, width }: { height: number; width: number }) {
  const horizontalTicks = buildTickPositions(width);
  const verticalTicks = buildTickPositions(height);

  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      {horizontalTicks.map((x) => (
        <div key={`top-${x}`} className="absolute bg-sky-500" style={{ left: x, top: -BORDER_TICK_LENGTH, width: 1, height: BORDER_TICK_LENGTH }} />
      ))}
      {horizontalTicks.map((x) => (
        <div key={`bottom-${x}`} className="absolute bg-sky-500" style={{ left: x, bottom: -BORDER_TICK_LENGTH, width: 1, height: BORDER_TICK_LENGTH }} />
      ))}
      {verticalTicks.map((y) => (
        <div key={`left-${y}`} className="absolute bg-sky-500" style={{ left: -BORDER_TICK_LENGTH, top: y, width: BORDER_TICK_LENGTH, height: 1 }} />
      ))}
      {verticalTicks.map((y) => (
        <div key={`right-${y}`} className="absolute bg-sky-500" style={{ right: -BORDER_TICK_LENGTH, top: y, width: BORDER_TICK_LENGTH, height: 1 }} />
      ))}
    </div>
  );
}

function buildTickPositions(length: number) {
  const positions: number[] = [];

  for (let value = BORDER_TICK_SPACING; value < length - BORDER_TICK_SPACING; value += BORDER_TICK_SPACING) {
    positions.push(value);
  }

  return positions;
}

type ColumnEditorProps = {
  column: ErdColumn;
  columnTemplate: string;
  editingField: keyof ErdColumn | null;
  isEntitySelected: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  isSelected: boolean;
  isUniqueVisible: boolean;
  slotWidths: ReturnType<typeof getColumnSlotWidths>;
  onDragEnd: () => void;
  onDragStart: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onDragOverRow: () => void;
  onChange: <K extends keyof ErdColumn>(field: K, value: ErdColumn[K]) => void;
  onDropRow: () => void;
  onOpenProperties: () => void;
  onRequestEntitySelect: () => void;
  onRegisterRowRef: (node: HTMLDivElement | null) => void;
  onRemove: () => void;
  onSelect: () => void;
  onStartEdit: (field: keyof ErdColumn) => void;
};

function ColumnEditor({
  column,
  columnTemplate,
  editingField,
  isEntitySelected,
  isDragging,
  isDropTarget,
  isSelected,
  isUniqueVisible,
  slotWidths,
  // onDragEnd,
  onDragStart,
  onDragOverRow,
  onChange,
  onDropRow,
  onOpenProperties,
  onRequestEntitySelect,
  onRegisterRowRef,
  onRemove,
  onSelect,
  onStartEdit,
}: ColumnEditorProps) {
  return (
    <div className="relative w-max">
      {isSelected ? (
        <button
          className="absolute -left-9 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-sm border border-slate-300 bg-white text-slate-500 shadow-md hover:bg-slate-100 hover:text-slate-700"
          onPointerDown={(event) => {
            event.stopPropagation();
            event.preventDefault();
            onDragStart(event);
          }}
          type="button"
        >
          <MdDragIndicator size="1.05em" />
        </button>
      ) : null}
      {isSelected ? (
        <div className="absolute -right-[4.4rem] top-1/2 z-20 flex -translate-y-1/2 items-center gap-1">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-300 bg-white text-slate-500 shadow-md hover:bg-slate-100 hover:text-slate-700"
            onClick={(event) => {
              event.stopPropagation();
              onOpenProperties();
            }}
            type="button"
          >
            <MdTune size="0.95em" />
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-sm border border-rose-200 bg-white text-slate-500 shadow-md hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            type="button"
          >
            <RiDeleteBin6Line size="0.95em" />
          </button>
        </div>
      ) : null}
      <div
        ref={onRegisterRowRef}
        className={`grid w-max items-center bg-slate-400 p-[0px] transition ${isDragging ? 'opacity-0' : ''} ${isSelected ? 'ring-1 ring-amber-400' : ''} ${isDropTarget ? 'ring-2 ring-sky-300' : ''}`}
        data-entity-row="true"
        data-column-row-id={column.id}
        style={{
          gridTemplateColumns: columnTemplate,
          columnGap: '2px',
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onDragOverRow();
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onDropRow();
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
          if (!isEntitySelected) {
            onRequestEntitySelect();
            return;
          }
          onSelect();
        }}
      >
        <div className="flex h-full items-center">
          <div className={`flex h-full w-full items-center justify-center border px-2 text-slate-700 ${isSelected ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-white'}`}>
            <KeyTypeIndicator column={column} />
          </div>
        </div>
        <div className="flex h-full items-center">
          <AutoFitInput
            className={isSelected ? 'border-amber-400 bg-amber-50' : ''}
            fixedWidthPx={slotWidths.name}
            isEntitySelected={isEntitySelected}
            isEditing={editingField === 'name'}
            isRowSelected={isSelected}
            minWidthPx={slotWidths.name}
            placeholder="name"
            value={column.name}
            onRequestEntitySelect={onRequestEntitySelect}
            onRequestRowSelect={onSelect}
            onActivate={() => isEntitySelected && isSelected && onStartEdit('name')}
            onChange={(value) => onChange('name', value)}
          />
        </div>
        <div className="flex h-full items-center">
          <AutoFitInput
            className={isSelected ? 'border-amber-400 bg-amber-50' : ''}
            fixedWidthPx={slotWidths.pName}
            isEntitySelected={isEntitySelected}
            isEditing={editingField === 'pName'}
            isRowSelected={isSelected}
            minWidthPx={slotWidths.pName}
            placeholder="별칭"
            value={column.pName}
            onRequestEntitySelect={onRequestEntitySelect}
            onRequestRowSelect={onSelect}
            onActivate={() => isEntitySelected && isSelected && onStartEdit('pName')}
            onChange={(value) => onChange('pName', value)}
          />
        </div>
        <div className="flex h-full items-center">
          <AutoFitInput
            className={isSelected ? 'border-amber-400 bg-amber-50' : ''}
            fixedWidthPx={slotWidths.type}
            isEntitySelected={isEntitySelected}
            isEditing={editingField === 'type'}
            isRowSelected={isSelected}
            minWidthPx={slotWidths.type}
            placeholder="VARCHAR(255)"
            value={column.type}
            onRequestEntitySelect={onRequestEntitySelect}
            onRequestRowSelect={onSelect}
            onActivate={() => isEntitySelected && isSelected && onStartEdit('type')}
            onChange={(value) => onChange('type', value)}
          />
        </div>
        <div className="flex h-full items-center justify-center">
          <label className={`flex h-full w-full items-center justify-center border px-2 ${isSelected ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-white'}`}>
            <input
              checked={column.isAllowNull}
              disabled={!isSelected || column.keyType === 'pk'}
              type="checkbox"
              onPointerDown={(event) => {
                event.stopPropagation();
                if (!isEntitySelected) {
                  event.preventDefault();
                  onRequestEntitySelect();
                  return;
                }
                if (!isSelected) {
                  event.preventDefault();
                  onSelect();
                }
              }}
              onClick={(event) => {
                if (column.keyType === 'pk') {
                  event.preventDefault();
                }
              }}
              onChange={(event) => onChange('isAllowNull', event.target.checked)}
            />
          </label>
        </div>
        {isUniqueVisible ? (
          <div className="flex h-full items-center justify-center">
            <label className={`flex h-full w-full items-center justify-center border px-2 ${isSelected ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-white'}`}>
              <input
                checked={column.isUnique}
                disabled={!isSelected}
                type="checkbox"
                onPointerDown={(event) => {
                  event.stopPropagation();
                  if (!isEntitySelected) {
                    event.preventDefault();
                    onRequestEntitySelect();
                    return;
                  }
                  if (!isSelected) {
                    event.preventDefault();
                    onSelect();
                  }
                }}
                onChange={(event) => onChange('isUnique', event.target.checked)}
              />
            </label>
          </div>
        ) : null}
        <div className="flex h-full items-center">
          <AutoFitInput
            className={isSelected ? 'border-amber-400 bg-amber-50' : ''}
            fixedWidthPx={slotWidths.defaultValue}
            isEntitySelected={isEntitySelected}
            isEditing={editingField === 'defaultValue'}
            isRowSelected={isSelected}
            minWidthPx={slotWidths.defaultValue}
            placeholder="default"
            value={column.defaultValue}
            onRequestEntitySelect={onRequestEntitySelect}
            onRequestRowSelect={onSelect}
            onActivate={() => isEntitySelected && isSelected && onStartEdit('defaultValue')}
            onChange={(value) => onChange('defaultValue', value)}
          />
        </div>
        <div className="flex h-full items-center">
          <AutoFitInput
            className={isSelected ? 'border-amber-400 bg-amber-50' : ''}
            fixedWidthPx={slotWidths.comment}
            isEntitySelected={isEntitySelected}
            isEditing={editingField === 'comment'}
            isRowSelected={isSelected}
            minWidthPx={slotWidths.comment}
            placeholder="comment"
            value={column.comment}
            onRequestEntitySelect={onRequestEntitySelect}
            onRequestRowSelect={onSelect}
            onActivate={() => isEntitySelected && isSelected && onStartEdit('comment')}
            onChange={(value) => onChange('comment', value)}
          />
        </div>
      </div>
    </div>
  );
}

function KeyTypeIndicator({ column }: { column: ErdColumn }) {
  if (column.keyType === 'pk') {
    return <MdOutlineKey size="1.05em" className="text-amber-600" />;
  }

  if (column.keyType === 'fk' && column.relationKeyType === 'identifying') {
    return <span className="text-[10px] font-semibold tracking-[0.08em] text-sky-600">FK</span>;
  }

  if (column.keyType === 'fk') {
    return <span className="text-[10px] font-semibold tracking-[0.08em] text-pink-600">FK</span>;
  }

  return <span className="text-[10px] text-slate-300">-</span>;
}

function DragPreviewRow({
  column,
  columnTemplate,
  isUniqueVisible,
  left,
  offsetY,
  slotWidths,
  top,
  width,
}: {
  column: ErdColumn;
  columnTemplate: string;
  isUniqueVisible: boolean;
  left: number;
  offsetY: number;
  slotWidths: ReturnType<typeof getColumnSlotWidths>;
  top: number;
  width: number;
}) {
  return (
    <div
      className="pointer-events-none fixed z-[90] grid items-center bg-slate-400 p-[0px] opacity-90 shadow-2xl ring-2 ring-amber-400"
      style={{
        left,
        top: top + offsetY,
        width,
        gridTemplateColumns: columnTemplate,
        columnGap: '2px',
      }}
    >
      <PreviewCell width={slotWidths.key}>
        <KeyTypeIndicator column={column} />
      </PreviewCell>
      <PreviewCell width={slotWidths.name}>{column.name || 'name'}</PreviewCell>
      <PreviewCell width={slotWidths.pName}>{column.pName || '별칭'}</PreviewCell>
      <PreviewCell width={slotWidths.type}>{column.type || 'VARCHAR(255)'}</PreviewCell>
      <PreviewCell center width={slotWidths.null}>
        <input checked={column.isAllowNull} readOnly type="checkbox" />
      </PreviewCell>
      {isUniqueVisible ? (
        <PreviewCell center width={slotWidths.unique}>
          <input checked={column.isUnique} readOnly type="checkbox" />
        </PreviewCell>
      ) : null}
      <PreviewCell width={slotWidths.defaultValue}>{column.defaultValue || 'default'}</PreviewCell>
      <PreviewCell width={slotWidths.comment}>{column.comment || 'comment'}</PreviewCell>
    </div>
  );
}

function PreviewCell({ children, center = false, width }: React.PropsWithChildren<{ center?: boolean; width: number }>) {
  return (
    <div
      className={`flex h-full min-h-[30px] items-center border border-amber-300 bg-amber-50 px-2 text-[11px] text-slate-700 ${center ? 'justify-center text-center' : ''}`}
      style={{ width }}
    >
      {children}
    </div>
  );
}

function HeaderCell({ width, label, center = false }: { width: number; label: string; center?: boolean }) {
  return (
    <div
      className={`flex h-7 items-center border border-slate-700/60 bg-slate-600 px-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-300 ${center ? 'justify-center text-center' : ''}`}
      style={{ width: `${width}px` }}
    >
      {label}
    </div>
  );
}

type AutoFitInputProps = {
  className?: string;
  minWidthPx?: number;
  fixedWidthPx?: number;
  isEntitySelected?: boolean;
  isEditing?: boolean;
  isRowSelected?: boolean;
  placeholder: string;
  value: string;
  onActivate?: () => void;
  onRequestEntitySelect?: () => void;
  onRequestRowSelect?: () => void;
  onChange: (value: string) => void;
};

function AutoFitInput({
  className = '',
  minWidthPx = 56,
  fixedWidthPx,
  isEntitySelected = false,
  isEditing = false,
  isRowSelected = false,
  placeholder,
  value,
  onActivate,
  onRequestEntitySelect,
  onRequestRowSelect,
  onChange,
}: AutoFitInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const [measuredWidthPx, setMeasuredWidthPx] = useState(minWidthPx);

  useEffect(() => {
    if (fixedWidthPx) return;

    const input = inputRef.current;
    const measure = measureRef.current;

    if (!input || !measure) return;

    const computed = window.getComputedStyle(input);
    measure.style.font = computed.font;
    measure.style.fontKerning = computed.fontKerning;
    measure.style.fontFeatureSettings = computed.fontFeatureSettings;
    measure.style.fontVariationSettings = computed.fontVariationSettings;
    measure.style.letterSpacing = computed.letterSpacing;
    measure.style.textTransform = computed.textTransform;
    measure.textContent = value || placeholder || '';

    const nextWidth = Math.ceil(measure.getBoundingClientRect().width) + 20;
    setMeasuredWidthPx(Math.max(minWidthPx, nextWidth));
  }, [fixedWidthPx, minWidthPx, placeholder, value]);

  return (
    <>
      <input
        ref={inputRef}
        className={`flex h-full border border-slate-200 bg-white px-2 py-1.5 text-[11px] leading-4 text-slate-700 outline-none ${className}`}
        placeholder={placeholder}
        readOnly={!isEditing}
        spellCheck={false}
        type="text"
        style={{ width: `${fixedWidthPx ?? measuredWidthPx}px` }}
        value={value}
        onPointerDown={(event) => {
          event.stopPropagation();
          if (!isEntitySelected) {
            event.preventDefault();
            onRequestEntitySelect?.();
            return;
          }
          if (!isRowSelected) {
            event.preventDefault();
            onRequestRowSelect?.();
            return;
          }
          if (!isEditing) {
            event.preventDefault();
            onActivate?.();
          }
        }}
        onChange={(event) => onChange(event.target.value)}
      />
      <span ref={measureRef} className="pointer-events-none absolute -left-[9999px] top-0 invisible whitespace-pre px-2 py-1 text-[11px] leading-4" aria-hidden="true" />
    </>
  );
}
export default EntityCard;
