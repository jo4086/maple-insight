import { useState } from 'react';

interface SidebarProps {
  isCollapsed: boolean;
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export function Sidebar({ isCollapsed, onTabChange, activeTab }: SidebarProps) {
  const navigationItems = [
    { name: '캐릭터', icon: 'ri-user-line' },
    { name: '스킬', icon: 'ri-sword-line' },
    { name: '분석', icon: 'ri-shield-line' },
    { name: '시뮬레이터', icon: 'ri-gift-line' },
    { name: '도감', icon: 'ri-trophy-line' },
    { name: '설정', icon: 'ri-book-line' },
    // { name: '', icon: 'ri-settings-line' },
  ];

  return (
    <div
      className={`${isCollapsed ? 'w-16' : 'w-80'} bg-gradient-to-b from-stone-900 via-slate-800 to-sky-950 text-white h-screen overflow-y-hidden transition-all duration-300`}
    >
      <div
        className={`${isCollapsed ? 'overflow-y-hidden' : 'overflow-y-scroll'}
        h-full
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-indigo-100
        [&::-webkit-scrollbar-thumb]:bg-stone-500/60
        dark:[&::-webkit-scrollbar-track]:bg-neutral-700
        dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 
        `}
      >
        {/* Header */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-400/50">
            <div className="flex items-center gap-2 mb-2 justify-center">
              <span className="text-white font-normal text-shadow-teal-600 text-shadow-sm text-3xl">Maple Insight</span>
            </div>
          </div>
        )}

        {/* Character Info */}
        {!isCollapsed && (
          <div className="p-4">
            {/* Character Avatar and Name */}
            <div className="flex items-start gap-4 mb-6 w-fit mx-auto">
              <div className="w-32 aspect-square bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center relative">
                <i className="ri-user-3-line text-2xl text-white"></i>
                {/* <div className="absolute -top-2 -right-3 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">5</span>
                </div> */}
              </div>
              <div className="w-32 aspect-square flex-col h-32 w-32 gap-1">
                <h2 className="flex text-md items-center text-white h-1/6">챌린저스2</h2>
                <h2 className="flex text-lg items-center font-bold text-white h-2/6">닉네임ㅁㅁㅁ</h2>
                <h2 className="flex text-md items-center font-medium text-white h-1/6">엔젤릭버스터</h2>
                <h2 className="flex text-lg items-center text-white h-2/6">Lv. 290</h2>
                {/* <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i key={star} className="ri-star-fill text-yellow-400 text-sm">
                    3
                  </i>
                ))}
              </div> */}
              </div>
            </div>

            {/* Character Stats */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-300 text-sm mb-1">길드</div>
                  <div className="text-white font-medium">길드명</div>
                </div>
                <div>
                  <div className="text-gray-300 text-sm mb-1">유니온</div>
                  <div className="text-white font-medium">8764</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-300 text-sm mb-1">경험치</div>
                  <div className="text-white font-medium">36.159%</div>
                </div>
                <div>
                  <div className="text-gray-300 text-sm mb-1">순위</div>
                  <div className="text-white font-medium">0000위</div>
                </div>
              </div>
            </div>

            {/* Level and Experience */}
            <div className="flex w-full bg-zinc-400/10 rounded-lg py-4 px-2 mb-6">
              <div className="flex w-full text-center">
                <span className="text-white font-bold text-xl flex-1">전투력</span>
                <span className="text-white font-bold text-xl flex-2">132,977,262</span>
              </div>
            </div>

            {/* Action Buttons */}
            {/* <div className="flex gap-2 mb-6">
            <button className="w-10 h-10 bg-purple-600 hover:bg-purple-500 rounded-lg flex items-center justify-center">
              <i className="ri-line-chart-line text-white"></i>
            </button>
            <button className="w-10 h-10 bg-purple-600 hover:bg-purple-500 rounded-lg flex items-center justify-center">
              <i className="ri-file-list-line text-white"></i>
            </button>
          </div> */}
          </div>
        )}

        {/* Navigation Menu */}
        <div className={`${isCollapsed ? 'p-2 pl-1.5' : 'px-4 pb-6'} space-y-2`}>
          <button
            onClick={() => {}}
            className={`flex w-full-items-center ${!isCollapsed ? 'hidden' : 'gap-3 px-3 py-3 bg-gray-900 border-2 border-gray-500/50'} rounded-lg transition-all`}
          >
            <div className="w-5.5 h-5 flex items-center justify-center">
              <i className={`logo-icon text-sm`}>home</i>
            </div>
          </button>
          {navigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => onTabChange(item.name)}
              className={`w-full flex items-center border-2 border-gray-600 ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-3 '} rounded-lg transition-all ${
                activeTab === item.name
                  ? 'bg-gray-400 text-white'
                  : 'bg-slate-500/30 text-gray-300 hover:bg-gray-600 hover:text-white'
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
    </div>
  );
}
