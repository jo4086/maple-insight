import { MdPalette, MdTableChart, MdTune } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { FaPlus } from 'react-icons/fa';

import type { ErdColumn, ErdEntity } from '@/features/erd';

type EntityOverviewCardProps = {
  entity: ErdEntity;
  isDragging: boolean;
  isSelected: boolean;
  onAddNormalColumn: () => void;
  onAddPrimaryColumn: () => void;
  onDragStart: (event: React.PointerEvent<HTMLElement>) => void;
  onMoveToTop: () => void;
  onOpenPalette: () => void;
  onOpenProperties: () => void;
  onRemoveEntity: () => void;
  onSelect: (append: boolean) => void;
};

function getColumnBadge(column: ErdColumn) {
  const normalized = column.type.toUpperCase();
  if (/(INT|NUMERIC|DECIMAL|FLOAT|DOUBLE|SERIAL)/.test(normalized)) return '(123)';
  if (/(BOOL)/.test(normalized)) return '[ ]';
  return '(A-Z)';
}

const EntityOverviewCard = ({
  entity,
  isDragging,
  isSelected,
  onAddNormalColumn,
  onAddPrimaryColumn,
  onDragStart,
  onMoveToTop,
  onOpenPalette,
  onOpenProperties,
  onRemoveEntity,
  onSelect,
}: EntityOverviewCardProps) => {
  return (
    <article
      className={`absolute overflow-hidden border bg-white shadow-sm transition-shadow ${isSelected ? 'border-sky-500 ring-2 ring-sky-200' : 'border-slate-300'} ${isDragging ? 'shadow-xl' : 'shadow-sm'}`}
      style={{ left: entity.position.x, top: entity.position.y, width: 220 }}
      onPointerDown={(event) => {
        onSelect(event.shiftKey);
        onMoveToTop();
        const target = event.target as HTMLElement;
        if (target.closest('input,select,button,label')) return;
        if (event.shiftKey) return;
        onDragStart(event);
      }}
    >
      {isSelected ? (
        <div className="absolute -top-9 right-0 z-10 flex items-center gap-1 border border-slate-200 bg-white px-1.5 py-1 shadow-sm">
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
            className="flex h-6 min-w-6 items-center justify-center rounded-sm border border-rose-200 bg-rose-100/30 px-1 text-rose-600 hover:bg-rose-100/70"
            onClick={(event) => {
              event.stopPropagation();
              onRemoveEntity();
            }}
            type="button"
          >
            <RiDeleteBin6Line size="1.2em" />
          </button>
          <button
            className="flex h-6 min-w-6 items-center justify-center rounded-sm border border-amber-200 bg-amber-100/30 px-1 text-amber-500 hover:bg-amber-100/70"
            onClick={(event) => {
              event.stopPropagation();
              onAddPrimaryColumn();
            }}
            type="button"
          >
            <FaPlus size="1.2em" />
          </button>
          <button
            className="flex h-6 min-w-6 items-center justify-center rounded-sm border border-slate-300 bg-slate-100/30 px-1 text-slate-700 hover:bg-slate-100/70"
            onClick={(event) => {
              event.stopPropagation();
              onAddNormalColumn();
            }}
            type="button"
          >
            <FaPlus size="1.2em" />
          </button>
        </div>
      ) : null}
      <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900" style={{ backgroundColor: entity.color }}>
        <MdTableChart size="1em" className="shrink-0 text-white" />
        <span className="truncate text-white">{entity.name || 'Untitled Entity'}</span>
      </div>
      <div className="grid gap-px bg-slate-200">
        {entity.columns.map((column) => (
          <div key={column.id} className="grid grid-cols-[56px_minmax(0,1fr)] gap-2 bg-white px-3 py-1.5 text-xs text-slate-700">
            <span className="font-medium text-slate-500">{getColumnBadge(column)}</span>
            <span className="truncate">{column.name || 'new_column'}</span>
          </div>
        ))}
      </div>
    </article>
  );
};

export default EntityOverviewCard;
