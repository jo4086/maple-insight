// import { useState } from 'react';

// import './App.css';
import { Routes, Route } from 'react-router-dom';

import { Navigation } from './components';
import { Gemini, Home, Mcp, Crow, User } from './pages';

const App = () => {
  return (
    <>
      {/* <Navigation /> */}
      <Routes>
        <Route path="/" element={<User />} />
        <Route path="/gemini" element={<Gemini />} />
        <Route path="/crow" element={<Crow />} />
        <Route path="/mcp" element={<Mcp />} />
        <Route path="/user" element={<User />} />
      </Routes>
    </>
  );
};

export default App;
