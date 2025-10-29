// import reactLogo from './assets/react.svg';
// import viteLogo from '/vite.svg';
import React, { useState } from 'react';
import './App.css';
import { Fab } from '@/components/buttons';
import { AppRoutes } from '@/router';

import { SidebarContent, SidebarHeader, SidebarNav, SidebarRoot } from '@/components/navi/Sidebar';

const tabItems = [
  { label: 'label1', icon: 'x', path: '/' },
  { label: 'label2', icon: 'y', path: '/user' },
  { label: 'label3', icon: 'z', path: '/admin' },
];

function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    const sortedItems = [...tabItems].sort((a, b) => b.path.length - a.path.length);
    const current = sortedItems.find((item) => location.pathname.startsWith(item.path));
    return current ? current.label : tabItems[0].label;
  });

  return (
    <>
      <Fab
        items={[
          { id: 'item1', label: '라벨1', path: '/' },
          { id: 'item2', label: '라벨2', path: '/user' },
          { id: 'item3', label: 'admin', path: '/admin' },
        ]}
      />
      <div className="flex bg-gray-700 w-full">
        <SidebarRoot isCollapsed={false}>
          <SidebarHeader>Sidebar Header</SidebarHeader>
          <SidebarContent>
            <div className="flex-col">content Area</div>
          </SidebarContent>
          <SidebarNav isCollapsed={false} items={tabItems} activeTab={activeTab} onTabChange={setActiveTab}></SidebarNav>
        </SidebarRoot>
        <AppRoutes />
      </div>
    </>
  );
}

export default App;
