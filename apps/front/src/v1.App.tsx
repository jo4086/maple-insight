import { Routes, Route } from 'react-router-dom';

import { DynamicFab } from './components';
import { Main, Gemini, Home, Mcp, Crow, User, Admin, Character, DashBoard, Skill } from './pages';

const fabItems = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'user', label: 'User', path: '/user' },
  { id: 'admin', label: 'Admin', path: '/admin' },
];

const adminItems = [
  { id: 'admin', label: '관리자', path: '/admin' },
  { id: 'user', label: '유저', path: '/user' },
  { id: 'layout', label: '레이아웃', path: '/admin' },
];
const categories = [
  {
    id: 'admin',
    label: '관리자',
    items: [
      { id: 'admin-home', label: '홈', path: '/admin' },
      { id: 'admin-users', label: '유저 관리', path: '/admin/users' },
    ],
  },
  {
    id: 'user',
    label: '유저',
    items: [
      { id: 'user-home', label: '홈', path: '/user' },
      { id: 'user-profile', label: '프로필', path: '/user/profile' },
    ],
  },
  {
    id: 'layout',
    label: '레이아웃',
    items: [
      { id: 'layout-dash', label: '대시보드', path: '/layout/dashboard' },
      { id: 'layout-theme', label: '테마', path: '/layout/theme' },
    ],
  },
];
const App = () => {
  return (
    <>
      <DynamicFab categories={categories} defaultCategoryId="admin" />
      <Routes>
        <Route path="/" element={<Main />} />

        <Route path="/admin" element={<Admin />}>
          <Route index element={<DashBoard />} />
          <Route path="character" element={<Character />} />
          <Route path="skill" element={<Skill />} />
        </Route>

        <Route path="/home" element={<Home />} />
        <Route path="/gemini" element={<Gemini />} />
        <Route path="/crow" element={<Crow />} />
        <Route path="/mcp" element={<Mcp />} />
        <Route path="/user" element={<User />} />
      </Routes>
    </>
  );
};

export default App;
