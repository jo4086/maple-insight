import type { PropsWithChildren } from 'react';
import { MdGridOn, MdOpenWith, MdOutlinePostAdd, MdStickyNote2, MdZoomIn, MdZoomOut } from 'react-icons/md';

import { useEditorSession } from '@/ft-r/editor/hooks/useEditorSession';

const LeftToolbarSection = () => {
  const { movementMode, setMovementMode, setToolMode, setZoom, toolMode, zoom } = useEditorSession();

  return (
    <aside className="flex flex-col items-center rounded-lg border border-slate-200 bg-white py-1 shadow-sm">
      <ToolbarButton
        active={toolMode === 'add-entity'}
        compact
        label="Add Entity"
        onClick={() => setToolMode(toolMode === 'add-entity' ? 'select' : 'add-entity')}
      >
        <MdOutlinePostAdd size="1.05em" />
      </ToolbarButton>

      <ToolbarButton compact label="Add Memo" onClick={() => {}}>
        <MdStickyNote2 size="1.05em" />
      </ToolbarButton>

      <div className="mt-auto flex flex-col items-center">
        <ToolbarButton compact label="Zoom Out" onClick={() => setZoom((currentZoom) => currentZoom - 0.1)}>
          <MdZoomOut size="1.05em" />
        </ToolbarButton>
        <ToolbarButton compact label="Zoom In" onClick={() => setZoom((currentZoom) => currentZoom + 0.1)}>
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
  );
};

export default LeftToolbarSection;

function ToolbarButton({
  children,
  active = false,
  compact = false,
  label,
  onClick,
}: PropsWithChildren<{ active?: boolean; compact?: boolean; label: string; onClick: () => void }>) {
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
