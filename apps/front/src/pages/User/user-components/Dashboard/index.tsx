import { Character } from './renderContent';

interface DashboardProps {
  activeTab: string;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Dashboard({ activeTab, isCollapsed, onToggleSidebar }: DashboardProps) {
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
        <h3 className="text-lg font-bold text-gray-800 mb-4">스킬 정보</h3>
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
        <h3 className="text-lg font-bold text-gray-800 mb-4">시뮬</h3>
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
        <h3 className="text-lg font-bold text-gray-800 mb-4">시뮬레이터</h3>
        <div className="space-y-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <i className="ri-trophy-line text-white text-xl"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">시뮬{i + 1}</h4>
                <p className="text-sm text-gray-600">시뮬설명이 들어갑니다.</p>
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
        return Character();
      case '스킬':
        return renderWeaponContent();
      case '분석':
        return renderArtifactContent();
      case '시뮬레이터':
        return renderMaterialContent();
        {
          /* case '도감':
        return renderAchievementContent(); */
        }
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
        return Character();
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
