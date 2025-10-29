import { type RouteObject } from 'react-router-dom';

// import { Character, Crow, DashBoard, Gemini, Home, Main, Mcp, Skill, User, AdminLayout } from '@/pages';
import { Character, Crow, Dashboard, Gemini, Home, Main, Mcp, Skill, User, Admin } from '@/pages';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Main />,
  },
  {
    path: 'admin',
    element: <Admin />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'character', element: <Character /> },
      { path: 'skill', element: <Skill /> },
    ],
  },
  {
    path: '/home',
    element: <Home />,
  },
  {
    path: '/gemini',
    element: <Gemini />,
  },
  {
    path: '/crow',
    element: <Crow />,
  },
  {
    path: '/mcp',
    element: <Mcp />,
  },
  {
    path: '/user',
    element: <User />,
  },
];

export default routes;
