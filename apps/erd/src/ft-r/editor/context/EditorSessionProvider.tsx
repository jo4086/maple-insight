import type { PropsWithChildren } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';

import type { CanvasViewport } from '@/ft-r/canvas';
import { createDefaultDocument } from '@/ft-r/document';
import { EditorSessionContext, type ErdEditorSessionContextValue } from './EditorSessionContext';

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2;
const INITIAL_VIEWPORT: CanvasViewport = {
  scrollLeft: 0,
  scrollTop: 0,
  zoom: 1,
};
const INITIAL_MOVEMENT_MODE = 'grid' as const;
const INITIAL_TOOL_MODE = 'select' as const;

const EditorSessionProvider = ({ children }: PropsWithChildren) => {
  const [title, setTitle] = useState('Untitled ERD');
  const [editorDocument, setEditorDocumentState] = useState(createDefaultDocument);
  const [isDirty, setIsDirty] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [movementMode, setMovementMode] = useState<'free' | 'grid'>(INITIAL_MOVEMENT_MODE);
  const [toolMode, setToolMode] = useState<'select' | 'add-entity' | 'add-memo' | 'add-relation'>(INITIAL_TOOL_MODE);
  const [viewport, setViewportState] = useState<CanvasViewport>(INITIAL_VIEWPORT);
  const saveActionRef = useRef<(() => void) | null>(null);

  const resetSession = useCallback(() => {
    setTitle('Untitled ERD');
    setEditorDocumentState(createDefaultDocument());
    setIsDirty(false);
    setCanSave(false);
    setShowMinimap(true);
    setMovementMode(INITIAL_MOVEMENT_MODE);
    setToolMode(INITIAL_TOOL_MODE);
    setViewportState(INITIAL_VIEWPORT);
    saveActionRef.current = null;
  }, []);

  const value = useMemo<ErdEditorSessionContextValue>(
    () => ({
      canSave,
      editorDocument,
      movementMode,
      isDirty,
      resetSession,
      showMinimap,
      setEditorDocument: (value) => {
        setEditorDocumentState((currentDocument) => {
          return typeof value === 'function' ? value(currentDocument) : value;
        });
      },
      setShowMinimap,
      setMovementMode,
      setToolMode,
      registerSaveAction: (action) => {
        saveActionRef.current = action;
      },
      requestSave: () => {
        saveActionRef.current?.();
      },
      setCanSave,
      setIsDirty,
      setTitle,
      setViewport: (value) => {
        setViewportState((currentViewport) => {
          return typeof value === 'function' ? value(currentViewport) : value;
        });
      },
      setZoom: (value) => {
        setViewportState((currentViewport) => {
          const currentZoom = currentViewport.zoom;
          const nextZoom = typeof value === 'function' ? value(currentZoom) : value;

          return {
            ...currentViewport,
            zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom)),
          };
        });
      },
      title,
      toolMode,
      viewport,
      zoom: viewport.zoom,
    }),
    [canSave, editorDocument, isDirty, movementMode, resetSession, showMinimap, title, toolMode, viewport],
  );

  return <EditorSessionContext.Provider value={value}>{children}</EditorSessionContext.Provider>;
};

export default EditorSessionProvider;
