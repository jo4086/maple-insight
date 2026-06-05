import Footer from '../Footer';
import Main from '../Main';
import EditorHeader from './EditorHeader';
import EditorSessionProvider from '@/ft-r/editor/context/EditorSessionProvider';

const EditorLayout = () => {
  return (
    <EditorSessionProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <header>
          <EditorHeader />
        </header>
        <main className="min-h-0 flex-1 overflow-hidden">
          <Main className="h-full overflow-hidden" />
        </main>
        <footer>
          <Footer />
        </footer>
      </div>
    </EditorSessionProvider>
  );
};

export default EditorLayout;
