import React from 'react';

import Footer from './Footer';
import Header from './Header';

const Layout = (props: { children: React.ReactNode }) => {
  return (
    <>
      <Header />

      <main> {props.children} </main>

      <Footer />
    </>
  );
};

export default Layout;
