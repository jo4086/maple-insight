import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';

import routes from './config';

export function AppRoutes(): ReactElement | null {
  return useRoutes(routes);
}
