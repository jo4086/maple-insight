import { GRID_UNIT, createEmptyEntityAt, useCanvasViewport } from '@/ft-r';
import { useEditorSession } from '@/ft-r/editor/hooks/useEditorSession';
import CanvasHud from './CanvasHud';
import CanvasWorld from './CanvasWorld';
import MinimapPanel from './MinimapPanel';

const CanvasSection = () => {
  const { editorDocument, setEditorDocument, setIsDirty, setToolMode, showMinimap, toolMode, viewport } = useEditorSession();
  const { handleCanvasPanStart, handleViewportAuxClick, handleViewportMouseDown, moveViewportToRatio, movementMode, viewportMetrics, viewportRef } = useCanvasViewport();

  const handleViewportClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (toolMode !== 'add-entity' || event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (target?.closest('[data-canvas-entity="true"]')) {
      return;
    }

    const element = viewportRef.current;

    if (!element) {
      return;
    }

    const bounds = element.getBoundingClientRect();
    const localX = event.clientX - bounds.left + element.scrollLeft;
    const localY = event.clientY - bounds.top + element.scrollTop;

    const x = Math.round(localX / viewport.zoom / GRID_UNIT) * GRID_UNIT;
    const y = Math.round(localY / viewport.zoom / GRID_UNIT) * GRID_UNIT;

    setEditorDocument((currentDocument) => ({
      ...currentDocument,
      entities: [...currentDocument.entities, createEmptyEntityAt(currentDocument.entities, { x, y })],
    }));
    setIsDirty(true);
    setToolMode('select');
  };

  const handleEntityFieldChange = (entityId: string, field: 'name' | 'pName', value: string) => {
    setEditorDocument((currentDocument) => ({
      ...currentDocument,
      entities: currentDocument.entities.map((entity) =>
        entity._id === entityId
          ? {
              ...entity,
              [field]: value,
            }
          : entity,
      ),
    }));
    setIsDirty(true);
  };

  return (
    <section className="relative h-full min-h-0 w-full min-w-0 overflow-hidden rounded-lg border border-slate-300 bg-slate-50">
      <div
        ref={viewportRef}
        className={`scrollbar-hidden relative h-full min-h-0 w-full overflow-auto rounded-lg bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] ${
          toolMode === 'add-entity' ? 'cursor-copy' : movementMode === 'free' ? 'cursor-grab' : 'cursor-default'
        }`}
        onAuxClick={handleViewportAuxClick}
        onClick={handleViewportClick}
        onMouseDown={handleViewportMouseDown}
        onPointerDown={handleCanvasPanStart}
        style={{ touchAction: 'none' }}
      >
        <CanvasWorld entities={editorDocument.entities} onEntityFieldChange={handleEntityFieldChange} zoom={viewport.zoom} />
      </div>

      {/* <CanvasHud viewport={viewport} /> */}

      {showMinimap ? <MinimapPanel entities={editorDocument.entities} onNavigate={moveViewportToRatio} viewportMetrics={viewportMetrics} zoom={viewport.zoom} /> : null}
    </section>
  );
};

export default CanvasSection;
