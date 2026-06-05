import { MdClose } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';

import type { ErdDocument, ErdEntity } from '@/features/erd';
import type { ViewportMetrics } from '@@editor/ErdMinimap';
import ErdMinimap from '@@editor/ErdMinimap';
import EditorActionMenu from '@/components/EditorActionMenu';

type OverlayPanelsProps = {
  canvasHeight: number;
  canvasWidth: number;
  editorDocument: ErdDocument;
  entityPanelMode: 'list' | null;
  entityViewMode: 'detail' | 'overview';
  isActionMenuOpen: boolean;
  isMinimapVisible: boolean;
  selectedEntityIds: string[];
  viewportMetrics: ViewportMetrics;
  width: number;
  zoom: number;
  onCloseEntityPanel: () => void;
  onEntityFieldChange: (entityId: string, field: 'name' | 'comment' | 'isUniqueColumnVisible', value: string | boolean) => void;
  onFocusEntity: (entityId: string) => void;
  onNavigateMinimap: (ratioX: number, ratioY: number) => void;
  onOpenDdl: () => void;
  onOpenEntityList: () => void;
  onRemoveEntity: (entityId: string) => void;
  onToggleMenu: () => void;
  onToggleMinimap: () => void;
  onToggleOverviewMode: () => void;
};

const OverlayPanels = ({
  canvasHeight,
  canvasWidth,
  editorDocument,
  entityPanelMode,
  entityViewMode,
  isActionMenuOpen,
  isMinimapVisible,
  selectedEntityIds,
  viewportMetrics,
  width,
  zoom,
  onCloseEntityPanel,
  onEntityFieldChange,
  onFocusEntity,
  onNavigateMinimap,
  onOpenDdl,
  onOpenEntityList,
  onRemoveEntity,
  onToggleMenu,
  onToggleMinimap,
  onToggleOverviewMode,
}: OverlayPanelsProps) => {
  return (
    <>
      {isMinimapVisible ? (
        <div className="fixed bottom-4 right-4 z-40">
          <ErdMinimap
            canvasHeight={canvasHeight}
            canvasWidth={canvasWidth}
            entities={editorDocument.entities}
            selectedEntityIds={selectedEntityIds}
            viewportMetrics={viewportMetrics}
            width={width}
            zoom={zoom}
            onNavigate={onNavigateMinimap}
          />
        </div>
      ) : null}
      {entityPanelMode === 'list' ? (
        <div className="fixed right-[4.75rem] top-16 z-40">
          <div className="flex max-h-[360px] w-[280px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Entities</p>
                <p className="text-[11px] text-slate-400">{editorDocument.entities.length} items</p>
              </div>
              <button className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800" onClick={onCloseEntityPanel} type="button">
                <MdClose size="1.05em" />
              </button>
            </div>
            <div className="overflow-auto p-2">
              <div className="grid gap-1">
                {editorDocument.entities.map((entity) => (
                  <EntityListItem key={entity.id} entity={entity} onEntityFieldChange={onEntityFieldChange} onFocusEntity={onFocusEntity} onRemoveEntity={onRemoveEntity} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="fixed right-4 top-16 z-40">
        <EditorActionMenu
          isMenuOpen={isActionMenuOpen}
          isMinimapVisible={isMinimapVisible}
          isOverviewMode={entityViewMode === 'overview'}
          onOpenDdl={onOpenDdl}
          onOpenEntityList={onOpenEntityList}
          onToggleMenu={onToggleMenu}
          onToggleMinimap={onToggleMinimap}
          onToggleOverviewMode={onToggleOverviewMode}
        />
      </div>
    </>
  );
};

function EntityListItem({
  entity,
  onEntityFieldChange,
  onFocusEntity,
  onRemoveEntity,
}: {
  entity: ErdEntity;
  onEntityFieldChange: (entityId: string, field: 'name' | 'comment' | 'isUniqueColumnVisible', value: string | boolean) => void;
  onFocusEntity: (entityId: string) => void;
  onRemoveEntity: (entityId: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
      <input
        className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1 py-1 text-sm font-medium text-slate-700 outline-none focus:border-slate-300 focus:bg-white"
        onChange={(event) => onEntityFieldChange(entity.id, 'name', event.target.value)}
        onFocus={() => {
          onFocusEntity(entity.id);
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        placeholder="Untitled Entity"
        value={entity.name}
      />
      <button className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => onRemoveEntity(entity.id)} type="button">
        <RiDeleteBin6Line size="1em" />
      </button>
    </div>
  );
}

export default OverlayPanels;
