import { MdClose, MdTableChart } from 'react-icons/md';

import type { ErdColumn, ErdEntity } from '@/features/erd';

type EntityOverviewPanelProps = {
  entities: ErdEntity[];
  onClose: () => void;
  onFocusEntity: (entityId: string) => void;
};

function getColumnBadge(column: ErdColumn) {
  const normalized = column.type.toUpperCase();

  if (/(INT|NUMERIC|DECIMAL|FLOAT|DOUBLE|SERIAL)/.test(normalized)) return '(123)';
  if (/(BOOL)/.test(normalized)) return '[ ]';
  if (/(DATE|TIME)/.test(normalized)) return '(clk)';

  return '(A-Z)';
}

const EntityOverviewPanel = ({ entities, onClose, onFocusEntity }: EntityOverviewPanelProps) => {
  return (
    <div className="flex max-h-[420px] w-[320px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Overview</p>
          <p className="text-[11px] text-slate-400">{entities.length} entities</p>
        </div>
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800" onClick={onClose} type="button">
          <MdClose size="1.05em" />
        </button>
      </div>

      <div className="overflow-auto p-2">
        <div className="grid gap-2">
          {entities.map((entity) => (
            <button
              key={entity.id}
              className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-left transition hover:border-slate-300 hover:bg-white"
              onClick={() => onFocusEntity(entity.id)}
              type="button"
            >
              <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                <MdTableChart size="1em" className="shrink-0 text-slate-500" />
                <span className="truncate">{entity.name || 'Untitled Entity'}</span>
              </div>
              <div className="grid gap-px bg-slate-200">
                {entity.columns.map((column) => (
                  <div key={column.id} className="grid grid-cols-[56px_minmax(0,1fr)] gap-2 bg-white px-3 py-1.5 text-xs text-slate-700">
                    <span className="font-medium text-slate-500">{getColumnBadge(column)}</span>
                    <span className="truncate">{column.name || 'new_column'}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EntityOverviewPanel;
