import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants'
import type { CanvasViewportMetrics } from './types'

export const MINIMAP_WIDTH = 180
export const MINIMAP_HEIGHT = Math.round((CANVAS_HEIGHT / CANVAS_WIDTH) * MINIMAP_WIDTH)

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function getMinimapScale(zoom: number) {
  return MINIMAP_WIDTH / (CANVAS_WIDTH * zoom)
}

export function getViewportRect(
  viewportMetrics: CanvasViewportMetrics,
  zoom: number,
) {
  const minimapScale = getMinimapScale(zoom)

  return {
    height: Math.max(18, viewportMetrics.clientHeight * minimapScale),
    width: Math.max(18, viewportMetrics.clientWidth * minimapScale),
    x: viewportMetrics.scrollLeft * minimapScale,
    y: viewportMetrics.scrollTop * minimapScale,
  }
}

export function getNavigationRatios(
  clientX: number,
  clientY: number,
  rect: DOMRect,
) {
  return {
    ratioX: clamp((clientX - rect.left) / rect.width, 0, 1),
    ratioY: clamp((clientY - rect.top) / rect.height, 0, 1),
  }
}
