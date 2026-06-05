import { MdClose } from 'react-icons/md';

import type { ErdEntity } from '@/features/erd';
import EntityPaletteModal from '@@editor/EntityPaletteModal';
import EntityPropertiesModal from '@@editor/EntityPropertiesModal';

type EditorModalsProps = {
  activeEntity: ErdEntity | null;
  activeEntityRelatedNames: string[];
  color: string;
  ddl: string;
  entityCount: number;
  isDdlOpen: boolean;
  isPaletteOpen: boolean;
  isPropertiesOpen: boolean;
  onCloseDdl: () => void;
  onClosePalette: () => void;
  onCloseProperties: () => void;
  onCopyDdl: () => void;
  onEntityFieldChange: (field: 'name' | 'comment' | 'isUniqueColumnVisible', value: string | boolean) => void;
  onSelectColor: (color: string) => void;
};

const EditorModals = ({
  activeEntity,
  activeEntityRelatedNames,
  color,
  ddl,
  entityCount,
  isDdlOpen,
  isPaletteOpen,
  isPropertiesOpen,
  onCloseDdl,
  onClosePalette,
  onCloseProperties,
  onCopyDdl,
  onEntityFieldChange,
  onSelectColor,
}: EditorModalsProps) => {
  return (
    <>
      <EntityPropertiesModal entity={activeEntity} isOpen={isPropertiesOpen} onClose={onCloseProperties} onEntityFieldChange={onEntityFieldChange} relatedEntityNames={activeEntityRelatedNames} />
      <EntityPaletteModal color={color} isOpen={isPaletteOpen} onClose={onClosePalette} onSelectColor={onSelectColor} />
      {isDdlOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-6">
          <div className="flex h-[min(78vh,720px)] w-[min(960px,92vw)] flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">DDL Preview</p>
                <p className="text-sm text-slate-500">{entityCount} entities</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700" onClick={onCopyDdl} type="button">
                  Copy DDL
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600" onClick={onCloseDdl} type="button">
                  <MdClose size="1.1em" />
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-auto bg-slate-950 p-4 text-xs leading-6 text-slate-200">{ddl || '-- No entities yet'}</pre>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default EditorModals;
