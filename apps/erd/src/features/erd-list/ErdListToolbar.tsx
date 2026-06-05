import { MdGridView, MdViewAgenda } from 'react-icons/md';

type ErdListToolbarProps = {
  count: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
};

const ErdListToolbar = ({ count, viewMode, onViewModeChange }: ErdListToolbarProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Library</p>
        <p className="text-sm text-slate-600">{count} documents</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            className={`flex h-8 w-8 items-center justify-center rounded-md ${viewMode === 'grid' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
            type="button"
          >
            <MdGridView size="1.1em" />
          </button>
          <button
            className={`flex h-8 w-8 items-center justify-center rounded-md ${viewMode === 'list' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            onClick={() => onViewModeChange('list')}
            title="List View"
            type="button"
          >
            <MdViewAgenda size="1.1em" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErdListToolbar;
