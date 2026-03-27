import { useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import { useSearchNick } from '../hooks/useSearchNick';
import type { SearchNickResponse } from '../types';

import { DatePicker } from '@/components/ui/DatePicker';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { getTodayInKorea } from '@/utils/getTodayInKorea';

export const CharacterBanner = ({ data }: { data: SearchNickResponse }) => {
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(getTodayInKorea);

  const nick = searchParams.get('nick')?.trim() ?? '';
  const { refetch, isFetching } = useSearchNick(nick);

  return (
    <div className="flex flex-col w-auto h-[240px] bg-gray-900 p-3 border border-white rounded-md m-3">
      <div className="text-white flex gap-3 items-center">
        <RefreshButton onRefresh={() => void refetch()} isRefreshing={isFetching} disabled={!nick} />
        <DatePicker value={selectedDate} onChange={setSelectedDate} />
      </div>

      <div className="flex h-full">
        <div className="h-full aspect-square border">
          <div className="bg-[length:170%] bg-center h-full" style={{ backgroundImage: `url(${data.basic.character_image})` }}></div>
        </div>
        <div className="border m-2 w-full flex flex-col">
          <ul>
            <li>
              <Label className="text-lg text-white">{data.basic.character_name}</Label>
            </li>
            <li>
              <LabelValue label="직업: " value={data.basic.character_class} />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const Label = ({ className, children }: { className?: string; children: ReactNode }) => {
  return <a className={twMerge(`${className}`, 'font-bold text-gray-300')}>{children}</a>;
};

const Value = ({ children }: { children: ReactNode }) => {
  return <a className="text-white font-bold">{children}</a>;
};

const LabelValue = ({ label, value }: { label: string; value: string }) => {
  return (
    <>
      <Label>{label}</Label>
      <Value>{value}</Value>
    </>
  );
};
