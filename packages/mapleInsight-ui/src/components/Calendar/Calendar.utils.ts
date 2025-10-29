import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { CalendarData, CalendarDay } from './Calendat.type';

dayjs.extend(utc);
dayjs.extend(timezone);

export function generateCalendarData(timezone = 'Asia/Seoul'): CalendarData {
  const today = dayjs().tz(timezone);
  const startOfMonth = today.startOf('month');
  const endOfMonth = today.endOf('month');
  const startWeekDay = startOfMonth.day(); // 0~6
  const daysInMonth = today.daysInMonth();

  const days: CalendarDay[] = [];

  // 이전 달로부터 채워야 하는 날짜 수
  for (let i = 0; i < startWeekDay; i++) {
    const date = startOfMonth.subtract(startWeekDay - i, 'day');
    days.push({
      date: date.format('YYYY-MM-DD'),
      day: date.day(),
      isCurrentMonth: false,
      isToday: date.isSame(today, 'day'),
    });
  }

  // 이번 달 날짜들
  for (let i = 1; i <= daysInMonth; i++) {
    const date = startOfMonth.date(i);
    days.push({
      date: date.format('YYYY-MM-DD'),
      day: date.day(),
      isCurrentMonth: true,
      isToday: date.isSame(today, 'day'),
    });
  }

  // 다음 달로 채워야 하는 칸
  const total = days.length;
  const remain = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let i = 1; i <= remain; i++) {
    const date = endOfMonth.add(i, 'day');
    days.push({
      date: date.format('YYYY-MM-DD'),
      day: date.day(),
      isCurrentMonth: false,
      isToday: date.isSame(today, 'day'),
    });
  }

  return {
    year: today.year(),
    month: today.month(),
    days,
  };
}
