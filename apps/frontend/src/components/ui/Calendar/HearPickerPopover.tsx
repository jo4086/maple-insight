import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

type YearPickerPopoverProps = {
  selectedYear: number;
  onSelect: (_year: number) => void;
};

export const YearPickerPopover = ({ onSelect, selectedYear }: YearPickerPopoverProps) => {
  const years = useMemo(() => {
    const start = selectedYear + 10;
    const end = selectedYear - 20;

    return Array.from({ length: start - end + 1 }, (_, index) => start - index);
  }, [selectedYear]);

  return (
    <div className="absolute top-8 z-20 w-24 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
      <div className="max-h-48 overflow-y-auto">
        {years.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => onSelect(year)}
            className={twMerge(
              'flex w-full items-center justify-center rounded px-2 py-2 text-sm hover:bg-gray-100',
              year === selectedYear && 'bg-gray-900 font-semibold text-white hover:bg-gray-900',
            )}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
};
