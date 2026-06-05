import { useContext } from 'react';

import { EditorSessionContext } from '../context/EditorSessionContext';

export function useEditorSession() {
  const context = useContext(EditorSessionContext);

  if (!context) {
    throw new Error('useErdEditorSession must be used within ErdEditorSessionProvider');
  }

  return context;
}
