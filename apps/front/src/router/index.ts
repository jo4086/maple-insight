import { useEffect } from 'react';
import { useNavigate, useRoutes } from 'react-router-dom';
import type { NavigateFunction } from 'react-router-dom';

// INFO: route file
import routes from './config';

let navigateResolver: (navigate: ReturnType<typeof useNavigate>) => void;

export const navigatePromise = new Promise<NavigateFunction>((resolve) => {
  navigateResolver = resolve;
});

export function AppRoutes() {
  const element = useRoutes(routes);
  const navigate = useNavigate();
  useEffect(() => {
    window.REACT_APP_NAVIGATE = navigate;
    navigateResolver(navigate);
  }, [navigate]);
  return element;
}
