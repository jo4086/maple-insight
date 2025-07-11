import { useState } from 'react';

import { Dashboard, Sidebar } from './user-components';

export function User() {
  const [activeTab, setActiveTab] = useState<string>('캐릭터');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isCollapsed={isCollapsed} onTabChange={handleTabChange} activeTab={activeTab} />
      <Dashboard activeTab={activeTab} isCollapsed={isCollapsed} onToggleSidebar={toggleSidebar} />
    </div>
  );
}
