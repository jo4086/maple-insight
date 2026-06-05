import type { CanvasViewport } from '@/ft-r/canvas'

interface CanvasHudProps {
  viewport: CanvasViewport
}

const CanvasHud = ({ viewport }: CanvasHudProps) => {
  return (
    <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-500 shadow-sm">
      scroll {Math.round(viewport.scrollLeft)}, {Math.round(viewport.scrollTop)} / zoom {viewport.zoom.toFixed(2)}
    </div>
  )
}

export default CanvasHud
