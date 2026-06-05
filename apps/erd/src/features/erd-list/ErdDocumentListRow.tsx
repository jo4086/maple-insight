import { useRef } from 'react';
import { MdContentCopy, MdDeleteOutline, MdImage } from 'react-icons/md';
import { Link } from 'react-router-dom';

import type { ErdDocument } from '@/features/erd';

type ErdDocumentListRowProps = {
  document: ErdDocument;
  onDelete: (documentId: string) => void;
  onDuplicate: (documentId: string) => void;
  onThumbnailChange: (documentId: string, file: File) => void;
};

const ErdDocumentListRow = ({ document, onDelete, onDuplicate, onThumbnailChange }: ErdDocumentListRowProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <article className="flex items-stretch gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
      <Link className="flex min-w-0 flex-1 items-center gap-4" to={`/erd/${document.id}`}>
        <div className="relative aspect-[1.618/1] w-[136px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-[linear-gradient(135deg,#dbeafe,#eff6ff)]">
          {document.thumbnail ? (
            <img alt={document.title} className="h-full w-full object-cover" src={document.thumbnail} />
          ) : (
            <div className="grid h-full w-full grid-cols-3 gap-1.5 p-3">
              <div className="rounded-lg bg-white/95" />
              <div className="rounded-lg bg-sky-100" />
              <div className="rounded-lg bg-slate-200" />
            </div>
          )}
          <div className="absolute inset-x-0 top-0 flex items-start gap-1 p-2">
            <span className="rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700">{document.entities.length} entities</span>
            <span className="rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700">{document.relations.length} relations</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[15px] font-semibold text-slate-950">{document.title}</h2>
          <p className="mt-1.5 text-[11px] text-slate-500">Updated {new Date(document.updatedAt).toLocaleString()}</p>
        </div>
        <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{document.entities.length} entities</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{document.relations.length} relations</span>
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-1">
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900" onClick={() => inputRef.current?.click()} title="Thumbnail" type="button">
          <MdImage size="1em" />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900" onClick={() => onDuplicate(document.id)} title="Duplicate" type="button">
          <MdContentCopy size="1em" />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => onDelete(document.id)} title="Delete" type="button">
          <MdDeleteOutline size="1.05em" />
        </button>
        <input
          ref={inputRef}
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            onThumbnailChange(document.id, file);
            event.target.value = '';
          }}
          type="file"
        />
      </div>
    </article>
  );
};

export default ErdDocumentListRow;
