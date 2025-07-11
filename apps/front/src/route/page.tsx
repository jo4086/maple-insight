import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const [activeTab, setActiveTab] = useState('캐릭터');
  const [isCollapsed, setIsCollapsed] = useState(false);

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

