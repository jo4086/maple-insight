import { useEffect, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';

import { CharacterSidebar } from '@/components/navigations/Sidebar/Sidebar';
import { CharacterLoadingOverlay } from '@/components/ui/CharacterLoadingOverlay';
import { useSearchNick } from '@/features/character';

export const CharacterLayout = () => {
  const [searchParams] = useSearchParams();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [refreshCooldownUntil, setRefreshCooldownUntil] = useState<number | null>(null);
  const nick = searchParams.get('nick')?.trim() ?? '';

  const { data, isFetching, refetch } = useSearchNick(nick);
  const isRefreshDisabled = refreshCooldownUntil !== null && refreshCooldownUntil > Date.now();

  useEffect(() => {
    if (refreshCooldownUntil === null) return;

    const remainingTime = refreshCooldownUntil - Date.now();

    if (remainingTime <= 0) {
      setRefreshCooldownUntil(null);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRefreshCooldownUntil(null);
    }, remainingTime);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [refreshCooldownUntil]);

  const handleRefresh = async () => {
    if (!nick || isManualRefreshing || isRefreshDisabled) return;

    setIsManualRefreshing(true);
    setRefreshCooldownUntil(Date.now() + 60_000);

    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  };

  return (
    <div className="relative flex min-h-lvh w-full">
      {data && <CharacterSidebar data={data} onRefresh={handleRefresh} isRefreshSpinning={isManualRefreshing} isRefreshDisabled={isRefreshDisabled} />}
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
      {data && isFetching && !isManualRefreshing && <CharacterLoadingOverlay />}
    </div>
  );
};
