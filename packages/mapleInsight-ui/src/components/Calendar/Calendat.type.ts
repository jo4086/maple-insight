export type CalendarDay = {
  date: string; // 예: '2025-07-01'
  day: number; // 요일 (0: 일, 1: 월, ...)
  isCurrentMonth: boolean;
  isToday: boolean;
};

export type CalendarData = {
  year: number;
  month: number; // 0-11 (JS 기준)
  days: CalendarDay[];
};
