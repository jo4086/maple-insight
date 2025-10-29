import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type DataItem = { label: string; icon: string | React.ReactNode };
type Data = DataItem[];

interface SidebarProps {
  isCollapsed: boolean;
  onTabChange: (tab: string) => void;
  activeTab: string;
  data: Data;
  children?: React.ReactNode;
}

export function Sidebar(props: SidebarProps) {
  const { isCollapsed, onTabChange, activeTab, data } = props;
  const navigate = useNavigate();
  const navigationItems = [
    { name: '캐릭터', icon: 'ri-user-line' },
    { name: '스킬', icon: 'ri-sword-line' },
    { name: '분석', icon: 'ri-shield-line' },
    { name: '시뮬레이터', icon: 'ri-gift-line' },
    { name: '도감', icon: 'ri-trophy-line' },
    { name: '설정', icon: 'ri-book-line' },
    // { name: '', icon: 'ri-settings-line' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

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
        {!isCollapsed && <Header label="Maple Insight" onClick={() => handleNavigate('/')} />}

        {/* Character Info */}
        {!isCollapsed && <div className="p-4"></div>}

        {/* Navigation Menu */}
        {/* <div className={`${isCollapsed ? 'p-2 pl-1.5' : 'px-4 pb-6'} space-y-2`}>
          <button
            onClick={() => {}}
            className={`flex w-full-items-center ${!isCollapsed ? 'hidden' : 'gap-3 px-3 py-3 bg-gray-900 border-2 border-gray-500/50'} rounded-lg transition-all`}
          >
            <div className="w-5.5 h-5 flex items-center justify-center">
              <i className={`logo-icon text-sm`}>home</i>
            </div>
          </button>
          {data.map((item) => (
            <button
              key={item.label}
              onClick={() => onTabChange(item.label)}
              className={`w-full flex items-center border-2 border-gray-600 ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-3 '} rounded-lg transition-all ${
                activeTab === item.label
                  ? 'bg-gray-400 text-white'
                  : 'bg-slate-500/30 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <i className={`${item.icon} text-lg`}></i>
              </div>
              {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </div> */}

        {/* Footer Info */}
        {/* {!isCollapsed && (
          <div className="p-4 border-t border-purple-700/50 mt-auto">
            <div className="text-right text-xs text-gray-400">
              최근 접속: 오늘
              <br />
              생성일: 2020-01-16
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}

interface HeaderProps {
  label: string;
  onClick: () => void;
}
function Header(props: HeaderProps) {
  const { label, onClick } = props;

  return (
    <div className="p-4 border-b border-gray-400/50">
      <div className="flex items-center gap-2 mb-2 justify-center">
        <span onClick={onClick} className="text-white font-normal text-shadow-teal-600 text-shadow-sm text-3xl">
          {label}
        </span>
      </div>
    </div>
  );
}
