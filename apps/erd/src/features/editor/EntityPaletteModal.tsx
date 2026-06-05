import { MdClose } from 'react-icons/md';

const COLORS = ['#0f172a', '#1d4ed8', '#065f46', '#9a3412', '#7c3aed', '#be123c', '#475569', '#0f766e'];

type EntityPaletteModalProps = {
  color: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
};

const EntityPaletteModal = ({ color, isOpen, onClose, onSelectColor }: EntityPaletteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 p-4">
      <div className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Palette</p>
            <p className="text-sm text-slate-500">엔티티 색상 선택</p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900" onClick={onClose} type="button">
            <MdClose size="1.15em" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3 px-4 py-4">
          {COLORS.map((item) => (
            <button
              key={item}
              className={`h-12 rounded-xl border ${item === color ? 'border-slate-950 ring-2 ring-slate-300' : 'border-slate-200'}`}
              style={{ backgroundColor: item }}
              onClick={() => onSelectColor(item)}
              type="button"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EntityPaletteModal;
