// Small set of timezone-naive date helpers used by the calendar surface.
// These intentionally operate on local-time semantics (consumer-facing
// calendars are local-time by default). Add tz-awareness later if needed.
export function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}
export function endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}
export function addDays(date, amount) {
    const d = new Date(date);
    d.setDate(d.getDate() + amount);
    return d;
}
export function addMonths(date, amount) {
    const d = new Date(date);
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + amount);
    // Clamp to end-of-month if original day overflows
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, lastDay));
    return d;
}
export function startOfWeek(date, weekStartsOn = 0) {
    const d = startOfDay(date);
    const diff = (d.getDay() - weekStartsOn + 7) % 7;
    d.setDate(d.getDate() - diff);
    return d;
}
export function startOfMonth(date) {
    const d = startOfDay(date);
    d.setDate(1);
    return d;
}
export function endOfMonth(date) {
    const d = startOfDay(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d;
}
export function isSameDay(a, b) {
    return (a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate());
}
export function isSameMonth(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
export function isToday(date, now = new Date()) {
    return isSameDay(date, now);
}
export function isPast(date, now = new Date()) {
    return date.getTime() < startOfDay(now).getTime();
}
export function setHours(date, hour) {
    const d = new Date(date);
    d.setHours(hour, 0, 0, 0);
    return d;
}
export function getDateKey(input) {
    const d = input instanceof Date ? input : new Date(input);
    // YYYY-MM-DD in local time
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
}
export function getHoursOfDay() {
    return Array.from({ length: 24 }, (_, i) => i);
}
export function getWeekDays(date, weekStartsOn = 0) {
    const start = startOfWeek(date, weekStartsOn);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
/**
 * Returns the 6-week (42 day) grid of dates for a month-view calendar.
 * Always includes the trailing days of the previous month and leading days
 * of the next month so the grid is always 7×6.
 */
export function getMonthCalendarDays(date, weekStartsOn = 0) {
    const monthStart = startOfMonth(date);
    const gridStart = startOfWeek(monthStart, weekStartsOn);
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}
export function formatHour(hour, locale = 'en-US') {
    const d = new Date();
    d.setHours(hour, 0, 0, 0);
    return new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        hour12: true,
    }).format(d);
}
export function formatDayOfWeek(date, locale = 'en-US', variant = 'short') {
    return new Intl.DateTimeFormat(locale, { weekday: variant }).format(date);
}
export function formatMonthYear(date, locale = 'en-US') {
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}
export function formatDate(date, options, locale = 'en-US') {
    return new Intl.DateTimeFormat(locale, options).format(date);
}
