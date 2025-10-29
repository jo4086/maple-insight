import type React from 'react';

export function SidebarFooter({ children }: { children: React.ReactNode }) {
  return <div className="p-4 text-gray-400 border-t  text-xs">{children}</div>;
}
