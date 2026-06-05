import type { CharacterEquipment, ItemEquipment } from '@maple/contracts';
import { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { EQUIPMENT_LAYOUT } from '@/types/equipment';

import { EquipmentSlot } from './EquipmentSlot';

type EquipmentGridProps = {
  characterImg: string;
  equipment: CharacterEquipment;
  onItemSelect?: (item: ItemEquipment) => void;
};

const normalizeEquipmentSlot = (slot: string) => {
  const normalized = slot.replaceAll(' ', '').trim();

  if (normalized === '펜던트1') return '펜던트';

  return normalized;
};

export const EquipmentGrid = ({ characterImg, equipment, onItemSelect }: EquipmentGridProps) => {
  const [selectedPresetNo, setSelectedPresetNo] = useState(equipment.presetNo);

  useEffect(() => {
    setSelectedPresetNo(equipment.presetNo);
  }, [equipment.presetNo]);

  const equipmentPresetByNo = useMemo(() => {
    const presetMap = new Map<number, Pick<CharacterEquipment, 'itemEquipment' | 'androidEquipment'>>();

    equipment.presets.forEach((preset) => {
      presetMap.set(preset.no, preset);
    });

    presetMap.set(equipment.presetNo, equipment);

    return presetMap;
  }, [equipment]);

  const currentPreset = equipmentPresetByNo.get(selectedPresetNo) ?? equipment;
  const currentItems = currentPreset.itemEquipment;
  const currentAndroid = currentPreset.androidEquipment ?? equipment.androidEquipment;

  const equipmentBySlot = currentItems.reduce<Record<string, ItemEquipment>>((acc, item) => {
    acc[normalizeEquipmentSlot(item.slot)] = item;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-7 grid-rows-6 gap-0.5">
      {EQUIPMENT_LAYOUT.map((cell) => {
        if (cell.slot === 'character-preview') {
          return (
            <div
              key={cell.slot}
              className="select-none overflow-hidden rounded-md border border-gray-200 bg-white/5 p-2"
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
              style={{
                gridColumn: `${cell.col} / span ${cell.colSpan ?? 1}`,
                gridRow: `${cell.row} / span ${cell.rowSpan ?? 1}`,
                WebkitUserDrag: 'none',
              }}
            >
              <div
                className={twMerge('pointer-events-none h-full w-full select-none origin-center bg-center bg-[length:175%] transition-transform duration-300 ease-out scale-150')}
                draggable={false}
                onDragStart={(event) => event.preventDefault()}
                style={{ backgroundImage: `url(${characterImg})`, WebkitUserDrag: 'none' }}
              />
            </div>
          );
        }

        const normalizedSlot = normalizeEquipmentSlot(cell.slot);
        const item = equipmentBySlot[normalizedSlot];
        const icon = cell.slot === '안드로이드' ? (currentAndroid?.icon ?? item?.icon) : item?.icon;

        return (
          <div
            key={cell.slot}
            onClick={() => {
              if (item) {
                onItemSelect?.(item);
              }
            }}
            className={item ? 'cursor-pointer' : undefined}
            style={{
              gridColumn: `${cell.col} / span ${cell.colSpan ?? 1}`,
              gridRow: `${cell.row} / span ${cell.rowSpan ?? 1}`,
            }}
          >
            <EquipmentSlot icon={icon} label={cell.slot} potentialOptionGrade={item?.potential.grade} additionalPotentialOptionGrade={item?.additional.grade} />
          </div>
        );
      })}

      {[1, 2, 3].map((presetNo) => {
        const hasPreset = equipmentPresetByNo.has(presetNo);

        return (
          <div
            key={`preset-${presetNo}`}
            style={{
              gridColumn: `${presetNo + 2} / span 1`,
              gridRow: '6 / span 1',
            }}
            className="flex justify-center items-center"
          >
            <button
              type="button"
              onClick={() => setSelectedPresetNo(presetNo)}
              disabled={!hasPreset}
              className={twMerge(
                'flex h-7 w-7 items-center justify-center rounded-md border text-xs font-semibold tabular-nums transition',
                selectedPresetNo === presetNo ? 'border-gray-700 bg-gray-500 text-white' : 'border-white/10 bg-gray-300 text-gray-400 hover:bg-gray-400 hover:text-gray-700',
                !hasPreset && 'cursor-not-allowed opacity-40 hover:bg-gray-400 hover:text-gray-400',
              )}
            >
              {presetNo}
            </button>
          </div>
        );
      })}
    </div>
  );
};
