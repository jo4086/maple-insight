import { useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import { YearPickerPopover } from './HearPickerPopover';

type CalenderHeaderProps = {
  displayMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectYear: (_year: number) => void;
};

export const CalendarHeader = ({ displayMonth, onNextMonth, onPrevMonth, onSelectYear }: CalenderHeaderProps) => {
  const [isYearOpen, setIsYearOpen] = useState(false);

  const year = displayMonth.getFullYear();
  const monthLabel = useMemo(() => `${displayMonth.getMonth() + 1}월`, [displayMonth]);

  return (
    <div className="relative mb-3 flex flex-col items-center gap-2">
      <button type="button" onClick={() => setIsYearOpen((prev) => !prev)} className="text-sm font-semibold text-gray-900">
        {year}
      </button>

      {isYearOpen && (
        <YearPickerPopover
          selectedYear={year}
          onSelect={(nextYear) => {
            onSelectYear(nextYear);
            setIsYearOpen(false);
          }}
        />
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrevMonth}
          className="flex h-8 w-8 items-center justify-center
  rounded-md border border-gray-200 hover:bg-gray-100"
        >
          <FiChevronLeft />
        </button>

        <div className="min-w-16 text-center text-sm font-medium text-gray-900">{monthLabel}</div>

        <button
          type="button"
          onClick={onNextMonth}
          className="flex h-8 w-8 items-center justify-center
  rounded-md border border-gray-200 hover:bg-gray-100"
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};
