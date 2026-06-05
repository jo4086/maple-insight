import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';

import { buildPostgresDDL, createEmptyDocument, loadErdDocuments, type ErdColumn, type ErdDocument, type ErdEntity } from '@/features/erd';
import { estimateEntitySize } from '@/features/utils/entity-metrics';
import { findEmptyPosition } from '../geometry';
import { canAutoSaveDocument, createColumn, createEntity, createIncrementedColumnName, sortColumnsByPriority } from '../model';
import { persistDocument, saveCurrentDocumentSnapshot } from '../document-storage';

type DocumentStatus = 'loading' | 'ready' | 'missing';
type SetSessionTitle = (title: string) => void;
type RegisterSaveAction = (action: (() => void) | null) => void;
type SetBooleanState = (value: boolean) => void;

export type UseEditorDocumentOptions = {
  erdId?: string;
  navigate: NavigateFunction;
  registerSaveAction: RegisterSaveAction;
  setCanSave: SetBooleanState;
  setEditorTitle: SetSessionTitle;
  setIsDirty: SetBooleanState;
  sessionTitle: string;
};

export type UpdateDocument = (updater: (current: ErdDocument) => ErdDocument, shouldPersist?: boolean) => void;

export type UseEditorDocumentResult = {
  ddl: string;
  documentRef: React.MutableRefObject<ErdDocument | null>;
  documentStatus: DocumentStatus;
  editorDocument: ErdDocument | null;
  saveCurrentDocument: () => void;
  updateDocument: UpdateDocument;
  updateEntity: (entityId: string, updater: (entity: ErdEntity) => ErdEntity, shouldPersist?: boolean) => void;
  handleAddColumn: (entityId: string, keyType?: ErdColumn['keyType']) => void;
  handleAddEntity: () => void;
  handleAddMemo: () => void;
  handleColumnChange: <K extends keyof ErdColumn>(entityId: string, columnId: string, field: K, value: ErdColumn[K]) => void;
  handleEntityFieldChange: (entityId: string, field: 'name' | 'comment' | 'isUniqueColumnVisible', value: string | boolean) => void;
  handleEntityPositionChange: (entityId: string, x: number, y: number, shouldPersist?: boolean) => void;
  handleEntitySizeChange: (entityId: string, width: number, height: number) => void;
  handleMoveColumn: (entityId: string, fromColumnId: string, toColumnId: string) => void;
  handleRemoveColumn: (entityId: string, columnId: string) => void;
  handleRemoveEntity: (entityId: string, onAfterRemove?: (entityId: string) => void) => void;
};

export function useEditorDocument({
  erdId,
  navigate,
  registerSaveAction,
  setCanSave,
  setEditorTitle,
  setIsDirty,
  sessionTitle,
}: UseEditorDocumentOptions): UseEditorDocumentResult {
  const [editorDocument, setEditorDocument] = useState<ErdDocument | null>(null);
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus>('loading');
  const documentRef = useRef<ErdDocument | null>(null);
  const savedSnapshotRef = useRef<string | null>(null);
  const isPersistedRef = useRef(false);
  const isSyncingTitleRef = useRef(false);
  const titleRef = useRef('Untitled ERD');
  const documentId = editorDocument?.id ?? null;
  const documentTitle = editorDocument?.title ?? null;

  useEffect(() => {
    const documents = loadErdDocuments();

    if (erdId === 'new' || !erdId) {
      const next = createEmptyDocument();
      setEditorDocument(next);
      setDocumentStatus('ready');
      documentRef.current = next;
      isPersistedRef.current = false;
      savedSnapshotRef.current = null;
      return;
    }

    const found = documents.find((item) => item.id === erdId) ?? null;
    setEditorDocument(found);
    setDocumentStatus(found ? 'ready' : 'missing');
    documentRef.current = found;
    isPersistedRef.current = !!found;
    savedSnapshotRef.current = found ? JSON.stringify(found) : null;
  }, [erdId]);

  useEffect(() => {
    documentRef.current = editorDocument;
  }, [editorDocument]);

  useEffect(() => {
    if (!documentTitle) {
      isSyncingTitleRef.current = true;
      titleRef.current = 'Untitled ERD';
      setEditorTitle('Untitled ERD');
      return;
    }

    isSyncingTitleRef.current = true;
    titleRef.current = documentTitle;
    setEditorTitle(documentTitle);
  }, [documentId, documentTitle, setEditorTitle]);

  const applyDocument = useCallback((next: ErdDocument, shouldPersist = true) => {
    documentRef.current = next;
    setEditorDocument(next);

    if (!shouldPersist || !isPersistedRef.current || !canAutoSaveDocument(next)) return;

    persistDocument(next);
    savedSnapshotRef.current = JSON.stringify(next);
  }, []);

  const saveCurrentDocument = useCallback(() => {
    const current = documentRef.current;
    if (!current || !canAutoSaveDocument(current)) return;

    const next = {
      ...current,
      updatedAt: new Date().toISOString(),
    };
    saveCurrentDocumentSnapshot(next);

    documentRef.current = next;
    setEditorDocument(next);
    isPersistedRef.current = true;
    savedSnapshotRef.current = JSON.stringify(next);

    if (erdId === 'new' || !erdId) {
      navigate(`/erd/${next.id}`, { replace: true });
    }
  }, [erdId, navigate]);

  const updateDocument = useCallback<UpdateDocument>(
    (updater, shouldPersist = true) => {
      const current = documentRef.current;
      if (!current) return;

      applyDocument(
        {
          ...updater(current),
          updatedAt: new Date().toISOString(),
        },
        shouldPersist,
      );
    },
    [applyDocument],
  );

  useEffect(() => {
    registerSaveAction(() => saveCurrentDocument());
    return () => registerSaveAction(null);
  }, [registerSaveAction, saveCurrentDocument]);

  useEffect(() => {
    if (isSyncingTitleRef.current) {
      isSyncingTitleRef.current = false;
      return;
    }
    if (!editorDocument) return;
    if (sessionTitle === titleRef.current) return;

    titleRef.current = sessionTitle;
    updateDocument((current) => ({
      ...current,
      title: sessionTitle,
    }));
  }, [editorDocument, sessionTitle, updateDocument]);

  useEffect(() => {
    if (!editorDocument) {
      setIsDirty(false);
      setCanSave(false);
      return;
    }

    const isMeaningful = canAutoSaveDocument(editorDocument);
    const isDirty = savedSnapshotRef.current === null ? isMeaningful : savedSnapshotRef.current !== JSON.stringify(editorDocument);

    setIsDirty(isDirty);
    setCanSave(isMeaningful && isDirty);
  }, [editorDocument, setCanSave, setIsDirty]);

  const updateEntity = useCallback(
    (entityId: string, updater: (entity: ErdEntity) => ErdEntity, shouldPersist = true) => {
      updateDocument(
        (current) => ({
          ...current,
          entities: current.entities.map((entity) => {
            if (entity.id !== entityId) return entity;

            const nextEntity = updater(entity);
            return {
              ...nextEntity,
              columns: sortColumnsByPriority(nextEntity.columns),
            };
          }),
        }),
        shouldPersist,
      );
    },
    [updateDocument],
  );

  const handleAddEntity = useCallback(() => {
    updateDocument((current) => ({
      ...current,
      entities: (() => {
        const nextEntity = createEntity(current.entities.length);
        const estimatedSize = estimateEntitySize(nextEntity);

        return [
          ...current.entities,
          {
            ...nextEntity,
            size: estimatedSize,
            position: findEmptyPosition(current.entities, estimatedSize.width, estimatedSize.height),
          },
        ];
      })(),
    }));
  }, [updateDocument]);

  const handleAddMemo = useCallback(() => {
    updateDocument((current) => ({
      ...current,
      memos: [
        ...current.memos,
        {
          id: crypto.randomUUID(),
          title: 'New Memo',
          content: '메모 내용을 입력하세요.',
        },
      ],
    }));
  }, [updateDocument]);

  const handleEntityFieldChange = useCallback(
    (entityId: string, field: 'name' | 'comment' | 'isUniqueColumnVisible', value: string | boolean) => {
      updateEntity(entityId, (entity) => ({
        ...entity,
        [field]: value,
      }));
    },
    [updateEntity],
  );

  const handleEntityPositionChange = useCallback(
    (entityId: string, x: number, y: number, shouldPersist = true) => {
      updateEntity(
        entityId,
        (entity) => ({
          ...entity,
          position: { x, y },
        }),
        shouldPersist,
      );
    },
    [updateEntity],
  );

  const handleEntitySizeChange = useCallback(
    (entityId: string, width: number, height: number) => {
      updateEntity(entityId, (entity) => ({
        ...entity,
        size: { width, height },
      }));
    },
    [updateEntity],
  );

  const handleAddColumn = useCallback(
    (entityId: string, keyType: ErdColumn['keyType'] = null) => {
      updateEntity(entityId, (entity) => ({
        ...entity,
        columns: [
          ...entity.columns,
          (() => {
            const baseName = keyType === 'pk' ? 'pk' : 'name';
            const nextName = createIncrementedColumnName(entity.columns, baseName);

            return {
              ...createColumn(nextName, keyType),
              isAllowNull: keyType === 'pk' ? false : true,
              comment: keyType === 'pk' ? 'PRIMARY KEY' : '',
            };
          })(),
        ],
      }));
    },
    [updateEntity],
  );

  const handleColumnChange = useCallback(
    <K extends keyof ErdColumn>(entityId: string, columnId: string, field: K, value: ErdColumn[K]) => {
      updateEntity(entityId, (entity) => ({
        ...entity,
        columns: entity.columns.map((column) => {
          if (column.id !== columnId) return column;

          const nextColumn = { ...column, [field]: value } as ErdColumn;

          if (field === 'keyType' && value === 'pk') {
            nextColumn.isAllowNull = false;
          }

          if (field === 'keyType' && value !== 'fk') {
            nextColumn.relationKeyType = null;
          }

          if (nextColumn.keyType === 'pk') {
            nextColumn.isAllowNull = false;
          }

          return nextColumn;
        }),
      }));
    },
    [updateEntity],
  );

  const handleRemoveColumn = useCallback(
    (entityId: string, columnId: string) => {
      updateDocument((current) => {
        const relationIds = current.relations
          .filter((relation) => relation.fromColumnId === columnId || relation.toColumnId === columnId)
          .map((relation) => relation.id);

        if (relationIds.length === 0) {
          return {
            ...current,
            entities: current.entities.map((entity) => {
              if (entity.id !== entityId) return entity;

              return {
                ...entity,
                columns: entity.columns.filter((column) => column.id !== columnId),
              };
            }),
          };
        }

        const relationIdSet = new Set(relationIds);
        const columnsToRemove = new Set<string>([columnId]);

        current.relations.forEach((relation) => {
          if (!relationIdSet.has(relation.id)) return;
          if (relation.fromColumnId) columnsToRemove.add(relation.fromColumnId);
          if (relation.toColumnId) columnsToRemove.add(relation.toColumnId);
        });

        return {
          ...current,
          entities: current.entities.map((entity) => ({
            ...entity,
            columns: entity.columns.filter((column) => !columnsToRemove.has(column.id)),
          })),
          relations: current.relations.filter((relation) => !relationIdSet.has(relation.id)),
        };
      });
    },
    [updateDocument],
  );

  const handleMoveColumn = useCallback(
    (entityId: string, fromColumnId: string, toColumnId: string) => {
      updateEntity(entityId, (entity) => {
        const fromIndex = entity.columns.findIndex((column) => column.id === fromColumnId);
        const toIndex = entity.columns.findIndex((column) => column.id === toColumnId);

        if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
          return entity;
        }

        const nextColumns = [...entity.columns];
        const [moved] = nextColumns.splice(fromIndex, 1);
        nextColumns.splice(toIndex, 0, moved);

        return {
          ...entity,
          columns: nextColumns,
        };
      });
    },
    [updateEntity],
  );

  const handleRemoveEntity = useCallback(
    (entityId: string, onAfterRemove?: (entityId: string) => void) => {
      updateDocument((current) => ({
        ...current,
        entities: current.entities.filter((item) => item.id !== entityId),
        relations: current.relations.filter((relation) => relation.fromEntityId !== entityId && relation.toEntityId !== entityId),
      }));
      onAfterRemove?.(entityId);
    },
    [updateDocument],
  );

  const ddl = useMemo(() => {
    if (!editorDocument) return '';
    return buildPostgresDDL(editorDocument);
  }, [editorDocument]);

  return {
    ddl,
    documentRef,
    documentStatus,
    editorDocument,
    saveCurrentDocument,
    updateDocument,
    updateEntity,
    handleAddColumn,
    handleAddEntity,
    handleAddMemo,
    handleColumnChange,
    handleEntityFieldChange,
    handleEntityPositionChange,
    handleEntitySizeChange,
    handleMoveColumn,
    handleRemoveColumn,
    handleRemoveEntity,
  };
}
