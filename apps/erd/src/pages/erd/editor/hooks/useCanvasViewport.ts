import { useCallback, useEffect, useRef, useState } from 'react';

import type { ErdDocument } from '@/features/erd';
import type { ViewportMetrics } from '@@editor/ErdMinimap';
import { clamp, type PanState } from '../geometry';
import { CANVAS_HEIGHT, CANVAS_WIDTH, MAX_ZOOM, MIN_ZOOM } from '../constants';

export type MovementMode = 'free' | 'grid';

type UseCanvasViewportOptions = {
  editorDocument: ErdDocument | null;
};

type UseCanvasViewportResult = {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  moveViewportToCanvasPoint: (ratioX: number, ratioY: number) => void;
  movementMode: MovementMode;
  panRef: React.MutableRefObject<PanState | null>;
  setMovementMode: React.Dispatch<React.SetStateAction<MovementMode>>;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  viewportMetrics: ViewportMetrics;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomRef: React.MutableRefObject<number>;
  handleCanvasPanStart: (event: React.PointerEvent<HTMLDivElement>) => void;
  handleViewportMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleViewportAuxClick: (event: React.MouseEvent<HTMLDivElement>) => void;
};

export function useCanvasViewport({ editorDocument }: UseCanvasViewportOptions): UseCanvasViewportResult {
  const [zoom, setZoom] = useState(1);
  const [movementMode, setMovementMode] = useState<MovementMode>('free');
  const [viewportMetrics, setViewportMetrics] = useState<ViewportMetrics>({
    scrollLeft: 0,
    scrollTop: 0,
    clientWidth: 0,
    clientHeight: 0,
    scrollWidth: CANVAS_WIDTH,
    scrollHeight: CANVAS_HEIGHT,
  });
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef(1);
  const panRef = useRef<PanState | null>(null);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const syncViewportMetrics = () => {
      setViewportMetrics({
        scrollLeft: viewport.scrollLeft,
        scrollTop: viewport.scrollTop,
        clientWidth: viewport.clientWidth,
        clientHeight: viewport.clientHeight,
        scrollWidth: viewport.scrollWidth,
        scrollHeight: viewport.scrollHeight,
      });
    };

    syncViewportMetrics();
    viewport.addEventListener('scroll', syncViewportMetrics, { passive: true });

    const observer = new ResizeObserver(syncViewportMetrics);
    observer.observe(viewport);

    return () => {
      viewport.removeEventListener('scroll', syncViewportMetrics);
      observer.disconnect();
    };
  }, [editorDocument, zoom]);

  const moveViewportToCanvasPoint = useCallback((ratioX: number, ratioY: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const targetLeft = ratioX * viewport.scrollWidth - viewport.clientWidth / 2;
    const targetTop = ratioY * viewport.scrollHeight - viewport.clientHeight / 2;

    viewport.scrollTo({
      left: clamp(targetLeft, 0, Math.max(0, viewport.scrollWidth - viewport.clientWidth)),
      top: clamp(targetTop, 0, Math.max(0, viewport.scrollHeight - viewport.clientHeight)),
      behavior: 'auto',
    });
  }, []);

  const handleCanvasPanStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 1) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    panRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startScrollLeft: viewport.scrollLeft,
      startScrollTop: viewport.scrollTop,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }, []);

  const handleViewportMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button === 1) event.preventDefault();
  }, []);

  const handleViewportAuxClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button === 1) event.preventDefault();
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((value) => clamp(Number((value - 0.1).toFixed(2)), MIN_ZOOM, MAX_ZOOM));
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((value) => clamp(Number((value + 0.1).toFixed(2)), MIN_ZOOM, MAX_ZOOM));
  }, []);

  return {
    canvasRef,
    moveViewportToCanvasPoint,
    movementMode,
    panRef,
    setMovementMode,
    setZoom,
    viewportMetrics,
    viewportRef,
    zoom,
    zoomIn,
    zoomOut,
    zoomRef,
    handleCanvasPanStart,
    handleViewportMouseDown,
    handleViewportAuxClick,
  };
}
