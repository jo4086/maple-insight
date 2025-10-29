import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { navItems } from './constant';
import Layout from './Layout';

import { SidebarRoot, SidebarNav, SidebarFooter, SidebarHeader, SidebarContent, Container } from '@/components';

export const Admin = () => {
  const location = useLocation();

  // 현재 URL 기반 activeTab 초기값 설정
  const [activeTab, setActiveTab] = useState<string>(() => {
    const sortedItems = [...navItems].sort((a, b) => b.path.length - a.path.length);
    const current = sortedItems.find((item) => location.pathname.startsWith(item.path));
    return current ? current.label : navItems[0].label;
  });
  // 사이드바 fold toggle
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // 경로 변경시 activeTab 갱신 (경로 긴 순서로 매칭)
  useEffect(() => {
    const sortedItems = [...navItems].sort((a, b) => b.path.length - a.path.length);
    const current = sortedItems.find((item) => location.pathname.startsWith(item.path));
    if (current) setActiveTab(current.label);
  }, [location.pathname]);
  return (
    <Container className="flex bg-gray-100 w-full">
      <Layout>
        <SidebarRoot isCollapsed={isCollapsed}>
          <SidebarHeader />
          <SidebarContent>
            <div className="flexCol">콘텐츠영역</div>
          </SidebarContent>
          <SidebarNav items={navItems} activeTab={activeTab} onTabChange={setActiveTab} isCollapsed={isCollapsed} />
          <SidebarFooter />
        </SidebarRoot>
      </Layout>
      <div className="flex-1 bg-gray-100 overflow-y-auto">
        <Outlet />
      </div>
    </Container>
  );
};

export default Admin;
export { default as Character } from './Character';
export { default as Dashboard } from './Dashboard';
export { default as Skill } from './Skill';
