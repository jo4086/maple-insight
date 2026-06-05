import type { ErdDocument } from '@/features/erd';
import { loadErdDocuments, saveErdDocuments } from '@/features/erd';

export function persistDocument(next: ErdDocument) {
  const documents = loadErdDocuments();
  saveErdDocuments(documents.map((item) => (item.id === next.id ? next : item)));
}

export function saveCurrentDocumentSnapshot(next: ErdDocument) {
  const documents = loadErdDocuments();
  const exists = documents.some((item) => item.id === next.id);

  saveErdDocuments(exists ? documents.map((item) => (item.id === next.id ? next : item)) : [next, ...documents]);
}
