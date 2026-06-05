export interface CanvasViewport {
  scrollLeft: number
  scrollTop: number
  zoom: number
}

export interface CanvasViewportMetrics {
  clientHeight: number
  clientWidth: number
  scrollHeight: number
  scrollLeft: number
  scrollTop: number
  scrollWidth: number
}

export interface CanvasSize {
  width: number
  height: number
}

export interface CanvasPreferences {
  showMinimap: boolean
  snapToGrid: boolean
  compactEntityCard: boolean
}
