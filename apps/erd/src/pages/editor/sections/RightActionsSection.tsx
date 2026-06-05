import { useEditorSession } from '@/ft-r/editor/hooks/useEditorSession';

const ACTION_LABELS = ['Minimap Toggle', 'Entity List', 'DDL Preview', 'Compact Table'] as const;

const RightActionsSection = () => {
  const { setShowMinimap, showMinimap } = useEditorSession();

  return (
    <div className="absolute right-3 top-3 flex flex-col items-center gap-2">
      {ACTION_LABELS.map((label) => (
        <WorkspaceActionButton
          key={label}
          active={label === 'Minimap Toggle' ? showMinimap : false}
          label={label}
          onClick={
            label === 'Minimap Toggle'
              ? () => setShowMinimap(!showMinimap)
              : () => {}
          }
        />
      ))}
    </div>
  );
};

export default RightActionsSection;

function WorkspaceActionButton({
  active = false,
  label,
  onClick,
}: {
  active?: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={`flex h-10 w-10 items-center justify-center rounded-full border bg-white text-[10px] font-semibold shadow-sm transition-colors hover:border-slate-300 hover:text-slate-700 ${
        active ? 'border-sky-400 text-sky-600' : 'border-slate-200 text-slate-500'
      }`}
      onClick={onClick}
      title={label}
      type="button"
    >
      {label.slice(0, 2).toUpperCase()}
    </button>
  );
}
