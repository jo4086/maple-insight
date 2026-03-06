import { type RouteObject } from 'react-router-dom';

import { Layout } from '@/layout';
import { Example1, Example2, Home, Main, NotFound, paths } from '@/pages';

const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      {
        path: paths.home,
        element: <Home />,
      },
      {
        path: paths.main,
        element: <Main />,
      },
      {
        path: paths.example1,
        element: <Example1 />,
      },
      {
        path: paths.example2,
        element: <Example2 />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
  // {
  //   path: '/',
  //   element: <Home />,
  // },
  // {
  //   path: '*',
  //   element: <NotFound />,
  // },
];

export default routes;
