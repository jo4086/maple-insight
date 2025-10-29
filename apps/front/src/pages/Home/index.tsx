import { React, cn } from '@/shared';

import { Container } from '@/components';
import { useState } from 'react';

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('character');

  const swt = 1;

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const recentSearches = ['아템', '스카나야', '리더길드', '최강전사', '마법사123'];

  const popularSearches = ['레벨290이상', '전투력1억', '길드리더', '최고랭킹', '신규유저'];
  //         <div classMame="w-full bg-[url(banner.png)] h-[400px] bg-no-repeat bg-contain bg-center g-gray-300"></div>

  if (swt === 1) {
    return (
      <Container>
        <div className="w-full h-[400px] bg-[url('/banner.png')] bg-no-repeat bg-cover bg-center"></div>
      </Container>
    );
  }

  return (
    <Container className={cn('min-h-screen flex items-center justify-center p-4')}>
      <div className="w-full max-w-4xl bg-gray-600">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <i className="ri-search-line text-white text-2xl"></i>
            </div>
            <h1 className="text-4xl font-bold text-white">게임 정보 검색</h1>
          </div>
          <p className="text-xl text-gray-300">캐릭터, 길드, 랭킹 정보를 검색해보세요</p>
        </div>
        {/* Search Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          {/* Search Type Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'character', name: '캐릭터', icon: 'ri-user-line' },
              { id: 'guild', name: '길드', icon: 'ri-team-line' },
              { id: 'ranking', name: '랭킹', icon: 'ri-trophy-line' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSearchType(type.id)}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
                  searchType === type.id ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <i className={`${type.icon} text-lg`}></i>
                <span className="font-medium">{type.name}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`${searchType === 'character' ? '캐릭터명' : searchType === 'guild' ? '길드명' : '랭킹 조건'}을 입력하세요`}
              className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-gray-300 text-lg focus:outline-none focus:border-purple-400 focus:bg-white/30"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-purple-600 hover:bg-purple-500 rounded-lg flex items-center justify-center cursor-pointer"
            >
              <i className="ri-search-line text-white text-xl"></i>
            </button>
          </div>

          {/* Quick Search Buttons */}
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 text-sm whitespace-nowrap">
              내 캐릭터
            </button>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 text-sm whitespace-nowrap">
              길드 순위
            </button>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 text-sm whitespace-nowrap">
              전투력 랭킹
            </button>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 text-sm whitespace-nowrap">
              레벨 랭킹
            </button>
          </div>
        </div>

        {/* Recent and Popular Searches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Searches */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <i className="ri-time-line text-purple-400"></i>
              최근 검색
            </h3>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(search);
                    onSearch(search);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Searches */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <i className="ri-fire-line text-orange-400"></i>
              인기 검색
            </h3>
            <div className="space-y-2">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(search);
                    onSearch(search);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all flex items-center justify-between"
                >
                  <span>{search}</span>
                  <span className="text-xs text-purple-400">#{index + 1}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-user-line text-white text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-white mb-1">1,234,567</div>
            <div className="text-gray-300 text-sm">등록된 캐릭터</div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-team-line text-white text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-white mb-1">45,678</div>
            <div className="text-gray-300 text-sm">활성 길드</div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-trophy-line text-white text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-white mb-1">98,765</div>
            <div className="text-gray-300 text-sm">일일 검색</div>
          </div>
        </div>
      </div>
    </Container>
  );
}
