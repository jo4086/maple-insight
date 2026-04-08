import { StarForceSlot } from './StarForceSlot';

import type { CharacterItem } from '@maple/types';
import type { ItemOverview } from '@/samples/item-card.sample';
import { ItemOptionList } from './ItemOptionList';

const ITEM_OVERVIEW: ItemOverview = {
  starforce: 12,
  baseLevel: 250,
  classType: '전사',
  cuttableCount: 7,
  dateExpire: null,
  dateOptionExpire: null,
  equipmentLevelDecrease: 20,
  equipmentLevelIncrease: 0,
  freeStyleFlag: false,
  gender: null,
  imageUrl: 'https://open.api.nexon.com/static/maplestory/item/icon/KEPCOOGA',
  name: '에테르넬 나이트헬름',
  part: '모자',
  slot: '모자',
  starforceLimit: 30,
  type: '방어구',
};

interface EquipmentCardProps {
  data: CharacterItem;
}

export const EquipmentCard = ({ data }: EquipmentCardProps) => {
  const mainItem = data?.itemEquipment[0];

  const a = mainItem?.upgrade.starforce;
  const limit = mainItem?.itemOptions.base.starforceLimit;
  const img = mainItem?.icon;
  const base = mainItem?.itemOptions.base;
  const name = mainItem?.name;
  const cuttableCount = mainItem?.upgrade.cuttableCount;
  const type = '방어구';
  const part = mainItem?.part;
  const classType = '마법사';
  const levelDecrease = mainItem?.itemOptions.etc.equipmentLevelDecrease;
  const baseLevel = mainItem?.itemOptions.base.baseEquipmentLevel;
  const optionList = mainItem?.itemOptions;
  const { scrollUpgrade, scrollUpgradableCount } = mainItem.upgrade;
  const scroll = { scrollUpgradableCount, scrollUpgrade };

  return (
    <div className="w-80 border rounded-lg p-2 bg-[rgba(56,62,75,1)]">
      <div className="flex flex-col justify-center items-center px-2 w-full font-medium antialiased text-[11px] text-white">
        <StarForceSlot starforce={a} starforceLimit={limit} />
        <p className="text-[16px] font-sans font-bold">{name}</p>
        {cuttableCount && cuttableCount !== 255 && <p className="text-orange-400">가위 사용 잔여 횟수 : {cuttableCount}</p>}

        <Divider />

        {/* 이미지 섹션 */}
        <div className="flex justify-between w-full px-1 gap-0.5">
          <div className="flex w-20 aspect-square border rounded-md my-0.5 bg-gradient-to-t from-gray-300 to-gray-500">
            <img src={img} className="p-1 object-contain drop-shadow-[0px_1px_1px_rgba(0,0,0,0.8)] contrast-100 saturate-100 [image-rendering:pixelated]" />
          </div>

          <div className="flex flex-col items-end justify-between">
            <p className="text-gray-400 my-0.5">전투력 증가량</p>
            <div className="flex gap-1">
              <div className="border rounded-full px-2">{type}</div>
              <div className="border rounded-full px-2">{part}</div>
            </div>
          </div>
        </div>

        {/* 디테일 섹션 */}
        <div className="flex justify-between w-full gap-0.5">
          <div className="flex flex-col w-22">
            <p>착용 직업</p>
            <p>요구 레벨</p>
          </div>

          <div className="flex flex-col flex-1 h-full align-middle">
            <p>{classType}</p>
            <p>
              {levelDecrease && levelDecrease > 0 ? (
                <>
                  Lv. {baseLevel - levelDecrease} ( {baseLevel}
                  <span className="text-green-400"> - {levelDecrease}</span> )
                </>
              ) : (
                <>Lv. {baseLevel}</>
              )}
            </p>
          </div>
        </div>

        <Divider />

        <div className="flex flex-col w-full">
          <ItemOptionList options={optionList} />
        </div>
      </div>
    </div>
  );
};

const Divider = () => {
  return (
    <div className="my-1 h-[3px] w-full overflow-hidden">
      <div className="h-px w-full bg-zinc-900/90" />
      <div className="h-px w-full bg-zinc-500/30" />
      <div className="h-px w-full bg-zinc-300/30" />
    </div>
  );
};
