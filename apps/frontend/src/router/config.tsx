import type { RouteObject } from 'react-router-dom';

import { Layout, EmptyLayout } from '@/layout';
import { MainPage, LoginPage, NotFoundPage } from '@/pages';

const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [{ element: <MainPage />, path: '/' }],
  },
  {
    element: <EmptyLayout />,
    children: [
      { element: <LoginPage />, path: '/login' },
      { element: <NotFoundPage />, path: '*' },
    ],
  },
];

export default routes;
