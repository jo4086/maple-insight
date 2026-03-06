import { Footer } from './Footer';
import { Header } from './Header';
import { Main } from './Main';

export function Layout() {
  return (
    <>
      <Header />

      <main>
        <Main />
      </main>

      <footer>
        <Footer />
      </footer>
    </>
  );
}
