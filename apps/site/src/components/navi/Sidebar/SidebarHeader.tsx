import type React from 'react';

export function SidebarHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-4 text-white border-b">{children}</div>;
}
