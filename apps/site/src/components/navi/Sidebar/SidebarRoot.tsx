import type React from 'react';

export interface SidebarRootProps {
  isCollapsed: boolean;
  children: React.ReactNode;
}

export function SidebarRoot({ isCollapsed, children }: SidebarRootProps) {
  return <div className={`${isCollapsed ? 'w-16' : 'w-80'} h-screen bg-slate-400`}>{children}</div>;
}
