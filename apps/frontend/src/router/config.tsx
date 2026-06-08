import type { RouteObject } from 'react-router-dom';

import { Layout, EmptyLayout } from '@/layout';
import { CharacterLayout } from '@/layout/CharacterLayout';
import { LoginPage, NotFoundPage, Home } from '@/pages';
import { AdminHome, AdminImportDetail, AdminImportNew, AdminImports } from '@/pages/admin';
import { CharacterMainPage } from '@/pages/CharacterPage';

const isAdminEnabled = import.meta.env.VITE_ENABLE_ADMIN === 'true';

const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { element: <Home />, path: '/' },
      { element: <CharacterLayout />, children: [{ element: <CharacterMainPage />, path: '/character' }] },
      ...(isAdminEnabled
        ? [
            { element: <AdminHome />, path: '/admin' },
            { element: <AdminImports />, path: '/admin/imports' },
            { element: <AdminImportNew />, path: '/admin/imports/new' },
            { element: <AdminImportDetail />, path: '/admin/imports/:importId' },
          ]
        : []),
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
