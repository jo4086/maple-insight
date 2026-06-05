import type { ItemEquipment } from '@maple/contracts';
import { FaSquareFull } from 'react-icons/fa';

import { ItemOptionList } from './ItemOptionList';
import { StarForceSlot } from './StarForceSlot';

interface EquipmentCardProps {
  item: ItemEquipment;
}

type PotentialInfo = ItemEquipment['potential'];

const POTENTIAL_GRADE_META = {
  레전드리: { label: 'L', className: 'text-[#cdff14]' },
  legendary: { label: 'L', className: 'text-[#cdff14]' },
  유니크: { label: 'U', className: 'text-[#ffc901]' },
  unique: { label: 'U', className: 'text-[#ffc901]' },
  에픽: { label: 'E', className: 'text-[#b472f1]' },
  epic: { label: 'E', className: 'text-[#b472f1]' },
  레어: { label: 'R', className: 'text-[#66ffff]' },
  rare: { label: 'R', className: 'text-[#66ffff]' },
  노멀: { label: 'N', className: 'text-[#66ffff]' },
  normal: { label: 'N', className: 'text-[#66ffff]' },
} as const;

function getPotentialGradeMeta(grade: string | null) {
  if (!grade) return null;

  return POTENTIAL_GRADE_META[grade.trim().toLowerCase() as keyof typeof POTENTIAL_GRADE_META] ?? POTENTIAL_GRADE_META[grade as keyof typeof POTENTIAL_GRADE_META] ?? null;
}

function getRequiredLevelText({ baseLevel, levelDecrease }: { baseLevel: number; levelDecrease: number }) {
  if (levelDecrease <= 0) return <>Lv. {baseLevel}</>;

  return (
    <>
      Lv. {baseLevel - levelDecrease} ( {baseLevel}
      <span className="text-green-400"> - {levelDecrease}</span> )
    </>
  );
}

function isSpecialSkillRing(item: ItemEquipment) {
  return item.specialRingLevel > 0;
}

function isMedal(item: ItemEquipment) {
  return item.part === '훈장';
}

function getSpecialSkillRingTypeText(item: ItemEquipment) {
  if (!isSpecialSkillRing(item)) return null;

  return item.name.startsWith('컨티뉴어스 링') ? '패시브 특수 스킬 반지' : '액티브 특수 스킬 반지';
}

function getGrantedSkillDisplayNames(item: ItemEquipment) {
  const grantedSkills = item.grantedSkills ?? [];

  if (!isSpecialSkillRing(item)) return grantedSkills;

  return grantedSkills.map((skillName) => `[특수 스킬 반지] ${skillName}`);
}

function ScrollUpgradeText({ item }: { item: ItemEquipment }) {
  if (item.scrollUpgradeEnabled === false) {
    return null;
  }

  const legacyItem = item as ItemEquipment & {
    scrollUpgradableCount?: number;
  };
  const scrollUpgrade = item.scrollUpgrade ?? 0;
  const scrollUpgradeableCount = item.scrollUpgradeableCount ?? legacyItem.scrollUpgradableCount ?? 0;
  const scrollResilienceCount = item.scrollResilienceCount ?? 0;
  const scrollFlag = item.scrollFlag ?? !(scrollResilienceCount === 0 && scrollUpgrade === 0);
  const detailText = `(잔여 ${scrollUpgradeableCount}회, 복구 가능 ${scrollResilienceCount}회)`;

  if (!scrollFlag) {
    return <span className="text-gray-400">주문서 강화 없음{detailText}</span>;
  }

  return (
    <span>
      주문서 강화 {scrollUpgrade}회{detailText}
    </span>
  );
}

function DisabledEnhancementText({ item }: { item: ItemEquipment }) {
  const disabledEnhancements = [
    item.starforceEnabled === false ? '스타포스' : null,
    item.scrollUpgradeEnabled === false ? '주문서' : null,
    item.addOptionEnabled === false ? '추가옵션' : null,
  ].filter((name): name is string => Boolean(name));

  if (disabledEnhancements.length === 0) {
    return null;
  }

  return <span className="text-gray-400">{disabledEnhancements.join(', ')} 강화 불가</span>;
}

function PotentialSection({ title, potential, enabled }: { title: string; potential: PotentialInfo; enabled: boolean }) {
  const visibleOptions = potential.options.filter((line) => Boolean(line.option));
  const isEmpty = !potential.grade && visibleOptions.length === 0;

  if (!enabled || isEmpty) {
    return (
      <ul className="flex flex-col items-start text-gray-400">
        <li className="flex items-center gap-1">
          <span>[x]</span>
          <span>{title}</span>
          <span>:</span>
          <span>{enabled ? '없음' : '강화 불가'}</span>
        </li>
      </ul>
    );
  }

  const gradeMeta = getPotentialGradeMeta(potential.grade);

  return (
    <ul className="flex flex-col items-start">
      <li className={`flex items-center gap-1 ${gradeMeta?.className ?? ''}`}>
        {gradeMeta && <span>[{gradeMeta.label}]</span>}
        <span>{title}</span>
        {potential.grade && (
          <>
            <span>:</span>
            <span>{potential.grade}</span>
          </>
        )}
      </li>
      {visibleOptions.map((line, index) => {
        const lineGradeMeta = getPotentialGradeMeta(line.grade);

        return (
          <li key={`${title}-${index}`} className="px-1 flex items-center gap-1">
            <FaSquareFull size={5} className={lineGradeMeta?.className} />
            {line.option}
          </li>
        );
      })}
    </ul>
  );
}

export const EquipmentCard = ({ item }: EquipmentCardProps) => {
  const levelDecrease = item.options.base.equipmentLevelDecrease;
  const starforceEnabled = item.starforceEnabled !== false;
  const potentialEnabled = item.potentialEnabled !== false;
  const specialSkillRingTypeText = getSpecialSkillRingTypeText(item);
  const grantedSkills = getGrantedSkillDisplayNames(item);
  const hasGrantedSkills = grantedSkills.length > 0;
  const medal = isMedal(item);

  return (
    <div className="h-fit w-full min-w-[280px] max-w-[340px] select-none rounded-lg border bg-[rgba(56,62,75,1)] p-2">
      <div className="flex w-full flex-col items-center justify-center px-2 font-medium antialiased text-[11px] text-white">
        {starforceEnabled && <StarForceSlot starforce={item.starforce} starforceLimit={item.starforceLimit} />}
        <p className="max-w-full break-keep text-center font-sans text-[16px] font-bold leading-5">{item.name}</p>
        {item.cuttableCount !== 0 && item.cuttableCount !== 255 && <p className="text-orange-400">가위 사용 잔여 횟수 : {item.cuttableCount}</p>}

        <Divider />

        <div className="flex w-full justify-between gap-2 px-1">
          <div className="my-0.5 flex aspect-square w-[26%] max-w-22 min-w-18 items-center justify-center rounded-md border bg-gradient-to-t from-gray-300 to-gray-500">
            <img
              src={item.icon}
              alt={item.name}
              referrerPolicy="no-referrer"
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
              className="h-full w-full p-2 object-contain drop-shadow-[0px_1px_1px_rgba(0,0,0,0.8)] contrast-100 saturate-100 [image-rendering:pixelated]"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-end justify-between">
            <p className="text-gray-400 my-0.5">전투력 증가량</p>
            <div className="flex max-w-full flex-wrap justify-end gap-1">
              <div className="max-w-full rounded-full border px-2">{item.category}</div>
              <div className="max-w-full rounded-full border px-2">{item.part}</div>
            </div>
          </div>
        </div>

        <div className="flex w-full justify-between gap-2">
          <div className="flex w-[28%] min-w-20 flex-col">
            <p>착용 직업</p>
            <p>요구 레벨</p>
            {specialSkillRingTypeText && <p>반지 종류</p>}
          </div>

          <div className="flex h-full min-w-0 flex-1 flex-col align-middle">
            <p>{item.classType}</p>
            <p>{getRequiredLevelText({ baseLevel: item.baseLevel, levelDecrease })}</p>
            {specialSkillRingTypeText && <p>{specialSkillRingTypeText}</p>}
          </div>
        </div>

        <Divider />

        {(item.setName || hasGrantedSkills) && (
          <div className="flex w-full justify-between gap-2">
            <div className="flex w-[28%] min-w-20 flex-col">
              {item.setName && <p>세트 효과</p>}
              {hasGrantedSkills && <p>사용 가능 스킬</p>}
            </div>

            <div className="flex h-full min-w-0 flex-1 flex-col align-middle">
              {item.setName && <p>{item.setName}</p>}
              {hasGrantedSkills && <p>{grantedSkills.join(', ')}</p>}
            </div>
          </div>
        )}

        <div className="flex flex-col w-full">
          <ItemOptionList options={item.options} />
        </div>

        {item.description && <p className="mt-1 w-full whitespace-pre-line text-gray-300">{item.description}</p>}

        {!medal && (
          <div className="mt-1 flex w-full flex-col items-start">
            <DisabledEnhancementText item={item} />
            <ScrollUpgradeText item={item} />
          </div>
        )}

        {!medal && (
          <>
            <Divider />

            <div className="flex flex-col w-full gap-1">
              <PotentialSection title="잠재능력" potential={item.potential} enabled={potentialEnabled} />
              <PotentialSection title="에디셔널 잠재능력" potential={item.additional} enabled={potentialEnabled} />
            </div>
          </>
        )}

        {medal && <p className="mt-2 w-full text-orange-400">중복 소지 불가</p>}
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
