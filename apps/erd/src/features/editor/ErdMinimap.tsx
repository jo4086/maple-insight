import { useEffect, useRef } from 'react';

import type { ErdEntity } from '@/features/erd';

export type ViewportMetrics = {
  scrollLeft: number;
  scrollTop: number;
  clientWidth: number;
  clientHeight: number;
  scrollWidth: number;
  scrollHeight: number;
};

type ErdMinimapProps = {
  canvasHeight: number;
  canvasWidth: number;
  selectedEntityIds: string[];
  viewportMetrics: ViewportMetrics;
  width: number;
  zoom: number;
  entities: ErdEntity[];
  onNavigate: (ratioX: number, ratioY: number) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const ErdMinimap = ({ canvasHeight, canvasWidth, selectedEntityIds, viewportMetrics, width, zoom, entities, onNavigate }: ErdMinimapProps) => {
  const pointerIdRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const onNavigateRef = useRef(onNavigate);
  const height = Math.round((canvasHeight / canvasWidth) * width);
  const minimapScale = width / (canvasWidth * zoom);
  const viewportBox = {
    left: viewportMetrics.scrollLeft * minimapScale,
    top: viewportMetrics.scrollTop * minimapScale,
    width: Math.max(18, viewportMetrics.clientWidth * minimapScale),
    height: Math.max(18, viewportMetrics.clientHeight * minimapScale),
  };

  useEffect(() => {
    onNavigateRef.current = onNavigate;
  }, [onNavigate]);

  const moveToPointer = (clientX: number, clientY: number) => {
    const element = rootRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    onNavigateRef.current(clamp((clientX - rect.left) / rect.width, 0, 1), clamp((clientY - rect.top) / rect.height, 0, 1));
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) return;
      moveToPointer(event.clientX, event.clientY);
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) return;
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
    <div
      ref={rootRef}
      className="group overflow-hidden border-2 border-slate-400 bg-white/96 shadow-xl backdrop-blur-sm"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        pointerIdRef.current = event.pointerId;
        moveToPointer(event.clientX, event.clientY);
        event.preventDefault();
      }}
      role="presentation"
      style={{ width, height }}
    >
      <div className="relative h-full w-full bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:12px_12px]">
        {entities.map((entity) => (
          <div
            key={entity.id}
            className={`absolute overflow-hidden  border ${selectedEntityIds.includes(entity.id) ? 'border-sky-500 bg-sky-200/70' : 'border-slate-400/60 bg-slate-300/70'}`}
            style={{
              left: entity.position.x * zoom * minimapScale,
              top: entity.position.y * zoom * minimapScale,
              width: Math.max(4, entity.size.width * zoom * minimapScale),
              height: Math.max(4, entity.size.height * zoom * minimapScale),
            }}
          />
        ))}
        <div
          className="absolute border-2 border-sky-500 bg-sky-200/15 shadow-[0_0_0_1px_rgba(255,255,255,0.8)]"
          style={{
            left: viewportBox.left,
            top: viewportBox.top,
            width: viewportBox.width,
            height: viewportBox.height,
          }}
        />
      </div>
    </div>
  );
};
export default ErdMinimap;
