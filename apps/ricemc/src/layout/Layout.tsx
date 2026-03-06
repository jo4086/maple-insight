import { Outlet } from 'react-router-dom';

import Footer from './Footer';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-lvh flex flex-col w-full">
      {/* Header는 컨테이너 안 */}
      <header className="w-full">
        <div className="mx-auto max-w-[1080px] px-4">
          <Header />
        </div>
      </header>

      {/* Main은 full width로 열어두기 */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Footer도 컨테이너 안 */}
      <footer className="w-full">
        <div className="mx-auto max-w-[1080px] px-4">
          <Footer />
        </div>
      </footer>
    </div>
  );
  return (
    <div className="min-h-lvh flex flex-col max-w-[1080px] m-auto">
      <Header />
      <main className="flex-1 w-full max-w-7xl flex justify-center border m-auto">
        {/* 여기서 Home 렌더 */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
