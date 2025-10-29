import type React from 'react';
import type { NavigateFunction } from 'react-router-dom';

declare global {
  type BaseComponent<T extends keyof JSX.IntrinsicElements> = React.ComponentProps<T>;

  interface Window {
    REACT_APP_NAVIGATE?: NavigateFunction;
  }
}

export {};
