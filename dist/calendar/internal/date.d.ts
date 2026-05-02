export type ResolvedWeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export declare function startOfDay(date: Date): Date;
export declare function endOfDay(date: Date): Date;
export declare function addDays(date: Date, amount: number): Date;
export declare function addMonths(date: Date, amount: number): Date;
export declare function startOfWeek(date: Date, weekStartsOn?: ResolvedWeekStartsOn): Date;
export declare function startOfMonth(date: Date): Date;
export declare function endOfMonth(date: Date): Date;
export declare function isSameDay(a: Date, b: Date): boolean;
export declare function isSameMonth(a: Date, b: Date): boolean;
export declare function isToday(date: Date, now?: Date): boolean;
export declare function isPast(date: Date, now?: Date): boolean;
export declare function setHours(date: Date, hour: number): Date;
export declare function getDateKey(input: Date | number): string;
export declare function getHoursOfDay(): number[];
export declare function getWeekDays(date: Date, weekStartsOn?: ResolvedWeekStartsOn): Date[];
/**
 * Returns the 6-week (42 day) grid of dates for a month-view calendar.
 * Always includes the trailing days of the previous month and leading days
 * of the next month so the grid is always 7×6.
 */
export declare function getMonthCalendarDays(date: Date, weekStartsOn?: ResolvedWeekStartsOn): Date[];
export declare function formatHour(hour: number, locale?: string): string;
export declare function formatDayOfWeek(date: Date, locale?: string, variant?: 'narrow' | 'short' | 'long'): string;
export declare function formatMonthYear(date: Date, locale?: string): string;
export declare function formatDate(date: Date, options: Intl.DateTimeFormatOptions, locale?: string): string;
