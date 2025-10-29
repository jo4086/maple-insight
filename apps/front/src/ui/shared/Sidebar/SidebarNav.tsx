import { useNavigate } from 'react-router-dom';

export interface SidebarNavProps {
  items: { label: string; icon: string; path: string }[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
}

export function SidebarNav({ items, activeTab, onTabChange, isCollapsed }: SidebarNavProps) {
  const navigate = useNavigate();

  const handleNavigate = (path: string, tab: string) => {
    navigate(path);
    onTabChange(tab);
  };

  return (
    <div className="space-y-2 px-2">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => handleNavigate(item.path, item.label)}
          // onClick={() => onTabChange(item.label)}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3 py-2'} 
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
