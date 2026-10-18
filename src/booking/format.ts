import type { AgeRange } from './types.js';

/**
 * The business's calendar, injected.
 *
 * Every date a booking screen draws is a date *where the business is*, not
 * where the visitor's browser is — so the screens never call `Date` getters or
 * `Intl` themselves. The booking package builds one of these per config
 * (`createClock({ timeZone, locale, dayparts })`) and passes it in; a test or a
 * story can hand in any implementation with the same shape.
 */
export interface BookingClock {
  /** `YYYY-MM-DD` of the business-local date `ts` falls on. */
  dayKey(ts: number): string;
  /** An instant at the start of the business-local day `offsetDays` after `ts`'s. DST-safe. */
  dayStart(ts: number, offsetDays?: number): number;
  /** «14:30». */
  formatTime(ts: number): string;
  /** Business-local hour 0–23. */
  hour(ts: number): number;
  isWeekend(ts: number): boolean;
  /** Whole business-local calendar days from `from` to `to` (can be negative). */
  daysBetween(from: number, to: number): number;
  /** Key of the daypart `ts` falls in (e.g. `morning`). */
  daypartOf(ts: number): string;
  /** «today» / «tomorrow» / «Thursday 3 September». */
  dayLabel(ts: number, now?: number): string;
  /** The short chip form: «Today», «Thu 3». */
  dayChip(ts: number, now?: number): string;
  /** «today 14:30» / «Thu 3 Sep 14:30». */
  when(ts: number, now?: number): string;
  /** The short date with weekday: «tor. 3. sep.» / «Thu 3 Sept». */
  date(ts: number): string;
  /** `date` plus the time: «tor. 3. sep. kl. 14:30». */
  dateTime(ts: number): string;
  /** «Thursday». */
  weekday(ts: number): string;
  /** Month name, 1–12, lower-case where the locale writes it so («september»). */
  monthName(month: number): string;
  /** Seven short weekday heads, Monday first («Mo» … «Su»). */
  weekdayHeads(): readonly string[];
}

/**
 * Everything locale- or business-dependent a screen formats, in one object.
 * Screens take it as their `format` prop. Nothing here is copy: the words come
 * through `labels`.
 */
export interface BookingFormat {
  clock: BookingClock;
  /** Minor units → display, e.g. `186000` → «1 860 kr». */
  price(minor: number): string;
  /** A `tel:` href for a phone number as written. */
  telHref(phone: string): string;
  /** A stylist's name as customers should see it (trimmed of internal suffixes). */
  stylistName(name: string): string;
  /** One or two initials for an avatar fallback. */
  initials(name: string): string;
  /** «7 år» / «6–7 years». */
  ageLabel(range: AgeRange): string;
}

/** A named part of the day for the time step, in display order (`clock.daypartOf` returns the key). */
export interface BookingDaypart {
  key: string;
  label: string;
}
