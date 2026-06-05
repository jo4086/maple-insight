import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import type { ErdColumn, ErdRelation } from '@/features/erd';
import { useEditorSession } from '@/ft-r/editor/hooks/useEditorSession';
import { NotFoundPage } from '@/pages';
import { CANVAS_HEIGHT, CANVAS_WIDTH, MINIMAP_WIDTH } from './constants';
import { useCanvasViewport } from './hooks/useCanvasViewport';
import { useEditorDocument } from './hooks/useEditorDocument';
import { useEntityDrag } from './hooks/useEntityDrag';
import { useEntitySelection } from './hooks/useEntitySelection';
import { createColumn, createIncrementedColumnName } from './model';
import EditorModals from './sections/EditorModals';
import MainWorkspace from './sections/MainWorkspace';
import OverlayPanels from './sections/OverlayPanels';

const ErdEditorPage = () => {
  const { erdId } = useParams();
  const navigate = useNavigate();
  const { registerSaveAction, setCanSave, setIsDirty, setTitle: setEditorTitle, title: editorTitle } = useEditorSession();

  const [isDdlOpen, setIsDdlOpen] = useState(false);
  const [entityPanelMode, setEntityPanelMode] = useState<'list' | null>(null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isMinimapVisible, setIsMinimapVisible] = useState(true);
  const [entityViewMode, setEntityViewMode] = useState<'detail' | 'overview'>('detail');
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [relationMode, setRelationMode] = useState<'none' | 'non-identifying' | 'identifying'>('none');
  const [relationCardinality, setRelationCardinality] = useState<'zero-or-many' | 'one' | 'zero-or-one' | 'many' | 'one-or-many' | 'one-only' | 'zero-or-one-or-many'>('one');
  const [isRelationPopoverOpen, setIsRelationPopoverOpen] = useState(false);

  const {
    ddl,
    documentRef,
    documentStatus,
    editorDocument,
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
    updateDocument,
    updateEntity,
  } = useEditorDocument({
    erdId,
    navigate,
    registerSaveAction,
    setCanSave,
    setEditorTitle,
    setIsDirty,
    sessionTitle: editorTitle,
  });

  const {
    canvasRef,
    handleCanvasPanStart,
    handleViewportAuxClick,
    handleViewportMouseDown,
    movementMode,
    moveViewportToCanvasPoint,
    panRef,
    setMovementMode,
    viewportMetrics,
    viewportRef,
    zoom,
    zoomIn,
    zoomOut,
    zoomRef,
  } = useCanvasViewport({ editorDocument });

  const { activeEntity, activeEntityRelatedNames, clearSelection, focusEntity, handleEntitySelect, selectedEntityIds, setSelectedEntityIds } = useEntitySelection({
    editorDocument,
    updateDocument,
    viewportRef,
    zoomRef,
  });

  const updateDocumentState = useCallback(
    (next: NonNullable<typeof editorDocument>) => {
      documentRef.current = next;
      updateDocument(() => next, false);
    },
    [documentRef, updateDocument],
  );

  const { draggingEntityId, handleEntityDragStart } = useEntityDrag({
    canvasRef,
    documentRef,
    movementMode,
    panRef,
    selectedEntityIds,
    updateDocumentState,
    viewportRef,
    zoomRef,
  });

  const handleCreateRelation = useCallback(
    (fromEntityId: string, toEntityId: string) => {
      if (relationMode === 'none') return;

      const activeRelationMode = relationMode;

      updateDocument((current) => {
        const fromEntity = current.entities.find((entity) => entity.id === fromEntityId);
        const toEntity = current.entities.find((entity) => entity.id === toEntityId);

        if (!fromEntity || !toEntity || fromEntity.id === toEntity.id) {
          return current;
        }

        const existingRelation = current.relations.find(
          (relation) =>
            relation.fromEntityId === fromEntityId &&
            relation.toEntityId === toEntityId &&
            relation.relationshipType === activeRelationMode &&
            relation.toCardinality === relationCardinality,
        );

        if (existingRelation) {
          return current;
        }

        const sourceColumn = fromEntity.columns.find((column) => column.keyType === 'pk') ?? fromEntity.columns[0] ?? null;
        let nextToColumnId: string | null = null;

        const nextEntities = current.entities.map((entity) => {
          if (entity.id !== toEntityId) return entity;

          if (!sourceColumn) return entity;

          const existingColumn =
            entity.columns.find(
              (column) => column.referencedEntityId === fromEntityId && column.referencedColumnId === sourceColumn.id && column.relationKeyType === activeRelationMode,
            ) ?? null;

          if (existingColumn) {
            nextToColumnId = existingColumn.id;
            return entity;
          }

          const nextName = createIncrementedColumnName(entity.columns, sourceColumn.name || 'fk');
          const nextColumn: ErdColumn = {
            ...createColumn(nextName, 'fk'),
            pName: sourceColumn.pName || nextName,
            domain: sourceColumn.domain,
            type: sourceColumn.type,
            enumValues: sourceColumn.enumValues,
            isAllowNull: false,
            isUnique: false,
            defaultValue: '',
            comment: `REFERENCES ${fromEntity.name}.${sourceColumn.name}`,
            relationKeyType: activeRelationMode,
            referencedEntityId: fromEntityId,
            referencedColumnId: sourceColumn.id,
            referencedRelationId: null,
          };

          nextToColumnId = nextColumn.id;

          return {
            ...entity,
            columns: [...entity.columns, nextColumn],
          };
        });

        const relationId = crypto.randomUUID();
        const nextRelations: ErdRelation[] = [
          ...current.relations,
          {
            id: relationId,
            fromEntityId,
            fromColumnId: sourceColumn?.id ?? null,
            toEntityId,
            toColumnId: nextToColumnId,
            fromCardinality: 'one',
            toCardinality: relationCardinality,
            relationshipType: activeRelationMode,
          },
        ];

        const entitiesWithRelationId =
          nextToColumnId == null
            ? nextEntities
            : nextEntities.map((entity) => {
                if (entity.id !== toEntityId) return entity;

                return {
                  ...entity,
                  columns: entity.columns.map((column) => {
                    if (column.id !== nextToColumnId) return column;

                    return {
                      ...column,
                      referencedRelationId: relationId,
                    };
                  }),
                };
              });

        return {
          ...current,
          entities: entitiesWithRelationId,
          relations: nextRelations,
        };
      });
    },
    [relationCardinality, relationMode, updateDocument],
  );

  const handleRelationAwareSelect = useCallback(
    (entityId: string, append: boolean) => {
      if (relationMode === 'none' || append) {
        handleEntitySelect(entityId, append);
        return;
      }

      if (selectedEntityIds.length === 0) {
        setSelectedEntityIds([entityId]);
        return;
      }

      const fromEntityId = selectedEntityIds[0];

      if (fromEntityId === entityId) {
        setSelectedEntityIds([entityId]);
        return;
      }

      handleCreateRelation(fromEntityId, entityId);
      setSelectedEntityIds([fromEntityId, entityId]);
      setRelationMode('none');
      setIsRelationPopoverOpen(false);
    },
    [handleCreateRelation, handleEntitySelect, relationMode, selectedEntityIds, setSelectedEntityIds],
  );

  if (documentStatus === 'missing') {
    return <NotFoundPage />;
  }

  if (documentStatus === 'loading' || !editorDocument) {
    return (
      <div className="flex w-full flex-1 flex-col px-5 py-12">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">문서를 불러오는 중입니다.</div>
      </div>
    );
  }

  return (
    <>
      <MainWorkspace
        canvasHeight={CANVAS_HEIGHT}
        canvasRef={canvasRef}
        canvasWidth={CANVAS_WIDTH}
        draggingEntityId={draggingEntityId}
        editorDocument={editorDocument}
        entityViewMode={entityViewMode}
        isRelationPopoverOpen={isRelationPopoverOpen}
        movementMode={movementMode}
        relationCardinality={relationCardinality}
        relationMode={relationMode}
        relations={editorDocument.relations}
        selectedEntityIds={selectedEntityIds}
        viewportRef={viewportRef}
        zoom={zoom}
        onAddColumn={handleAddColumn}
        onAddEntity={handleAddEntity}
        onAddMemo={handleAddMemo}
        onCanvasBackgroundMouseDown={clearSelection}
        onCanvasPanStart={handleCanvasPanStart}
        onColumnChange={handleColumnChange}
        onEntityDragStart={handleEntityDragStart}
        onEntityFieldChange={handleEntityFieldChange}
        onEntityMoveToTop={(entityId) => {
          const entity = editorDocument.entities.find((item) => item.id === entityId);
          if (!entity) return;
          handleEntityPositionChange(entityId, entity.position.x, entity.position.y);
        }}
        onEntitySelect={handleRelationAwareSelect}
        onMoveColumn={handleMoveColumn}
        onOpenPalette={(entityId) => {
          setSelectedEntityIds([entityId]);
          setIsPaletteOpen(true);
        }}
        onOpenProperties={(entityId) => {
          setSelectedEntityIds([entityId]);
          setIsPropertiesOpen(true);
        }}
        onRelationCardinalitySelect={setRelationCardinality}
        onRelationModeSelect={setRelationMode}
        onRemoveColumn={handleRemoveColumn}
        onRemoveEntity={(entityId) => handleRemoveEntity(entityId, clearSelection)}
        onResizeEntity={handleEntitySizeChange}
        onToggleRelationPopover={() => setIsRelationPopoverOpen((value) => !value)}
        onViewportAuxClick={handleViewportAuxClick}
        onViewportMouseDown={handleViewportMouseDown}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        setMovementMode={setMovementMode}
      />
      <OverlayPanels
        canvasHeight={CANVAS_HEIGHT}
        canvasWidth={CANVAS_WIDTH}
        editorDocument={editorDocument}
        entityPanelMode={entityPanelMode}
        entityViewMode={entityViewMode}
        isActionMenuOpen={isActionMenuOpen}
        isMinimapVisible={isMinimapVisible}
        selectedEntityIds={selectedEntityIds}
        viewportMetrics={viewportMetrics}
        width={MINIMAP_WIDTH}
        zoom={zoom}
        onCloseEntityPanel={() => setEntityPanelMode(null)}
        onEntityFieldChange={handleEntityFieldChange}
        onFocusEntity={focusEntity}
        onNavigateMinimap={moveViewportToCanvasPoint}
        onOpenDdl={() => setIsDdlOpen(true)}
        onOpenEntityList={() => setEntityPanelMode('list')}
        onRemoveEntity={(entityId) => handleRemoveEntity(entityId, (removedId) => setSelectedEntityIds((prev) => prev.filter((id) => id !== removedId)))}
        onToggleMenu={() => setIsActionMenuOpen((value) => !value)}
        onToggleMinimap={() => setIsMinimapVisible((value) => !value)}
        onToggleOverviewMode={() => {
          setEntityViewMode((value) => (value === 'detail' ? 'overview' : 'detail'));
        }}
      />
      <EditorModals
        activeEntity={activeEntity}
        activeEntityRelatedNames={activeEntityRelatedNames}
        color={activeEntity?.color ?? '#0f172a'}
        ddl={ddl}
        entityCount={editorDocument.entities.length}
        isDdlOpen={isDdlOpen}
        isPaletteOpen={isPaletteOpen}
        isPropertiesOpen={isPropertiesOpen}
        onCloseDdl={() => setIsDdlOpen(false)}
        onClosePalette={() => setIsPaletteOpen(false)}
        onCloseProperties={() => setIsPropertiesOpen(false)}
        onCopyDdl={() => navigator.clipboard.writeText(ddl)}
        onEntityFieldChange={(field, value) => {
          if (!activeEntity) return;
          handleEntityFieldChange(activeEntity.id, field, value);
        }}
        onSelectColor={(color) => {
          if (!activeEntity) return;
          updateEntity(activeEntity.id, (entity) => ({
            ...entity,
            color,
          }));
          setIsPaletteOpen(false);
        }}
      />
    </>
  );
};

export default ErdEditorPage;
