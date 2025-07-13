import { Container, Header } from '@/components';
import { act, useState } from 'react';
import cn from 'classnames';

interface DashboardProps {
  activeTab?: string;
  isCollapsed?: boolean;
  isDarkMode?: boolean;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
  onToggleDarkMode?: () => void;
}

export function Dashboard({
  isCollapsed,
  isDarkMode,
  isMobile,
  activeTab,
  onToggleDarkMode,
  onToggleSidebar,
}: DashboardProps) {
  // const { activeTab, isCollapsed, isDarkMode, isMobile, onToggleDarkMode, onToggleSidebar } = props;
  const [searchQuery, setSearchQuery] = useState('');

  const renderContent = () => {
    switch (activeTab) {
      case '캐릭터':
        return null;
      case '스킬':
        return null;
      case '분석':
        return null;
      case '시뮬레이터':
        return null;
      case '도감':
        return null;
      case '설정':
        return null;
      default:
        return null;
    }
  };

  return (
    <Container
      className={cn('flex-1 h-screen overflow-y-auto', {
        'bg-gray-900': isDarkMode,
        'bg-gray-50': !isDarkMode,
        'pb-20': isMobile,
      })}
    >
      <Header
        isCollapsed={isCollapsed}
        isDarkMode={isDarkMode}
        isMobile={isMobile}
        activeTab={activeTab}
        onToggleSidebar={onToggleSidebar}
      ></Header>
      {renderContent()}
    </Container>
  );
}
