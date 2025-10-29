// 📁 components/Sidebar/index.ts
// NOTE: components: Root, Header, Content, Nav, Footer

import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface SidebarRootProps {
  isCollapsed: boolean;
  children: React.ReactNode;
}
// TAG: Root
export function SidebarRoot({ isCollapsed, children }: SidebarRootProps) {
  return <div className={`${isCollapsed ? 'w-16' : 'w-80'} h-screen bg-slate-900 `}>{children}</div>;
}

// TAG: Header
export function SidebarHeader() {
  return <div className="p-4 text-white border-b">Maple Insight</div>;
}

// TAG: Content
export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="px-4">{children}</div>;
}

export type NavItemProps = {
  label: string;
  icon: string;
  path: string;
};
export interface SidebarNavProps {
  items: NavItemProps[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
}
// TAG: Nav
export function SidebarNav({ items, activeTab, onTabChange, isCollapsed }: SidebarNavProps) {
  const navigate = useNavigate();

  const handleNavigate = (path: string, tab: string) => {
    navigate(path);
    onTabChange(tab);
  };

  return (
    <div className="w-full space-y-2 px-4">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => handleNavigate(item.path, item.label)}
          // onClick={() => onTabChange(item.label)}
          className={`myContainer w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3 py-2'} 
            ${activeTab === item.label ? 'bg-gray-400 text-white' : 'bg-gray-700 text-gray-300'}
          `}
        >
          <i className={item.icon} />
          {!isCollapsed && <span>{item.label}</span>}
        </button>
      ))}
    </div>
  );
}

// TAG: Footer
export function SidebarFooter() {
  return <div className="p-4 text-gray-400 border-t text-xs">최근 접속: 오늘</div>;
}
