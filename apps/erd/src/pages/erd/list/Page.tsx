import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Container from '@@baseUI/container';
import ConfirmDialog from '@/components/ConfirmDialog';
import { ErdDocumentGridCard, ErdDocumentListRow, ErdListPagination, ErdListToolbar } from '@@erd-list';
import { duplicateErdDocument, loadErdDocuments, removeErdDocument, type ErdDocument, updateErdDocumentThumbnail } from '@/features/erd';

const GRID_PAGE_SIZE = 6;
const LIST_PAGE_SIZE = 8;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const ErdListPage = () => {
  const [documents, setDocuments] = useState<ErdDocument[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setDocuments(loadErdDocuments());
  }, []);

  const pageSize = viewMode === 'grid' ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(documents.length / pageSize));
  const pagedDocuments = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    return documents.slice(startIndex, startIndex + pageSize);
  }, [currentPage, documents, pageSize, totalPages]);

  useEffect(() => {
    setCurrentPage((value) => Math.min(value, totalPages));
  }, [totalPages]);

  const handleDelete = (documentId: string) => {
    setPendingDeleteId(documentId);
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return;
    setDocuments(removeErdDocument(pendingDeleteId));
    setPendingDeleteId(null);
  };

  const handleDuplicate = (documentId: string) => {
    const duplicated = duplicateErdDocument(documentId);
    if (!duplicated) return;
    setDocuments(loadErdDocuments());
  };

  const handleThumbnailChange = async (documentId: string, file: File) => {
    const thumbnail = await readFileAsDataUrl(file);
    setDocuments(updateErdDocumentThumbnail(documentId, thumbnail));
  };

  return (
    <Container className="mx-auto w-full max-w-5xl flex-col gap-5 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Documents</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">ERD 목록</h1>
          <p className="mt-2 text-sm text-slate-500">문서를 카드형이나 목록형으로 보고, 썸네일과 복사본도 바로 관리할 수 있습니다.</p>
        </div>
        <Link to="/erd/new" className="rounded-lg bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-white">
          새 ERD
        </Link>
      </div>

      <ErdListToolbar
        count={documents.length}
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setViewMode(mode);
          setCurrentPage(1);
        }}
      />

      {documents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-medium text-slate-700">아직 저장된 ERD가 없습니다.</p>
          <p className="mt-2 text-sm text-slate-500">새 ERD를 만들고 저장하면 이 목록에 나타납니다.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pagedDocuments.map((document) => (
            <ErdDocumentGridCard key={document.id} document={document} onDelete={handleDelete} onDuplicate={handleDuplicate} onThumbnailChange={handleThumbnailChange} />
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {pagedDocuments.map((document) => (
            <ErdDocumentListRow key={document.id} document={document} onDelete={handleDelete} onDuplicate={handleDuplicate} onThumbnailChange={handleThumbnailChange} />
          ))}
        </div>
      )}

      {documents.length > 0 ? (
        <ErdListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onNextPage={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
          onPreviousPage={() => setCurrentPage((value) => Math.max(1, value - 1))}
        />
      ) : null}

      <ConfirmDialog
        cancelLabel="취소"
        confirmLabel="삭제"
        description={`"${documents.find((document) => document.id === pendingDeleteId)?.title ?? '이 ERD'}"를 삭제할까요? 이 작업은 되돌릴 수 없습니다.`}
        isOpen={pendingDeleteId !== null}
        title="ERD 삭제"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </Container>
  );
};

export default ErdListPage;
