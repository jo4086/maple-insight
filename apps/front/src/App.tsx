// import { useState } from 'react';

// import './App.css';
import { Routes, Route } from 'react-router-dom';

import { Navigation } from './components';
import { Main, Gemini, Home, Mcp, Crow, User } from './pages';

const App = () => {
  return (
    <>
      {/* <Navigation /> */}
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/home" element={<Home />} />
        <Route path="/gemini" element={<Gemini />} />
        <Route path="/crow" element={<Crow />} />
        <Route path="/mcp" element={<Mcp />} />
        <Route path="/user" element={<User />} />
      </Routes>
    </>
  );
};

export default App;
