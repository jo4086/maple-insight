interface DashboardProps {
  activeTab: string;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Dashboard({ activeTab, isCollapsed, onToggleSidebar }: DashboardProps) {
  const renderCharacterContent = () => (
    <div className="p-6 bg-blue-400">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 전투력 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">전투 전투력</h3>
          <div className="text-3xl font-bold text-purple-600 mb-2">335,173,264</div>

          <div className="space-y-3 mt-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                  <i className="ri-shield-line text-white text-sm"></i>
                </div>
                <div>
                  <div className="text-sm font-medium">침묵의 보스 세트</div>
                  <div className="text-xs text-gray-500">5</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <i className="ri-sword-line text-white text-sm"></i>
                </div>
                <div>
                  <div className="text-sm font-medium">라이오스더 세트</div>
                  <div className="text-xs text-gray-500">2</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center">
                  <i className="ri-fire-line text-white text-sm"></i>
                </div>
                <div>
                  <div className="text-sm font-medium">에테르날 세트</div>
                  <div className="text-xs text-gray-500">7</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 장비 그리드 */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">장비</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded">프리셋 1</button>
              <button className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded">프리셋 2</button>
              <button className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded">프리셋 3</button>
              <button className="px-3 py-1 bg-gray-800 text-white text-sm rounded">장비삭</button>
            </div>
          </div>

          <div className="grid grid-cols-8 gap-3">
            {Array.from({ length: 32 }, (_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:border-purple-300 cursor-pointer"
              >
                {i < 16 && (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <i className="ri-sword-line text-white text-lg"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">어센던트</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">AU1</span>
              <span className="font-medium">+60</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">STR</span>
              <span className="font-medium">+15,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">EXP</span>
              <span className="font-medium">+46%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">DROP/MESO</span>
              <span className="font-medium">+14%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <i key={star} className="ri-star-fill text-yellow-400"></i>
              ))}
            </div>
            <h3 className="text-lg font-bold">에테르날 나이트메어 (+8)</h3>
          </div>

          <div className="text-sm text-blue-300 mb-4">(현신호의 아이템)</div>

          <div className="space-y-2 text-sm">
            <div>REQ LEVEL : 250</div>
            <div className="mt-4">
              <div>장비 부위: 양손</div>
              <div className="text-yellow-400">STR : +401 (50 +144 +49 +158)</div>
              <div className="text-yellow-400">DEX : +273 (50 +42 +22 +159)</div>
              <div className="text-yellow-400">INT : +232 (50 +42 +21 +119)</div>
              <div className="text-yellow-400">LUK : +193 (50 +24 +119)</div>
              <div className="text-green-400">HP : +255 (0 +255)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWeaponContent = () => (
    <div className="p-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">무기 정보</h3>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="aspect-square bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center"
            >
              <i className="ri-sword-line text-white text-2xl"></i>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderArtifactContent = () => (
    <div className="p-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">성유물 정보</h3>
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 18 }, (_, i) => (
            <div
              key={i}
              className="aspect-square bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center"
            >
              <i className="ri-shield-line text-white text-xl"></i>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMaterialContent = () => (
    <div className="p-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">재료 정보</h3>
        <div className="grid grid-cols-8 gap-3">
          {Array.from({ length: 32 }, (_, i) => (
            <div
              key={i}
              className="aspect-square bg-gradient-to-br from-purple-300 to-pink-400 rounded-lg flex items-center justify-center"
            >
              <i className="ri-gift-line text-white text-lg"></i>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAchievementContent = () => (
    <div className="p-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">업적 정보</h3>
        <div className="space-y-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <i className="ri-trophy-line text-white text-xl"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">업적 제목 {i + 1}</h4>
                <p className="text-sm text-gray-600">업적 설명이 들어갑니다.</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">100%</div>
                <div className="text-xs text-gray-500">완료</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case '캐릭터':
        return renderCharacterContent();
      case '무기':
        return renderWeaponContent();
      case '성유물':
        return renderArtifactContent();
      case '재료':
        return renderMaterialContent();
      case '업적':
        return renderAchievementContent();
      case '도감':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">도감 정보</h3>
              <p className="text-gray-600">도감 내용이 들어갈 예정입니다.</p>
            </div>
          </div>
        );
      case '설정':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">설정</h3>
              <p className="text-gray-600">설정 내용이 들어갈 예정입니다.</p>
            </div>
          </div>
        );
      default:
        return renderCharacterContent();
    }
  };

  return (
    <div className="flex-1 bg-gray-50 h-screen overflow-y-auto">
      {/* Header with toggle button */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer"
          >
            <i className={`${isCollapsed ? 'ri-menu-unfold-line' : 'ri-menu-fold-line'} text-gray-600 text-lg`}></i>
          </button>
          <h1 className="text-xl font-bold text-gray-800">{activeTab}</h1>
        </div>
        <div className="text-sm text-gray-500">마지막 업데이트: 방금 전</div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}

