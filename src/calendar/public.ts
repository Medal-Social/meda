// Root re-export for @medalsocial/meda — keeps the calendar surface accessible
// from the package root in addition to the @medalsocial/meda/calendar subpath.
export { Calendar } from './calendar.js';
export { CalendarToolbar } from './calendar-toolbar.js';
export { DayView } from './day-view.js';
export { MonthView } from './month-view.js';
export {
  type CalendarEvent,
  type CalendarLabels,
  type CalendarProps,
  type CalendarToolbarProps,
  type CalendarView,
  type DayViewProps,
  DEFAULT_CALENDAR_LABELS,
  type MonthViewProps,
  type WeekViewProps,
} from './types.js';
export { WeekView } from './week-view.js';
