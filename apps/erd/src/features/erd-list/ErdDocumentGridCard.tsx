import { useRef } from 'react';
import { MdContentCopy, MdDeleteOutline, MdImage } from 'react-icons/md';
import { Link } from 'react-router-dom';

import type { ErdDocument } from '@/features/erd';

type ErdDocumentGridCardProps = {
  document: ErdDocument;
  onDelete: (documentId: string) => void;
  onDuplicate: (documentId: string) => void;
  onThumbnailChange: (documentId: string, file: File) => void;
};

const ErdDocumentGridCard = ({ document, onDelete, onDuplicate, onThumbnailChange }: ErdDocumentGridCardProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <Link className="flex min-h-0 flex-1 flex-col" to={`/erd/${document.id}`}>
        <div className="relative aspect-[1.618/1] overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_40%),linear-gradient(135deg,#0f172a,#1e293b_55%,#334155)]">
          {document.thumbnail ? (
            <img alt={document.title} className="h-full w-full object-cover" src={document.thumbnail} />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-5">
              <div className="grid w-full max-w-[240px] gap-2.5 rounded-[22px] border border-white/10 bg-white/6 p-3.5 backdrop-blur-sm">
                <div className="grid grid-cols-[1.3fr_1fr] gap-2">
                  <div className="h-14 rounded-2xl bg-white/85" />
                  <div className="grid gap-2">
                    <div className="h-6 rounded-xl bg-sky-200/80" />
                    <div className="h-6 rounded-xl bg-slate-200/85" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-7 rounded-xl bg-white/75" />
                  <div className="h-7 rounded-xl bg-white/60" />
                  <div className="h-7 rounded-xl bg-sky-100/80" />
                </div>
              </div>
            </div>
          )}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-white/88 px-2 py-0.5 text-[10px] font-semibold text-slate-700 backdrop-blur-sm">{document.entities.length} entities</span>
              <span className="rounded-full bg-white/88 px-2 py-0.5 text-[10px] font-semibold text-slate-700 backdrop-blur-sm">{document.relations.length} relations</span>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/45 to-transparent" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-between px-4 py-3.5">
          <div>
            <h2 className="line-clamp-2 text-base font-semibold leading-tight text-slate-950">{document.title}</h2>
          </div>
          <p className="mt-2.5 text-[11px] text-slate-500">Updated {new Date(document.updatedAt).toLocaleString()}</p>
        </div>
      </Link>

      <div className="flex items-center justify-between border-t border-slate-200 px-3.5 py-2">
        <div className="flex items-center gap-1">
          <button className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900" onClick={() => inputRef.current?.click()} title="Thumbnail" type="button">
            <MdImage size="1em" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900" onClick={() => onDuplicate(document.id)} title="Duplicate" type="button">
            <MdContentCopy size="1em" />
          </button>
        </div>
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => onDelete(document.id)} title="Delete" type="button">
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

export default ErdDocumentGridCard;
