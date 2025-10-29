import { Container, Title } from '@/components';
import { React, cn } from '@/shared';

interface HeaderProps {
  isDarkMode: boolean;
  isMobile: boolean;
  onToggleSidebar: () => void;
  isCollapsed: boolean;
  activeTab: string;
}

export const Header = ({ isDarkMode, isMobile, isCollapsed, activeTab, onToggleSidebar }: HeaderProps) => {
  return (
    <Container
      className={cn('border-b px-6 py-4', {
        'bg-gray-800 border-gray-700': isDarkMode,
        'bg-white border-gray-200': !isDarkMode,
      })}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!isMobile && (
            <button
              onClick={onToggleSidebar}
              className={cn('w-10 h-10 rounded-lg cursor-pointer', 'flex items-center justify-center', {
                'bg-gray-700 hover:bg-gray-600': isDarkMode,
                'bg-gray-100 hover:bg-gray-200': !isDarkMode,
              })}
            >
              <i
                className={cn('text-lg', {
                  'ri-menu-unfold-line': isCollapsed,
                  'ri-menu-fold-line': !isCollapsed,
                  'text-gray-300': isDarkMode,
                  'text-gray-600': !isDarkMode,
                })}
              ></i>
            </button>
          )}
          <Title
            className={cn('text-xl font-bold', {
              'text-white': isDarkMode,
              'text-gray-800': !isDarkMode,
            })}
          >
            {activeTab}
          </Title>
        </div>
      </div>
    </Container>
  );
};
