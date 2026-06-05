import { createContext } from 'react';
import type { CanvasViewport } from '@/ft-r/canvas';
import type { ErdDocument } from '@/ft-r/document';

export type EditorMovementMode = 'free' | 'grid';
export type EditorToolMode = 'select' | 'add-entity' | 'add-memo' | 'add-relation';

export type ErdEditorSessionContextValue = {
  canSave: boolean;
  editorDocument: ErdDocument;
  movementMode: EditorMovementMode;
  isDirty: boolean;
  resetSession: () => void;
  showMinimap: boolean;
  setEditorDocument: (value: ErdDocument | ((current: ErdDocument) => ErdDocument)) => void;
  setShowMinimap: (value: boolean) => void;
  setMovementMode: (mode: EditorMovementMode) => void;
  setToolMode: (mode: EditorToolMode) => void;
  registerSaveAction: (action: (() => void) | null) => void;
  requestSave: () => void;
  setCanSave: (value: boolean) => void;
  setIsDirty: (value: boolean) => void;
  setTitle: (value: string) => void;
  setViewport: (value: CanvasViewport | ((current: CanvasViewport) => CanvasViewport)) => void;
  setZoom: (value: number | ((current: number) => number)) => void;
  title: string;
  toolMode: EditorToolMode;
  viewport: CanvasViewport;
  zoom: number;
};

export const EditorSessionContext = createContext<ErdEditorSessionContextValue | null>(null);
