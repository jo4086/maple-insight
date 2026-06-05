import { MdMap, MdOutlineCode, MdOutlineFormatListBulleted, MdViewAgenda } from 'react-icons/md';

type EditorActionMenuProps = {
  isMenuOpen: boolean;
  isMinimapVisible: boolean;
  isOverviewMode: boolean;
  onToggleMenu: () => void;
  onToggleMinimap: () => void;
  onOpenDdl: () => void;
  onOpenEntityList: () => void;
  onToggleOverviewMode: () => void;
};

const actionButtonClass =
  'flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xl transition-colors hover:bg-slate-50 hover:text-slate-950';

const EditorActionMenu = ({
  isMenuOpen,
  isMinimapVisible,
  isOverviewMode,
  onToggleMenu,
  onToggleMinimap,
  onOpenDdl,
  onOpenEntityList,
  onToggleOverviewMode,
}: EditorActionMenuProps) => {
  return (
    <div className="fixed right-4 top-16 z-40 flex flex-col items-end gap-2">
      <button className={actionButtonClass} onClick={onToggleMenu} type="button">
        <MdOutlineFormatListBulleted size="1.25em" />
      </button>
      {isMenuOpen ? (
        <>
          <button className={actionButtonClass} onClick={onToggleMinimap} title="Minimap" type="button">
            <MdMap size="1.15em" className={isMinimapVisible ? 'text-sky-600' : ''} />
          </button>
          <button className={actionButtonClass} onClick={onOpenEntityList} title="Entity List" type="button">
            <MdOutlineFormatListBulleted size="1.15em" />
          </button>
          <button className={actionButtonClass} onClick={onOpenDdl} title="DDL Preview" type="button">
            <MdOutlineCode size="1.15em" />
          </button>
          <button className={actionButtonClass} onClick={onToggleOverviewMode} title="Entity Overview" type="button">
            <MdViewAgenda size="1.15em" className={isOverviewMode ? 'text-sky-600' : ''} />
          </button>
        </>
      ) : null}
    </div>
  );
};

export default EditorActionMenu;
