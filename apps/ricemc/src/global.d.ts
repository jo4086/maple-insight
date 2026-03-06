// import type React from 'react';
import type { NavigateFunction } from 'react-router-dom';

declare global {
  interface Window {
    REACT_APP_NAVIGATE?: NavigateFunction;
  }
}

export {};
