// import { useState } from 'react';

import './App.css';
import { Routes, Route } from 'react-router-dom';

import { Gemini, Home } from './pages';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/gemini" element={<Gemini />} />
    </Routes>
  );
};

export default App;
