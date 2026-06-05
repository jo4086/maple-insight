import { useCallback, useEffect, useRef, useState } from 'react';

import type { ErdDocument, ErdEntity } from '@/features/erd';
import { loadErdDocuments, saveErdDocuments } from '@/features/erd';
import { clamp, snapToGrid, type DragState, type PanState } from '../geometry';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants';
import type { MovementMode } from './useCanvasViewport';

type UseEntityDragOptions = {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  movementMode: MovementMode;
  panRef: React.MutableRefObject<PanState | null>;
  selectedEntityIds: string[];
  updateDocumentState: (next: ErdDocument) => void;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  zoomRef: React.MutableRefObject<number>;
  documentRef: React.MutableRefObject<ErdDocument | null>;
};

type UseEntityDragResult = {
  dragRef: React.MutableRefObject<DragState | null>;
  draggingEntityId: string | null;
  handleEntityDragStart: (entity: ErdEntity, event: React.PointerEvent<HTMLElement>) => void;
};

export function useEntityDrag({
  canvasRef,
  movementMode,
  panRef,
  selectedEntityIds,
  updateDocumentState,
  viewportRef,
  zoomRef,
  documentRef,
}: UseEntityDragOptions): UseEntityDragResult {
  const [draggingEntityId, setDraggingEntityId] = useState<string | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const movementModeRef = useRef<MovementMode>(movementMode);

  useEffect(() => {
    movementModeRef.current = movementMode;
  }, [movementMode]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      const current = documentRef.current;
      const canvas = canvasRef.current;
      const pan = panRef.current;
      const viewport = viewportRef.current;

      if (pan && viewport && pan.pointerId === event.pointerId) {
        viewport.scrollLeft = pan.startScrollLeft - (event.clientX - pan.startClientX);
        viewport.scrollTop = pan.startScrollTop - (event.clientY - pan.startClientY);
        return;
      }

      if (!drag || !current || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dragged = current.entities.find((entity) => entity.id === drag.anchorEntityId);
      const entityWidth = dragged?.size.width ?? 0;
      const entityHeight = dragged?.size.height ?? 0;
      const scale = zoomRef.current;
      const rawNextX = clamp((event.clientX - rect.left) / scale - drag.offsetX, 0, CANVAS_WIDTH - entityWidth);
      const rawNextY = clamp((event.clientY - rect.top) / scale - drag.offsetY, 0, CANVAS_HEIGHT - entityHeight);
      const nextX = movementModeRef.current === 'grid' ? clamp(snapToGrid(rawNextX), 0, CANVAS_WIDTH - entityWidth) : rawNextX;
      const nextY = movementModeRef.current === 'grid' ? clamp(snapToGrid(rawNextY), 0, CANVAS_HEIGHT - entityHeight) : rawNextY;
      const startAnchor = drag.startPositions[drag.anchorEntityId];
      const deltaX = nextX - startAnchor.x;
      const deltaY = nextY - startAnchor.y;

      const next: ErdDocument = {
        ...current,
        updatedAt: new Date().toISOString(),
        entities: current.entities.map((entity) => {
          if (!drag.entityIds.includes(entity.id)) return entity;

          const start = drag.startPositions[entity.id];
          const width = entity.size.width;
          const height = entity.size.height;

          return {
            ...entity,
            position: {
              x: clamp(start.x + deltaX, 0, CANVAS_WIDTH - width),
              y: clamp(start.y + deltaY, 0, CANVAS_HEIGHT - height),
            },
          };
        }),
      };

      documentRef.current = next;
      updateDocumentState(next);
    };

    const handlePointerUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      const current = documentRef.current;
      const pan = panRef.current;

      if (pan && pan.pointerId === event.pointerId) {
        panRef.current = null;
        return;
      }

      if (!drag || drag.pointerId !== event.pointerId || !current) return;

      dragRef.current = null;
      setDraggingEntityId(null);

      const documents = loadErdDocuments();
      saveErdDocuments(documents.map((item) => (item.id === current.id ? current : item)));
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [canvasRef, documentRef, panRef, updateDocumentState, viewportRef, zoomRef]);

  const handleEntityDragStart = useCallback(
    (entity: ErdEntity, event: React.PointerEvent<HTMLElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const entityIds = selectedEntityIds.includes(entity.id) ? selectedEntityIds : [entity.id];
      const current = documentRef.current;
      if (!current) return;

      const startPositions = Object.fromEntries(current.entities.filter((item) => entityIds.includes(item.id)).map((item) => [item.id, { x: item.position.x, y: item.position.y }]));

      dragRef.current = {
        entityIds,
        anchorEntityId: entity.id,
        offsetX: (event.clientX - rect.left) / zoomRef.current - entity.position.x,
        offsetY: (event.clientY - rect.top) / zoomRef.current - entity.position.y,
        pointerId: event.pointerId,
        startPositions,
      };

      setDraggingEntityId(entity.id);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [canvasRef, documentRef, selectedEntityIds, zoomRef],
  );

  return {
    dragRef,
    draggingEntityId,
    handleEntityDragStart,
  };
}
