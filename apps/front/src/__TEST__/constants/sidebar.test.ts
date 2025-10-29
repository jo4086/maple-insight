interface SidebarSubItem {
  id: string;
  label: string;
  path: string;
}

interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  subItems?: SidebarSubItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  isCollapsed: boolean;
  onToggle: () => void;
  onAddItem?: () => void;
  className?: string;
}

export const sidebarItems: SidebarItem[] = [
  { id: '1', label: '넘버1', icon: '아이콘1', path: '/admin' },
  { id: '2', label: '넘버2', icon: '아이콘2', path: '/admin' },
];
