import { useState } from 'react';

interface SidebarProps {
  isCollapsed: boolean;
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export function Sidebar({ isCollapsed, onTabChange, activeTab }: SidebarProps) {
  const navigationItems = [
    { name: '캐릭터', icon: 'ri-user-line' },
    { name: '무기', icon: 'ri-sword-line' },
    { name: '성유물', icon: 'ri-shield-line' },
    { name: '재료', icon: 'ri-gift-line' },
    { name: '업적', icon: 'ri-trophy-line' },
    { name: '도감', icon: 'ri-book-line' },
    { name: '설정', icon: 'ri-settings-line' },
  ];

  return (
    <div
      className={`${isCollapsed ? 'w-16' : 'w-80'} bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 text-white h-screen overflow-y-auto transition-all duration-300`}
    >
      {/* Header */}
      {!isCollapsed && (
        <div className="p-4 border-b border-purple-700/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <i className="ri-vip-crown-line text-white text-sm"></i>
            </div>
            <span className="text-yellow-400 text-sm">스카나야</span>
            <span className="text-gray-300 text-sm">아템</span>
          </div>
        </div>
      )}

      {/* Character Info */}
      {!isCollapsed && (
        <div className="p-6">
          {/* Character Avatar and Name */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center relative">
              <i className="ri-user-3-line text-2xl text-white"></i>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">5</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">아템</h2>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i key={star} className="ri-star-fill text-yellow-400 text-sm"></i>
                ))}
              </div>
            </div>
          </div>

          {/* Character Stats */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-300 text-sm mb-1">길드</div>
                <div className="text-white font-medium">리더</div>
              </div>
              <div>
                <div className="text-gray-300 text-sm mb-1">랭킹</div>
                <div className="text-white font-medium">8764</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-300 text-sm mb-1">총점령지</div>
                <div className="text-white font-medium">4,558명(9138위)</div>
              </div>
              <div>
                <div className="text-gray-300 text-sm mb-1">접속률</div>
                <div className="text-white font-medium">303위(659위)</div>
              </div>
            </div>
          </div>

          {/* Level and Experience */}
          <div className="bg-black/30 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-gray-300 text-xs mb-1">레벨</div>
                <div className="text-white font-bold text-lg">Lv.292</div>
              </div>
              <div>
                <div className="text-gray-300 text-xs mb-1">경험치</div>
                <div className="text-white font-bold text-lg">Lv.9,900</div>
              </div>
              <div>
                <div className="text-gray-300 text-xs mb-1">최고 점수</div>
                <div className="text-white font-bold text-sm">1,354,977,262</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6">
            <button className="w-10 h-10 bg-purple-600 hover:bg-purple-500 rounded-lg flex items-center justify-center">
              <i className="ri-line-chart-line text-white"></i>
            </button>
            <button className="w-10 h-10 bg-purple-600 hover:bg-purple-500 rounded-lg flex items-center justify-center">
              <i className="ri-file-list-line text-white"></i>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <div className={`${isCollapsed ? 'p-2' : 'px-6 pb-6'} space-y-2`}>
        {navigationItems.map((item) => (
          <button
            key={item.name}
            onClick={() => onTabChange(item.name)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-lg transition-all ${
              activeTab === item.name
                ? 'bg-purple-600 text-white'
                : 'bg-black/20 text-gray-300 hover:bg-black/30 hover:text-white'
            }`}
            title={isCollapsed ? item.name : ''}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className={`${item.icon} text-lg`}></i>
            </div>
            {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.name}</span>}
          </button>
        ))}
      </div>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-purple-700/50 mt-auto">
          <div className="text-right text-xs text-gray-400">
            최근 접속: 오늘
            <br />
            생성일: 2020-01-16
          </div>
        </div>
      )}
    </div>
  );
}
