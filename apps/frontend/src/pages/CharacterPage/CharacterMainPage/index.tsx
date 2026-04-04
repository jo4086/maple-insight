import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CharacterSearchInput } from '@/features/character/components/CharacterSearchInput';
import { EquipmentContainer } from '@/features/character/components/equipment/EquipmentContainer';
import { EquipmentGrid } from '@/features/character/components/equipment/EquipmentGrid';
import { useSearchNick } from '@/features/character/hooks/useSearchNick';

export const CharacterMainPage = () => {
  const [searchParams] = useSearchParams();
  const [isContentVisible, setIsContentVisible] = useState(false);
  const nick = searchParams.get('nick')?.trim() ?? '';

  const { data, isPending, isError, error } = useSearchNick(nick);

  const characterImg = data?.basic.info.imageUrl || '';
  const equipment = data?.['item-equipment'];
  const android = data?.['android-equipment'];

  useEffect(() => {
    if (!data) {
      setIsContentVisible(false);
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setIsContentVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [data]);

  if (isPending && !data) {
    return (
      <div className="flex min-h-[70lvh] w-full">
        <section className="min-w-0 flex-1 p-6">
          <div className="mb-6 flex items-center justify-end">
            <CharacterSearchInput />
          </div>

          <div className="flex min-h-[50lvh] items-center justify-center">
            <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-3 shadow-sm">
              <span className="inline-block h-5 w-5 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin" />
              <span className="text-sm font-medium text-gray-700">캐릭터 정보를 조회중...</span>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[70lvh] w-full">
        <section className="min-w-0 flex-1 p-6">
          <div className="mb-6 flex items-center justify-end">
            <CharacterSearchInput />
          </div>

          <div>{error.message}</div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70lvh] w-full">
      <section className={isContentVisible ? 'min-w-0 flex-1 p-6 opacity-100 transition duration-500 ease-out' : 'min-w-0 flex-1 p-6 opacity-0 transition duration-500 ease-out'}>
        <div className="mb-6 flex items-center justify-end border">
          <CharacterSearchInput />
        </div>

        {!nick && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-500 shadow-sm">
            오른쪽 상단 검색창에서 캐릭터 닉네임을 검색해주세요.
          </div>
        )}

        {equipment && android && (
          <EquipmentContainer>
            <EquipmentGrid characterImg={characterImg} items={equipment.itemEquipment} initialPresetNo={equipment.presetNo} presets={equipment.presets} android={android} />
          </EquipmentContainer>
        )}
      </section>
    </div>
  );
};
