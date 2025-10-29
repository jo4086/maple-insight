import type { NavItemProps } from '@/components';

export const navItems: NavItemProps[] = [
  { label: '대시보드', icon: 'x', path: '/admin' },
  {
    label: '캐릭터',
    icon: 're-user-line',
    path: '/admin/character',
  },
  { label: '스킬', icon: 'x', path: '/admin/skill' },
];

// const navItems: NavItemProps[] = useMemo(
//   () => [
//     { label: '대시보드', icon: 'x', path: '/admin' },
//     {
//       label: '캐릭터',
//       icon: 're-user-line',
//       path: '/admin/character',
//     },
//   ],
//   [],
// );

// const handleTabChange = (tab: string) => {
//   setActiveTab(tab);
// };

// const toggleSidebar = () => {
//   setIsCollapsed(!isCollapsed);
// };

// const navItems: NavItemProps[] = [{ label: '대시보드', icon: 'x', path: '/admin' }];

// const tabItems = [
//   { label: '캐릭터', icon: 'ri-user-line', path: '/admin/char' },
//   { label: '스킬', icon: 'ri-sword-line', path: '/admin/skill' },
//   { label: '분석', icon: 'ri-shield-line' },
//   { label: '시뮬레이터', icon: 'ri-gift-line' },
//   { label: '도감', icon: 'ri-trophy-line' },
//   { label: '설정', icon: 'ri-book-line' },
//   { name: '', icon: 'ri-settings-line' },
// ];

// const classNameMap: ClassNameProps = {
//   container: 'fixed right-[2rem] bottom-[2rem]',
//   button:
//     'w-40 h-12 rounded-md bg-black/50 text-white border-none cursor-pointer flex items-center justify-center text-[1.2rem] transition-all duration-300 ease-in-out hover:bg-black/70',
//   list: 'list-none p-0 m-0 absolute bottom-[60px] right-0 w-[150px] bg-white rounded shadow-md opacity-0 invisible translate-y-[10px] transition-all duration-300 ease-in-out',
// };

// useEffect(() => {
//   const current = navItems.find((item) => location.pathname.startsWith(item.path));
//   if (current) setActiveTab(current.label);
// }, [navItems, location.pathname]);
