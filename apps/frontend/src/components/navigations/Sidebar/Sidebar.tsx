import { useState, type ReactNode } from 'react';
import { FiBookOpen, FiBox, FiChevronLeft, FiChevronRight, FiHome, FiRefreshCw, FiUser, FiShield } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import type { SearchNickResponse } from '@/features/character/types';
import { world_icon_path_map } from '@/types/worlds';

type SidebarSection = 'character' | 'equipment' | 'symbol' | 'boss' | 'collection' | 'home';

type CharacterSidebarProps = {
  data: SearchNickResponse;
  onRefresh?: () => void;
  isRefreshSpinning?: boolean;
};

const NAV_ITEMS: {
  id: SidebarSection;
  label: string;
  icon: ReactNode;
}[] = [
  { id: 'home', label: '홈', icon: <FiHome className="h-5 w-5" /> },
  { id: 'character', label: '캐릭터', icon: <FiUser className="w-5 h-5" /> },
  { id: 'equipment', label: '장비', icon: <FiShield className="w-5 h-5" /> },
  { id: 'symbol', label: '심볼', icon: <div /> },
];

export const CharacterSidebar = ({ data, onRefresh, isRefreshSpinning = false }: CharacterSidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState<SidebarSection>('character');
  const navigate = useNavigate();

  return (
    <aside
      className={twMerge(
        'relative flex min-h-lvh h-full shrink-0 border-r border-gray-800 bg-gray-950 text-white transition-all duration-300',
        isExpanded ? 'w-[400px]' : 'w-[80px]',
      )}
    >
      <div className="flex w-[80px] shrink-0 flex-col items-center border-r border-gray-800 py-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          title="홈으로"
          className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-lg font-bold transition hover:bg-white/15"
        >
          M
        </button>

        <nav className="flex flex-1 flex-col items-center gap-3">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === activeSection;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                title={item.label}
                className={twMerge(
                  'flex h-12 w-12 items-center justify-center rounded-xl border transition',
                  isActive ? 'border-white/30 bg-white/15 text-white' : 'border-transparent text-gray-400 hover:border-white/10 hover:bg-white/5 hover:text-white',
                )}
              >
                {item.icon}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col items-center gap-3 pt-4">
          <button
            type="button"
            onClick={onRefresh}
            title="새로고침"
            disabled={!onRefresh || isRefreshSpinning}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiRefreshCw className={twMerge('h-5 w-5', isRefreshSpinning && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div
        className={twMerge('min-w-0 overflow-hidden transition-[width,opacity,padding] duration-300 ease-out', isExpanded ? 'flex-1 p-4 opacity-100' : 'w-0 px-0 py-4 opacity-0')}
      >
        <SidebarPanel activeSection={activeSection} data={data} isExpanded={isExpanded} />
      </div>

      <div className="absolute top-1/2 -right-px -translate-y-1/2 translate-x-full">
        <div className="h-4" />
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex h-16 w-6 items-center justify-center rounded-r-lg border border-l-0 border-gray-600 bg-gray-500 text-white shadow-md transition-colors hover:bg-gray-400"
        >
          {isExpanded ? <FiChevronLeft className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
        </button>
        <div className="h-4" />
      </div>
    </aside>
  );
};

type SidebarPanelProps = {
  activeSection: SidebarSection;
  data: SearchNickResponse;
  isExpanded: boolean;
};

const SidebarPanel = ({ activeSection, data, isExpanded }: SidebarPanelProps) => {
  const basic = data.basic.info;
  const worldIcon = world_icon_path_map[basic.worldName as keyof typeof world_icon_path_map];
  const combatPower = data.stat.finalStat?.find((stat) => stat.statName === '전투력');

  if (activeSection === 'home') {
    return (
      <div className="flex h-full flex-col">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Overview</p>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-lg font-semibold">{basic.name}</p>
          <p className="mt-1 text-sm text-gray-400"></p>
        </div>
      </div>
    );
  }

  if (activeSection === 'character') {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-black">
            <div
              className={twMerge('h-full w-full origin-center bg-center bg-[length:175%] transition-transform duration-300 ease-out', isExpanded ? 'scale-100' : 'scale-75')}
              style={{ backgroundImage: `url(${basic.imageUrl})` }}
            />
          </div>

          <div className="min-w-0 text-center">
            <p className="truncate text-xl font-semibold">{basic.name}</p>
            <p className="mt-1 text-sm text-gray-400">{basic.class}</p>
            <div className="mt-1 flex items-center justify-center gap-2 text-sm text-gray-400">
              {worldIcon && <img src={worldIcon} alt={basic.worldName} className="h-4 w-4" />}
              <p>{basic.worldName}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <InfoRow label="길드" value={basic.guildName || '-'} />
          <InfoRow label="레벨" value={String(basic.level ?? '-')} />
          <InfoRow label="경험치" value={basic.exp?.toLocaleString('ko-KR') ?? '-'} />
          {combatPower && <InfoRow label={combatPower.statName} value={combatPower.statValue?.toLocaleString('ko-KR') ?? '-'} />}
        </div>
      </div>
    );
  }

  if (activeSection === 'equipment') {
    return (
      <div>
        <p className="text-lg font-semibold">장비</p>
        <p className="mt-2 text-sm text-gray-400">여기에 장비 요약이나 서브 네비를 넣으면 됩니다.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-lg font-semibold">도감</p>
      <p className="mt-2 text-sm text-gray-400">여기에 도감/업적/기록 관련 패널을 넣으면 됩니다.</p>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="max-w-[160px] truncate text-sm font-medium text-white">{value}</span>
    </div>
  );
};
