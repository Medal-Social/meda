// Small set of timezone-naive date helpers used by the calendar surface.
// These intentionally operate on local-time semantics (consumer-facing
// calendars are local-time by default). Add tz-awareness later if needed.

export type ResolvedWeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, amount: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

export function addMonths(date: Date, amount: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + amount);
  // Clamp to end-of-month if original day overflows
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
}

export function startOfWeek(date: Date, weekStartsOn: ResolvedWeekStartsOn = 0): Date {
  const d = startOfDay(date);
  const diff = (d.getDay() - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

export function startOfMonth(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

export function endOfMonth(date: Date): Date {
  const d = startOfDay(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isToday(date: Date, now: Date = new Date()): boolean {
  return isSameDay(date, now);
}

export function isPast(date: Date, now: Date = new Date()): boolean {
  return date.getTime() < startOfDay(now).getTime();
}

export function setHours(date: Date, hour: number): Date {
  const d = new Date(date);
  d.setHours(hour, 0, 0, 0);
  return d;
}

export function getDateKey(input: Date | number): string {
  const d = input instanceof Date ? input : new Date(input);
  // YYYY-MM-DD in local time
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getHoursOfDay(): number[] {
  return Array.from({ length: 24 }, (_, i) => i);
}

export function getWeekDays(date: Date, weekStartsOn: ResolvedWeekStartsOn = 0): Date[] {
  const start = startOfWeek(date, weekStartsOn);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/**
 * Returns the 6-week (42 day) grid of dates for a month-view calendar.
 * Always includes the trailing days of the previous month and leading days
 * of the next month so the grid is always 7×6.
 */
export function getMonthCalendarDays(date: Date, weekStartsOn: ResolvedWeekStartsOn = 0): Date[] {
  const monthStart = startOfMonth(date);
  const gridStart = startOfWeek(monthStart, weekStartsOn);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export function formatHour(hour: number, locale = 'en-US'): string {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    hour12: true,
  }).format(d);
}

export function formatDayOfWeek(
  date: Date,
  locale = 'en-US',
  variant: 'narrow' | 'short' | 'long' = 'short'
): string {
  return new Intl.DateTimeFormat(locale, { weekday: variant }).format(date);
}

export function formatMonthYear(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

export function formatDate(
  date: Date,
  options: Intl.DateTimeFormatOptions,
  locale = 'en-US'
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}
