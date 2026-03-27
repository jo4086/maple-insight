import { addMonths, setYear } from 'date-fns';
import { useState } from 'react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { twMerge } from 'tailwind-merge';

import { CalendarHeader } from './CalendarHeader';

import 'react-day-picker/style.css';

type CalendarProps = DayPickerProps & {
  className?: string;
};

export function Calendar({ className, classNames, month: controlledMonth, onMonthChange, ...props }: CalendarProps) {
  const [internalMonth, setInternalMonth] = useState<Date>(controlledMonth ?? new Date());
  const displayMonth = controlledMonth ?? internalMonth;

  const handleMonthChange = (nextMonth: Date) => {
    if (!controlledMonth) {
      setInternalMonth(nextMonth);
    }

    onMonthChange?.(nextMonth);
  };

  return (
    <DayPicker
      showOutsideDays
      month={displayMonth}
      onMonthChange={handleMonthChange}
      hideNavigation
      captionLayout="label"
      className={twMerge('rounded-md bg-white p-3 text-gray-900', className)}
      classNames={{
        months: 'flex flex-col gap-4',
        month: 'flex flex-col gap-2',
        month_caption: 'hidden',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'w-9 text-center text-xs font-medium text-gray-500',
        week: 'mt-2 flex w-full',
        day: 'h-9 w-9 p-0 text-sm',
        day_button: 'h-9 w-9 rounded-md transition hover:bg-gray-100 aria-selected:bg-gray-900 aria-selected:text-white',
        selected: 'bg-gray-900 text-white',
        today: 'font-bold text-blue-600',
        outside: 'text-gray-400 opacity-50',
        disabled: 'text-gray-300 opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        MonthCaption: () => (
          <CalendarHeader
            displayMonth={displayMonth}
            onPrevMonth={() => handleMonthChange(addMonths(displayMonth, -1))}
            onNextMonth={() => handleMonthChange(addMonths(displayMonth, 1))}
            onSelectYear={(year) => handleMonthChange(setYear(displayMonth, year))}
          />
        ),
      }}
      {...props}
    />
  );
}
