import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FiCalendar } from 'react-icons/fi';
import { twMerge } from 'tailwind-merge';

import { Calendar } from './Calendar/Calendar';

type DatePickerProps = {
  value?: string;
  onChange: (_value: string) => void;
  className?: string;
  placeholder?: string;
};

const DATE_FORMAT = 'YYYY-MM-DD';

export const DatePicker = ({ value = '', onChange, className, placeholder = '날짜 선택' }: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedDate = useMemo(() => {
    if (!value) return undefined;

    const parsed = dayjs(value, DATE_FORMAT, true);
    return parsed.isValid() ? parsed.toDate() : undefined;
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;

    const nextValue = dayjs(date).format(DATE_FORMAT);
    setInputValue(nextValue);
    onChange(nextValue);
    setIsOpen(false);
  };

  const handleInputChange = (nextValue: string) => {
    setInputValue(nextValue);

    const parsed = dayjs(nextValue, DATE_FORMAT, true);
    if (parsed.isValid()) {
      onChange(parsed.format(DATE_FORMAT));
    }
  };

  return (
    <div ref={wrapperRef} className={twMerge('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
  text-gray-900"
      >
        <FiCalendar className="h-4 w-4" />
        <span>{value || placeholder}</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-fit rounded-md border border-gray-200 bg-white p-3 shadow-lg text-black">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.currentTarget.value)}
            placeholder={DATE_FORMAT}
            className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
          />

          <Calendar mode="single" selected={selectedDate} onSelect={handleSelect} />
        </div>
      )}
    </div>
  );
};
