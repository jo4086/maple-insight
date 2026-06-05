import type { ItemEquipment } from '@maple/contracts';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CharacterSearchInput, EquipmentCard, EquipmentContainer, EquipmentGrid, useSearchNick } from '@/features/character';

export const CharacterMainPage = () => {
  const [searchParams] = useSearchParams();
  const [isContentVisible, setIsContentVisible] = useState(false);
  const nick = searchParams.get('nick')?.trim() ?? '';

  const { data, isPending, isError, error } = useSearchNick(nick);

  const characterImg = data?.basic.info.imageUrl || '';
  const equipment = data?.equipment;
  const defaultPreviewItem = useMemo(
    () => equipment?.itemEquipment.find((item) => item.slot.replaceAll(' ', '').trim() === '모자' || item.part === '모자') ?? equipment?.itemEquipment[0] ?? null,
    [equipment],
  );
  const [previewItem, setPreviewItem] = useState<ItemEquipment | null>(null);

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

  useEffect(() => {
    setPreviewItem(defaultPreviewItem);
  }, [defaultPreviewItem]);

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

        {equipment && (
          <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] items-start gap-4">
            <div className="col-span-1 min-h-[70lvh] min-w-0 w-full bg-red-500/5">1</div>
            <div className="col-span-1 min-h-[70lvh] min-w-0 w-full bg-yellow-500/5">2</div>

            <div className="col-span-1 grid min-h-[70lvh] min-w-0 w-full justify-items-center bg-green-500/5">
              <EquipmentContainer>
                <EquipmentGrid characterImg={characterImg} equipment={equipment} onItemSelect={setPreviewItem} />
              </EquipmentContainer>
            </div>

            <div className="col-span-1 grid min-h-[70lvh] min-w-0 w-full justify-items-center bg-blue-500/5">{previewItem && <EquipmentCard item={previewItem} />}</div>
          </div>
        )}
      </section>
    </div>
  );
};
