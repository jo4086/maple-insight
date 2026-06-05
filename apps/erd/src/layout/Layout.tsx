import Header from './Header';
import Footer from './Footer';
import Main from './Main';

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <header>
        <Header />
      </header>
      <main className="flex-1">
        <Main />
      </main>

      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;
