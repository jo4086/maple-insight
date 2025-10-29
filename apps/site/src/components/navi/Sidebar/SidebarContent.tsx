import type { ReactNode } from 'react';

export function SidebarContent({ children }: { children: ReactNode }) {
  return <div className="p-4">{children}</div>;
}
