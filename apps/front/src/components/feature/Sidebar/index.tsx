import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenuFold2Fill, RiMenuFoldFill } from 'react-icons/ri';

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

export function Sidebar({ items, isCollapsed, onToggle, onAddItem, className = '' }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]));
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.subItems && item.subItems.length > 0) {
      toggleExpanded(item.id);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleSubItemClick = (subItem: SidebarSubItem) => {
    navigate(subItem.path);
  };

  const isItemActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const isParentActive = (item: SidebarItem) => {
    if (item.path && location.pathname === item.path) return true;
    if (item.subItems) {
      return item.subItems.some((subItem) => location.pathname === subItem.path);
    }
    return false;
  };

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} ${className} h-dvh fixed left-0`}>
      {/* Header */}
      <div className="relative h-14 flex items-center px-4 border-b border-gray-700">
        {!isCollapsed && <h2 className="text-lg font-semibold min-w-0 whitespace-nowrap overflow-hidden">관리자</h2>}

        {/* 토글 버튼: 항상 오른쪽 끝에 고정 */}
        <button onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 border border-gray-400 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
          {isCollapsed ? <RiMenuFold2Fill /> : <RiMenuFoldFill />}
        </button>
      </div>

      {/* Settings Button */}
      <div className="text-nowrap p-4 border-b border-gray-700">
        <button
          onClick={onAddItem}
          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
          title={isCollapsed ? '새 항목 추가' : ''}
        >
          <i className="ri-settings-3-line text-lg"></i>
          <span className={`transition-opacity ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>새 항목 추가</span>
          {/* {!isCollapsed && <span>새 항목 추가</span>} */}
        </button>
      </div>

      {/* Menu Items */}
      <div className="p-2">
        {items.map((item) => (
          <div key={item.id}>
            {/* Main Item */}
            <button
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors mb-1 cursor-pointer ${
                isParentActive(item) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              {item.icon && <i className={`${item.icon} text-lg`}></i>}
              {!isCollapsed && (
                <>
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {item.subItems && item.subItems.length > 0 && (
                    <i className={`ri-arrow-${expandedItems.includes(item.id) ? 'down' : 'right'}-s-line text-sm transition-transform`}></i>
                  )}
                </>
              )}
            </button>

            {/* Sub Items */}
            {!isCollapsed && item.subItems && expandedItems.includes(item.id) && (
              <div className="ml-6 mb-2">
                {item.subItems.map((subItem) => (
                  <button
                    key={subItem.id}
                    onClick={() => handleSubItemClick(subItem)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors mb-1 text-sm cursor-pointer ${
                      isItemActive(subItem.path) ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{subItem.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
