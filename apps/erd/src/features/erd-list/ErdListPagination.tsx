import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

type ErdListPaginationProps = {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
};

const ErdListPagination = ({ currentPage, totalPages, onNextPage, onPreviousPage }: ErdListPaginationProps) => {
  return (
    <div className="flex items-center justify-center gap-2 pt-1">
      <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-35" disabled={currentPage <= 1} onClick={onPreviousPage} type="button">
        <MdChevronLeft size="1.2em" />
      </button>
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600">
        {currentPage} / {totalPages}
      </div>
      <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-35" disabled={currentPage >= totalPages} onClick={onNextPage} type="button">
        <MdChevronRight size="1.2em" />
      </button>
    </div>
  );
};

export default ErdListPagination;
