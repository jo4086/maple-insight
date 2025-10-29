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
