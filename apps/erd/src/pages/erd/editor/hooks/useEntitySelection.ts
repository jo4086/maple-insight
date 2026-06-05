import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ErdDocument, ErdEntity } from '@/features/erd';
import type { UpdateDocument } from './useEditorDocument';

type UseEntitySelectionOptions = {
  editorDocument: ErdDocument | null;
  updateDocument: UpdateDocument;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  zoomRef: React.MutableRefObject<number>;
};

type UseEntitySelectionResult = {
  activeEntity: ErdEntity | null;
  activeEntityRelatedNames: string[];
  clearSelection: () => void;
  focusEntity: (entityId: string) => void;
  handleEntitySelect: (entityId: string, append: boolean) => void;
  selectedEntityIds: string[];
  setSelectedEntityIds: React.Dispatch<React.SetStateAction<string[]>>;
};

export function useEntitySelection({
  editorDocument,
  updateDocument,
  viewportRef,
  zoomRef,
}: UseEntitySelectionOptions): UseEntitySelectionResult {
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([]);

  useEffect(() => {
    if (!editorDocument) {
      setSelectedEntityIds([]);
    }
  }, [editorDocument?.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' || selectedEntityIds.length === 0) return;

      const activeTag = window.document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;

      updateDocument((current) => ({
        ...current,
        entities: current.entities.filter((entity) => !selectedEntityIds.includes(entity.id)),
      }));
      setSelectedEntityIds([]);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEntityIds, updateDocument]);

  const handleEntitySelect = useCallback((entityId: string, append: boolean) => {
    setSelectedEntityIds((prev) => {
      if (append) {
        return prev.includes(entityId) ? prev.filter((id) => id !== entityId) : [...prev, entityId];
      }

      return prev.length === 1 && prev[0] === entityId ? prev : [entityId];
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedEntityIds([]);
  }, []);

  const focusEntity = useCallback(
    (entityId: string) => {
      const entity = editorDocument?.entities.find((item) => item.id === entityId);
      const viewport = viewportRef.current;

      if (!entity || !viewport) return;

      const nextLeft = Math.max(0, entity.position.x * zoomRef.current - 80);
      const nextTop = Math.max(0, entity.position.y * zoomRef.current - 80);

      viewport.scrollTo({
        left: nextLeft,
        top: nextTop,
        behavior: 'smooth',
      });
      setSelectedEntityIds([entityId]);
    },
    [editorDocument, viewportRef, zoomRef],
  );

  const activeEntity = useMemo(() => {
    if (!editorDocument) return null;
    return editorDocument.entities.find((entity) => entity.id === selectedEntityIds[0]) ?? null;
  }, [editorDocument, selectedEntityIds]);

  const activeEntityRelatedNames = useMemo(() => {
    if (!editorDocument || !activeEntity) return [];

    return Array.from(
      new Set(
        editorDocument.relations
          .filter((relation) => relation.fromEntityId === activeEntity.id || relation.toEntityId === activeEntity.id)
          .map((relation) => (relation.fromEntityId === activeEntity.id ? relation.toEntityId : relation.fromEntityId))
          .map((entityId) => editorDocument.entities.find((entity) => entity.id === entityId)?.name)
          .filter((value): value is string => Boolean(value)),
      ),
    );
  }, [activeEntity, editorDocument]);

  return {
    activeEntity,
    activeEntityRelatedNames,
    clearSelection,
    focusEntity,
    handleEntitySelect,
    selectedEntityIds,
    setSelectedEntityIds,
  };
}
