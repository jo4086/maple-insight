import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import { EditorLayout, Layout, EmptyLayout } from '@/layout';
import { ErdEditorPage, ErdListPage, HomePage, NotFoundPage, SamplePage } from '@/pages';
import EditorPage from '@/pages/editor';

const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { element: <HomePage />, path: '/' },
      { element: <ErdListPage />, path: '/erd' },
      { element: <SamplePage />, path: '/sample' },
    ],
  },
  {
    element: <EditorLayout />,
    children: [
      { element: <ErdEditorPage />, path: '/erd/new' },
      { element: <ErdEditorPage />, path: '/erd/:erdId' },
      { element: <Navigate replace to="/editor/new" />, path: '/editor' },
      { element: <EditorPage />, path: '/editor/new' },
    ],
  },
  {
    element: <EmptyLayout />,
    children: [{ element: <NotFoundPage />, path: '*' }],
  },
];

// const routes: RouteObject[] = [
//   {
//     element: <Layout />,
//     children: [
//       { element: <HomePage />, path: '/' },
//       // { element: <CharacterLayout />, children: [{ element: <CharacterMainPage />, path: '/character' }] },
//     ],
//   },
//   {
//     element: <EmptyLayout />,
//     children: [
//       // { element: <LoginPage />, path: '/login' },
//       // { element: <NotFoundPage />, path: '*' },
//     ],
//   },
// ];

export default routes;
