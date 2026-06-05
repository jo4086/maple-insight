import { MdHome, MdOutlineAddBox, MdTableChart } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';

import Container from '@@baseUI/container';

const Header = () => {
  const navigate = useNavigate();

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
        </div>

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
    </Container>
  );
};
export default Header;
