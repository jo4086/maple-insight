import { type RouteObject } from 'react-router-dom';

import { AdminRoot, DashBoard, Main, User } from '@/pages';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Main />,
  },
  {
    path: '/user',
    element: <User />,
  },
  {
    path: '/admin',
    element: <AdminRoot />,
    children: [{ index: true, element: <DashBoard /> }],
  },
];

export default routes;
