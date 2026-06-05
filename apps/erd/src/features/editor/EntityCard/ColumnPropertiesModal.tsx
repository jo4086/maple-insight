import { MdClose } from 'react-icons/md';
import { createPortal } from 'react-dom';

import type { ErdColumn } from '@/features/erd';

type ColumnPropertiesModalProps = {
  column: ErdColumn | null;
  isOpen: boolean;
  onChange: <K extends keyof ErdColumn>(field: K, value: ErdColumn[K]) => void;
  onClose: () => void;
};

export function ColumnPropertiesModal({ column, isOpen, onChange, onClose }: ColumnPropertiesModalProps) {
  if (!isOpen || !column) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/28 p-3">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Column Properties</p>
            <p className="text-sm text-slate-500">선택된 row 속성 수정</p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900" onClick={onClose} type="button">
            <MdClose size="1.15em" />
          </button>
        </div>
        <div className="overflow-hidden rounded-b-2xl border-t border-slate-200">
          <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-px bg-slate-200">
            <PropertyRow label="kind">
              <select
                className="w-full border-none bg-transparent text-sm text-slate-800 outline-none"
                value={column.keyType ?? 'general'}
                onChange={(event) => onChange('keyType', event.target.value === 'general' ? null : (event.target.value as ErdColumn['keyType']))}
              >
                <option value="general">General</option>
                <option value="pk">PK</option>
                <option value="fk">FK</option>
              </select>
            </PropertyRow>
            <PropertyRow label="fk type">
              <select
                className="w-full border-none bg-transparent text-sm text-slate-800 outline-none disabled:text-slate-400"
                disabled={column.keyType !== 'fk'}
                value={column.relationKeyType ?? 'non-identifying'}
                onChange={(event) => onChange('relationKeyType', event.target.value as ErdColumn['relationKeyType'])}
              >
                <option value="non-identifying">Non-identifying</option>
                <option value="identifying">Identifying</option>
              </select>
            </PropertyRow>
            <PropertyRow label="name">
              <input className="w-full border-none bg-transparent text-sm text-slate-800 outline-none" value={column.name} onChange={(event) => onChange('name', event.target.value)} />
            </PropertyRow>
            <PropertyRow label="pname">
              <input className="w-full border-none bg-transparent text-sm text-slate-800 outline-none" value={column.pName} onChange={(event) => onChange('pName', event.target.value)} />
            </PropertyRow>
            <PropertyRow label="type">
              <input className="w-full border-none bg-transparent text-sm text-slate-800 outline-none" value={column.type} onChange={(event) => onChange('type', event.target.value)} />
            </PropertyRow>
            <PropertyRow label="allow null">
              <label className="inline-flex items-center gap-2 text-sm text-slate-800">
                <input checked={column.isAllowNull} disabled={column.keyType === 'pk'} type="checkbox" onChange={(event) => onChange('isAllowNull', event.target.checked)} />
                <span>Is Allow null</span>
              </label>
            </PropertyRow>
            <PropertyRow label="default value">
              <input className="w-full border-none bg-transparent text-sm text-slate-800 outline-none" value={column.defaultValue} onChange={(event) => onChange('defaultValue', event.target.value)} />
            </PropertyRow>
            <PropertyRow label="comment" isTall>
              <textarea className="min-h-28 w-full border-none bg-transparent text-sm text-slate-800 outline-none" value={column.comment} onChange={(event) => onChange('comment', event.target.value)} />
            </PropertyRow>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function PropertyRow({ children, isTall = false, label }: React.PropsWithChildren<{ isTall?: boolean; label: string }>) {
  return (
    <>
      <div className={`bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 ${isTall ? 'flex items-start' : 'flex items-center'}`}>{label}</div>
      <div className={`bg-white px-3 py-2 ${isTall ? '' : 'flex items-center'}`}>{children}</div>
    </>
  );
}
