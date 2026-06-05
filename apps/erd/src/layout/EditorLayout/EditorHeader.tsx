import { MdHome, MdOutlineAddBox, MdSave, MdTableChart } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';

import Container from '@@baseUI/container';
import { useEditorSession } from '@/ft-r/editor/hooks/useEditorSession';

const EditorHeader = () => {
  const navigate = useNavigate();
  const { canSave, isDirty, requestSave, setTitle, title } = useEditorSession();

  return (
    <Container className="w-full border-b border-slate-200 px-0">
      <div className="flex w-full items-center justify-between gap-3 px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            className="flex cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900"
            onClick={() => navigate('/')}
            type="button"
          >
            ERD Lab
          </button>
          <input
            className="min-w-0 flex-1 border-none bg-transparent text-sm font-semibold text-slate-900 outline-none"
            placeholder="Untitled ERD"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`flex h-8 items-center gap-1 rounded-md border px-2 text-xs font-medium transition-colors ${
              canSave ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-400'
            }`}
            disabled={!canSave}
            onClick={requestSave}
            type="button"
          >
            <MdSave size="1.05em" />
            <span>{isDirty ? 'Save' : 'Saved'}</span>
          </button>

          <nav className="flex items-center gap-1 text-slate-600">
            <Link className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 hover:text-slate-900" title="Home" to="/">
              <MdHome size="1.1em" />
            </Link>
            <Link className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 hover:text-slate-900" title="ERDs" to="/erd">
              <MdTableChart size="1.1em" />
            </Link>
            <Link className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white hover:bg-slate-700" title="New ERD" to="/erd/new">
              <MdOutlineAddBox size="1.1em" />
            </Link>
          </nav>
        </div>
      </div>
    </Container>
  );
};

export default EditorHeader;
