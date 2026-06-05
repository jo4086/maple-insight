import { useEffect, useRef } from 'react';

import { getMinimapScale, getNavigationRatios, getViewportRect, MINIMAP_HEIGHT, MINIMAP_WIDTH } from '@/ft-r/canvas';
import type { CanvasViewportMetrics } from '@/ft-r/canvas';
import type { Entity } from '@/ft-r/entity';

interface MinimapPanelProps {
  entities: Entity[];
  onNavigate: (ratioX: number, ratioY: number) => void;
  viewportMetrics: CanvasViewportMetrics;
  zoom: number;
}

const MinimapPanel = ({ entities, onNavigate, viewportMetrics, zoom }: MinimapPanelProps) => {
  const pointerIdRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const onNavigateRef = useRef(onNavigate);
  const minimapScale = getMinimapScale(zoom);
  const viewportRect = getViewportRect(viewportMetrics, zoom);

  useEffect(() => {
    onNavigateRef.current = onNavigate;
  }, [onNavigate]);

  const moveToPointer = (clientX: number, clientY: number) => {
    const element = rootRef.current;

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const { ratioX, ratioY } = getNavigationRatios(clientX, clientY, rect);
    onNavigateRef.current(ratioX, ratioY);
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }

      moveToPointer(event.clientX, event.clientY);
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }

      pointerIdRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
    };
  }, []);

  return (
    <div className="absolute bottom-3 right-3 overflow-hidden border border-slate-300 bg-white/95 shadow-lg backdrop-blur-sm">
      <div
        ref={rootRef}
        className="relative cursor-pointer"
        onPointerDown={(event) => {
          if (event.button !== 0) {
            return;
          }

          pointerIdRef.current = event.pointerId;
          moveToPointer(event.clientX, event.clientY);
          event.preventDefault();
        }}
        style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }}
      >
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(148, 163, 184, 0.14) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.14) 1px, transparent 1px)
            `,
            backgroundSize: '12px 12px',
          }}
        />

        {entities.map((entity) => (
          <div
            key={entity.id}
            className="absolute rounded-sm border border-sky-400/70 bg-sky-100/60"
            style={{
              height: Math.max(4, entity.size.height * zoom * minimapScale),
              left: entity.position.x * zoom * minimapScale,
              top: entity.position.y * zoom * minimapScale,
              width: Math.max(6, entity.size.width * zoom * minimapScale),
            }}
          />
        ))}

        <div
          className="absolute border-2 border-sky-500 bg-sky-300/20"
          style={{
            left: viewportRect.x,
            top: viewportRect.y,
            width: viewportRect.width,
            height: viewportRect.height,
          }}
        />
      </div>
    </div>
  );
};

export default MinimapPanel;
