import { useEffect } from 'react';
import CanvasSection from './sections/CanvasSection';
import LeftToolbarSection from './sections/LeftToolbarSection';
import PropertyModalSection from './sections/PropertyModalSection';
import RightActionsSection from './sections/RightActionsSection';
import { useEditorSession } from '@/ft-r/editor/hooks/useEditorSession';

const EditorPage = () => {
  const { resetSession } = useEditorSession();

  useEffect(() => {
    resetSession();
  }, [resetSession]);

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-2 overflow-hidden px-3 py-2">
      <section className="flex min-h-0 flex-1 items-stretch gap-2 overflow-hidden">
        <LeftToolbarSection />
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          <CanvasSection />
          <RightActionsSection />
          <PropertyModalSection />
        </div>
      </section>
    </div>
  );
};

export default EditorPage;
