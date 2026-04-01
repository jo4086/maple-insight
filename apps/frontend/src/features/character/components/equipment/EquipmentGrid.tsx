import { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { type ItemEquipmentProps } from '../../types';
import { EQUIPMENT_LAYOUT } from '../../types/equipment';

import { EquipmentSlot } from './EquipmentSlot';

type EquipmentGridProps = {
  items: ItemEquipmentProps[];
  initialPresetNo?: number;
  preset1?: ItemEquipmentProps[];
  preset2?: ItemEquipmentProps[];
  preset3?: ItemEquipmentProps[];
};

export const EquipmentGrid = ({ items, initialPresetNo = 1, preset1, preset2, preset3 }: EquipmentGridProps) => {
  const [selectedPresetNo, setSelectedPresetNo] = useState(initialPresetNo);

  const presetMap = useMemo(
    () => ({
      1: preset1 ?? items,
      2: preset2 ?? [],
      3: preset3 ?? [],
    }),
    [items, preset1, preset2, preset3],
  );

  const currentItems = presetMap[selectedPresetNo as 1 | 2 | 3] ?? items;
  const equipmentBySlot = Object.fromEntries(currentItems.map((item) => [item.item_equipment_slot, item]));

  return (
    <div className="grid grid-cols-7 grid-rows-6 gap-0.5">
      {EQUIPMENT_LAYOUT.map((cell) => {
        if (cell.slot === 'character-preview') {
          return (
            <div
              key={cell.slot}
              className="rounded-2xl border border-white/10 bg-white/5"
              style={{
                gridColumn: `${cell.col} / span ${cell.colSpan ?? 1}`,
                gridRow: `${cell.row} / span ${cell.rowSpan ?? 1}`,
              }}
            />
          );
        }

        const item = equipmentBySlot[cell.slot];

        return (
          <div
            key={cell.slot}
            style={{
              gridColumn: `${cell.col} / span ${cell.colSpan ?? 1}`,
              gridRow: `${cell.row} / span ${cell.rowSpan ?? 1}`,
            }}
          >
            <EquipmentSlot
              icon={item?.item_icon}
              label={cell.slot}
              potentialOptionGrade={item?.potential_option_grade}
              additionalPotentialOptionGrade={item?.additional_potential_option_grade}
            />
          </div>
        );
      })}

      {[1, 2, 3].map((presetNo) => {
        const hasPreset = (presetMap[presetNo as 1 | 2 | 3] ?? []).length > 0;

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
