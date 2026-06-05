import { useMemo, useRef, useState } from 'react';

import { EditorSessionContext, type ErdEditorSessionContextValue } from '../context/EditorSessionContext';

const EditorSessionProvider = ({ children }: React.PropsWithChildren) => {
  const [title, setTitle] = useState('Untitled ERD');
  const [isDirty, setIsDirty] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const saveActionRef = useRef<(() => void) | null>(null);

  const value = useMemo<ErdEditorSessionContextValue>(
    () => ({
      canSave,
      isDirty,
      registerSaveAction: (action) => {
        saveActionRef.current = action;
      },
      requestSave: () => {
        saveActionRef.current?.();
      },
      setCanSave,
      setIsDirty,
      setTitle,
      title,
    }),
    [canSave, isDirty, title],
  );

  return <EditorSessionContext.Provider value={value}>{children}</EditorSessionContext.Provider>;
};

export default EditorSessionProvider;
