import type { RouteObject } from 'react-router-dom';

import { Layout, EmptyLayout } from '@/layout';
import { CharacterLayout } from '@/layout/CharacterLayout';
import { MainPage, LoginPage, NotFoundPage } from '@/pages';
import { CharacterMainPage } from '@/pages/CharacterPage';

const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { element: <MainPage />, path: '/' },
      { element: <CharacterLayout />, children: [{ element: <CharacterMainPage />, path: '/character' }] },
    ],
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
