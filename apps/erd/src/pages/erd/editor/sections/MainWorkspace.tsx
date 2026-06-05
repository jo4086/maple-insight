import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { MdCallSplit, MdDeviceHub, MdGridOn, MdOpenWith, MdOutlinePostAdd, MdStickyNote2, MdZoomIn, MdZoomOut } from 'react-icons/md';

import type { ErdColumn, ErdDocument, ErdEntity, ErdRelation } from '@/features/erd';
import EntityCard from '@@editor/EntityCard';
import EntityOverviewCard from '@@editor/EntityOverviewCard';
import RelationCardinalityIcon from '@@editor/RelationCardinalityIcon';

type RelationMode = 'none' | 'non-identifying' | 'identifying';
type RelationCardinality = 'zero-or-many' | 'one' | 'zero-or-one' | 'many' | 'one-or-many' | 'one-only' | 'zero-or-one-or-many';
type MovementMode = 'free' | 'grid';
type EntityViewMode = 'detail' | 'overview';

type MainWorkspaceProps = {
  canvasHeight: number;
  canvasRef: RefObject<HTMLDivElement | null>;
  canvasWidth: number;
  draggingEntityId: string | null;
  editorDocument: ErdDocument;
  entityViewMode: EntityViewMode;
  isRelationPopoverOpen: boolean;
  movementMode: MovementMode;
  relationCardinality: RelationCardinality;
  relationMode: RelationMode;
  relations: ErdRelation[];
  selectedEntityIds: string[];
  viewportRef: RefObject<HTMLDivElement | null>;
  zoom: number;
  onAddColumn: (entityId: string, keyType: ErdColumn['keyType']) => void;
  onAddEntity: () => void;
  onAddMemo: () => void;
  onCanvasBackgroundMouseDown: () => void;
  onCanvasPanStart: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onColumnChange: <K extends keyof ErdColumn>(entityId: string, columnId: string, field: K, value: ErdColumn[K]) => void;
  onEntityDragStart: (entity: ErdEntity, event: ReactPointerEvent<HTMLElement>) => void;
  onEntityFieldChange: (entityId: string, field: 'name' | 'comment' | 'isUniqueColumnVisible', value: string | boolean) => void;
  onEntityMoveToTop: (entityId: string) => void;
  onEntitySelect: (entityId: string, append: boolean) => void;
  onMoveColumn: (entityId: string, fromColumnId: string, toColumnId: string) => void;
  onOpenPalette: (entityId: string) => void;
  onOpenProperties: (entityId: string) => void;
  onRelationCardinalitySelect: (type: RelationCardinality) => void;
  onRelationModeSelect: (type: Exclude<RelationMode, 'none'>) => void;
  onRemoveColumn: (entityId: string, columnId: string) => void;
  onRemoveEntity: (entityId: string) => void;
  onResizeEntity: (entityId: string, width: number, height: number) => void;
  onToggleRelationPopover: () => void;
  onViewportAuxClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  onViewportMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  setMovementMode: (mode: MovementMode) => void;
};

const relationTypes: RelationCardinality[] = ['zero-or-many', 'one', 'zero-or-one', 'many', 'one-or-many', 'one-only', 'zero-or-one-or-many'];

const MainWorkspace = ({
  canvasHeight,
  canvasRef,
  canvasWidth,
  draggingEntityId,
  editorDocument,
  entityViewMode,
  isRelationPopoverOpen,
  movementMode,
  relationCardinality,
  relationMode,
  selectedEntityIds,
  viewportRef,
  zoom,
  onAddColumn,
  onAddEntity,
  onAddMemo,
  onCanvasBackgroundMouseDown,
  onCanvasPanStart,
  onColumnChange,
  onEntityDragStart,
  onEntityFieldChange,
  onEntityMoveToTop,
  onEntitySelect,
  onMoveColumn,
  onOpenPalette,
  onOpenProperties,
  onRelationCardinalitySelect,
  onRelationModeSelect,
  onRemoveColumn,
  onRemoveEntity,
  onResizeEntity,
  onToggleRelationPopover,
  onViewportAuxClick,
  onViewportMouseDown,
  onZoomIn,
  onZoomOut,
  setMovementMode,
}: MainWorkspaceProps) => {
  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-2 overflow-hidden px-3 py-2 border border-blue-500">
      <section className="flex min-h-0 flex-1 items-stretch gap-2 overflow-hidden border-red-400 border">
        <aside className="flex flex-col items-center rounded-lg border border-slate-200 bg-white py-1 shadow-sm">
          <ToolbarButton compact label="Add Entity" onClick={onAddEntity}>
            <MdOutlinePostAdd size="1.05em" />
          </ToolbarButton>
          <ToolbarButton compact label="Add Memo" onClick={onAddMemo}>
            <MdStickyNote2 size="1.05em" />
          </ToolbarButton>
          <div className="relative">
            <ToolbarButton active={isRelationPopoverOpen || relationMode !== 'none'} compact label="Relation" onClick={onToggleRelationPopover}>
              <MdCallSplit size="1.05em" />
            </ToolbarButton>
            {isRelationPopoverOpen ? (
              <div className="absolute left-10 top-0 z-20 flex w-64 flex-col gap-3 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                <div className="space-y-1">
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Relation Type</p>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      className={`flex h-9 items-center justify-between rounded-md border px-2 text-[11px] font-medium ${
                        relationMode === 'non-identifying' ? 'border-sky-300 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                      onClick={() => onRelationModeSelect('non-identifying')}
                      type="button"
                    >
                      <span className="flex items-center gap-1">
                        <MdCallSplit size="1.2em" />
                        <span>Non</span>
                      </span>
                      <span className="h-0 w-8 border-t-2 border-dashed border-current" />
                    </button>
                    <button
                      className={`flex h-9 items-center justify-between rounded-md border px-2 text-[11px] font-medium ${
                        relationMode === 'identifying' ? 'border-sky-300 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                      onClick={() => onRelationModeSelect('identifying')}
                      type="button"
                    >
                      <span className="flex items-center gap-1">
                        <MdDeviceHub size="1.2em" />
                        <span>Ident</span>
                      </span>
                      <span className="h-0 w-8 border-t-2 border-current" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Source</p>
                    <span className="text-[10px] font-medium text-slate-500">Fixed as one</span>
                  </div>
                  <div className="flex h-9 items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2 text-slate-600">
                    <span className="text-[11px] font-medium">Giving side</span>
                    <RelationCardinalityIcon type="one" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Target</p>
                    <span className="text-[10px] font-medium text-slate-500">Choose receiving side</span>
                  </div>
                  <button
                    className={`flex h-8 w-full items-center justify-center rounded-md border text-[10px] font-medium ${
                      relationMode === 'none' ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                    disabled
                    type="button"
                  >
                    {relationMode === 'none' ? 'Choose relation type first' : 'Receiving side cardinality'}
                  </button>
                  <div className="grid grid-cols-3 gap-1">
                    {relationTypes.map((type) => (
                      <button
                        key={type}
                        className={`flex h-9 items-center justify-center rounded-md border ${
                          relationMode === 'none'
                            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300'
                            : relationCardinality === type
                              ? 'border-sky-300 bg-sky-50 text-sky-700'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                        disabled={relationMode === 'none'}
                        onClick={() => onRelationCardinalitySelect(type)}
                        type="button"
                      >
                        <RelationCardinalityIcon type={type} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <div className="mt-auto flex flex-col items-center">
            <ToolbarButton compact label="Zoom Out" onClick={onZoomOut}>
              <MdZoomOut size="1.05em" />
            </ToolbarButton>
            <ToolbarButton compact label="Zoom In" onClick={onZoomIn}>
              <MdZoomIn size="1.05em" />
            </ToolbarButton>
            <ToolbarButton active={movementMode === 'free'} compact label="Free Move" onClick={() => setMovementMode('free')}>
              <MdOpenWith size="1.05em" />
            </ToolbarButton>
            <ToolbarButton active={movementMode === 'grid'} compact label="Grid Move" onClick={() => setMovementMode('grid')}>
              <MdGridOn size="1.05em" />
            </ToolbarButton>
            <div className="pt-1 text-[10px] font-semibold text-slate-400">{Math.round(zoom * 100)}%</div>
          </div>
        </aside>

        <div className="min-h-0 min-w-0 flex-1 overflow-hidden border border-amber-500">
          <div
            ref={viewportRef}
            className="scrollbar-hidden relative h-full min-h-0 w-full overflow-auto rounded-2xl border border-slate-200 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:24px_24px] p-4 shadow-sm"
            onAuxClick={onViewportAuxClick}
            onMouseDown={onViewportMouseDown}
            onPointerDown={onCanvasPanStart}
            style={{ touchAction: 'none' }}
          >
            <div className="relative inline-block min-w-max" style={{ width: `${canvasWidth * zoom}px`, height: `${canvasHeight * zoom}px` }}>
              <div
                ref={canvasRef}
                className="relative origin-top-left"
                style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px`, transform: `scale(${zoom})` }}
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) onCanvasBackgroundMouseDown();
                }}
              >
                {editorDocument.entities.map((entity) => {
                  const sharedProps = {
                    entity,
                    isDragging: draggingEntityId === entity.id,
                    isSelected: selectedEntityIds.includes(entity.id),
                    onDragStart: (event: ReactPointerEvent<HTMLElement>) => onEntityDragStart(entity, event),
                    onMoveToTop: () => onEntityMoveToTop(entity.id),
                    onSelect: (append: boolean) => onEntitySelect(entity.id, append),
                  };

                  if (entityViewMode === 'overview') {
                    return (
                      <EntityOverviewCard
                        key={entity.id}
                        {...sharedProps}
                        onAddNormalColumn={() => onAddColumn(entity.id, null)}
                        onAddPrimaryColumn={() => onAddColumn(entity.id, 'pk')}
                        onOpenPalette={() => onOpenPalette(entity.id)}
                        onOpenProperties={() => onOpenProperties(entity.id)}
                        onRemoveEntity={() => onRemoveEntity(entity.id)}
                      />
                    );
                  }

                  return (
                    <EntityCard
                      key={entity.id}
                      {...sharedProps}
                      onAddNormalColumn={() => onAddColumn(entity.id, null)}
                      onAddPrimaryColumn={() => onAddColumn(entity.id, 'pk')}
                      onColumnChange={(columnId, field, value) => onColumnChange(entity.id, columnId, field, value)}
                      onEntityFieldChange={(field, value) => onEntityFieldChange(entity.id, field, value)}
                      onMoveColumn={(fromColumnId, toColumnId) => onMoveColumn(entity.id, fromColumnId, toColumnId)}
                      onOpenPalette={() => onOpenPalette(entity.id)}
                      onOpenProperties={() => onOpenProperties(entity.id)}
                      onRemoveColumn={(columnId) => onRemoveColumn(entity.id, columnId)}
                      onRemoveEntity={() => onRemoveEntity(entity.id)}
                      onResize={(entityId, width, height) => onResizeEntity(entityId, width, height)}
                    />
                  );
                })}

                {editorDocument.memos.map((memo, index) => (
                  <div
                    key={memo.id}
                    className="absolute rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm"
                    style={{ left: 40 + (index % 2) * 320, top: 1120 + Math.floor(index / 2) * 180, width: 280 }}
                  >
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Memo</p>
                    <h3 className="mb-2 text-lg font-semibold text-slate-950">{memo.title}</h3>
                    <p className="text-sm leading-6 text-slate-600">{memo.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

function ToolbarButton({
  children,
  active = false,
  compact = false,
  label,
  onClick,
}: React.PropsWithChildren<{ active?: boolean; compact?: boolean; label: string; onClick: () => void }>) {
  return (
    <button
      className={
        compact
          ? `flex h-8 w-8 items-center justify-center transition-colors hover:bg-slate-100 hover:text-slate-900 ${active ? 'bg-slate-100 text-slate-900' : 'text-slate-600'}`
          : 'flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900'
      }
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

export default MainWorkspace;
