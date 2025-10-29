interface SidebarProps {
  isCollapsed: boolean;
  children: React.ReactNode;
}

function SidebarRoot({ isCollapsed, children }: SidebarProps) {
  return <div className={`${isCollapsed ? 'w-16' : 'w-80'} h-screen bg-slate-900`}>{children}</div>;
}

interface SidebarNavProps {
  items: { name: string; icon: string }[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
}

function SidebarNav({ items, activeTab, onTabChange, isCollapsed }: SidebarNavProps) {
  return (
    <div className="space-y-2 px-2">
      {items.map((item) => (
        <button
          key={item.name}
          onClick={() => onTabChange(item.name)}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3 py-2'} 
            ${activeTab === item.name ? 'bg-gray-400 text-white' : 'bg-gray-700 text-gray-300'}
          `}
        >
          <i className={item.icon} />
          {!isCollapsed && <span>{item.name}</span>}
        </button>
      ))}
    </div>
  );
}

function SidebarHeader() {
  return <div className="p-4 text-white border-b">Maple Insight</div>;
}

function SidebarFooter() {
  return <div className="p-4 text-gray-400 border-t text-xs">최근 접속: 오늘</div>;
}

// 👇 네임스페이스화 (컴포지트 패턴)
export const Sidebar = Object.assign(SidebarRoot, {
  Nav: SidebarNav,
  Header: SidebarHeader,
  Footer: SidebarFooter,
});
