import { createContext } from 'react';

export type ErdEditorSessionContextValue = {
  canSave: boolean;
  isDirty: boolean;
  registerSaveAction: (action: (() => void) | null) => void;
  requestSave: () => void;
  setCanSave: (value: boolean) => void;
  setIsDirty: (value: boolean) => void;
  setTitle: (value: string) => void;
  title: string;
};

export const EditorSessionContext = createContext<ErdEditorSessionContextValue | null>(null);
