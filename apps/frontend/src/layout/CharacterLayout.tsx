import { useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';

import { CharacterSidebar } from '@/components/navigations/Sidebar/Sidebar';
import { CharacterLoadingOverlay } from '@/components/ui/CharacterLoadingOverlay';
import { useSearchNick } from '@/features/character/hooks/useSearchNick';

export const CharacterLayout = () => {
  const [searchParams] = useSearchParams();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const nick = searchParams.get('nick')?.trim() ?? '';

  const { data, isFetching, refetch } = useSearchNick(nick);

  const handleRefresh = async () => {
    if (!nick || isManualRefreshing) return;

    setIsManualRefreshing(true);

    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  };

  return (
    <div className="relative flex min-h-lvh w-full">
      {data && <CharacterSidebar data={data} onRefresh={handleRefresh} isRefreshSpinning={isManualRefreshing} />}
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
      {data && isFetching && !isManualRefreshing && <CharacterLoadingOverlay />}
    </div>
  );
};
