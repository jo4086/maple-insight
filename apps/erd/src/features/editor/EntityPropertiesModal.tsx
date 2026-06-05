import { MdClose } from 'react-icons/md';

import type { ErdEntity } from '@/features/erd';

type EntityPropertiesModalProps = {
  entity: ErdEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onEntityFieldChange: (field: 'name' | 'comment' | 'isUniqueColumnVisible', value: string | boolean) => void;
  relatedEntityNames: string[];
};

const EntityPropertiesModal = ({ entity, isOpen, onClose, onEntityFieldChange, relatedEntityNames }: EntityPropertiesModalProps) => {
  if (!isOpen || !entity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Entity Properties</p>
            <p className="text-sm text-slate-500">선택된 테이블 요약</p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900" onClick={onClose} type="button">
            <MdClose size="1.15em" />
          </button>
        </div>
        <div className="grid gap-4 px-4 py-4">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-px bg-slate-200">
              <PropertyRow label="name">
                <input
                  className="w-full border-none bg-transparent px-0 py-0 text-sm text-slate-800 outline-none"
                  value={entity.name}
                  onChange={(event) => onEntityFieldChange('name', event.target.value)}
                />
              </PropertyRow>
              <PropertyRow label="comment" isTall>
                <textarea
                  className="min-h-20 w-full border-none bg-transparent px-0 py-0 text-sm text-slate-800 outline-none"
                  value={entity.comment}
                  onChange={(event) => onEntityFieldChange('comment', event.target.value)}
                />
              </PropertyRow>
              <PropertyRow label="column count">{entity.columns.length}</PropertyRow>
              <PropertyRow label="related tables">{relatedEntityNames.length > 0 ? relatedEntityNames.join(', ') : '-'}</PropertyRow>
              <PropertyRow label="position">
                {Math.round(entity.position.x)}, {Math.round(entity.position.y)}
              </PropertyRow>
              <PropertyRow label="unique column visible">
                <label className="inline-flex items-center gap-2 text-sm text-slate-800">
                  <input checked={entity.isUniqueColumnVisible} type="checkbox" onChange={(event) => onEntityFieldChange('isUniqueColumnVisible', event.target.checked)} />
                  <span>Show UNIQUE column</span>
                </label>
              </PropertyRow>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function PropertyRow({ children, isTall = false, label }: React.PropsWithChildren<{ isTall?: boolean; label: string }>) {
  return (
    <>
      <div className={`bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 ${isTall ? 'flex items-start' : 'flex items-center'}`}>{label}</div>
      <div className={`bg-white px-3 py-2 text-sm text-slate-800 ${isTall ? '' : 'flex items-center'}`}>{children}</div>
    </>
  );
}

export default EntityPropertiesModal;
