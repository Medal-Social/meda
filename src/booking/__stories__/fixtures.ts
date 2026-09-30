/**
 * Story + test fixtures for the booking screens: an invented salon («Salong
 * Demo»), a business clock built on Intl, and a frozen "now".
 *
 * Nothing here is shipped (src/**\/__stories__ is excluded from the build).
 * The clock is a small reference implementation of `BookingClock` for stories
 * and tests only — the real one is the booking package's `createClock`.
 */
import type { BookingClock, BookingDaypart, BookingFormat } from '../format.js';
import type {
  AgeRange,
  BookingDayDto,
  BookingResourceDto,
  BookingServiceDto,
  BookingSlotDto,
} from '../types.js';

const NBSP = '\u00A0';

interface DemoClockOptions {
  timeZone: string;
  locale: string;
  today: string;
  tomorrow: string;
  timePrefix: string;
  dayparts: ReadonlyArray<{ key: string; from: number }>;
}

export function createDemoClock(options: DemoClockOptions): BookingClock {
  const { timeZone, locale } = options;
  const time = new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    weekday: 'short',
  });
  const weekdayLong = new Intl.DateTimeFormat(locale, { timeZone, weekday: 'long' });
  const weekdayShortDay = new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: 'short',
    day: 'numeric',
  });
  const dayMonth = new Intl.DateTimeFormat(locale, { timeZone, day: 'numeric', month: 'short' });
  const fullDate = new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const monthLong = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' });
  const weekdayHead = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });

  function partsOf(ts: number): Record<string, string> {
    const out: Record<string, string> = {};
    for (const part of parts.formatToParts(ts)) out[part.type] = part.value;
    return out;
  }
  function offsetMs(ts: number): number {
    const p = partsOf(ts);
    const asIfUtc = Date.UTC(
      Number(p.year),
      Number(p.month) - 1,
      Number(p.day),
      Number(p.hour),
      Number(p.minute),
      Number(p.second)
    );
    return asIfUtc - (ts - (((ts % 1000) + 1000) % 1000));
  }
  function utcMidnight(ts: number): number {
    const p = partsOf(ts);
    return Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day));
  }
  const clock: BookingClock = {
    dayKey(ts) {
      const p = partsOf(ts);
      return `${p.year}-${p.month}-${p.day}`;
    },
    dayStart(ts, offsetDays = 0) {
      const p = partsOf(ts);
      const wall = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day) + offsetDays);
      const guess = wall - offsetMs(wall);
      return wall - offsetMs(guess);
    },
    formatTime: (ts) => time.format(ts),
    hour: (ts) => Number(partsOf(ts).hour),
    isWeekend(ts) {
      const weekday = partsOf(ts).weekday;
      return weekday === 'Sat' || weekday === 'Sun';
    },
    daysBetween: (from, to) => (utcMidnight(to) - utcMidnight(from)) / 86_400_000,
    daypartOf(ts) {
      const hour = clock.hour(ts);
      let key = options.dayparts[0]?.key ?? '';
      for (const part of options.dayparts) if (hour >= part.from) key = part.key;
      return key;
    },
    dayLabel(ts, now = Date.now()) {
      const days = clock.daysBetween(now, ts);
      if (days === 0) return options.today.toLocaleLowerCase(locale);
      if (days === 1) return options.tomorrow.toLocaleLowerCase(locale);
      if (days > 1 && days < 7) return weekdayLong.format(ts);
      return dayMonth.format(ts);
    },
    dayChip(ts, now = Date.now()) {
      const days = clock.daysBetween(now, ts);
      if (days === 0) return options.today;
      if (days === 1) return options.tomorrow;
      return weekdayShortDay.format(ts);
    },
    when: (ts, now = Date.now()) => `${clock.dayLabel(ts, now)} ${clock.formatTime(ts)}`,
    date: (ts) => fullDate.format(ts),
    dateTime: (ts) => `${fullDate.format(ts)} ${options.timePrefix}${time.format(ts)}`,
    weekday: (ts) => weekdayLong.format(ts),
    monthName: (month) => monthLong.format(Date.UTC(2026, month - 1, 15)),
    weekdayHeads: () =>
      // 2026-09-14 is a Monday.
      Array.from({ length: 7 }, (_, index) =>
        weekdayHead
          .format(Date.UTC(2026, 8, 14 + index))
          .replace(/\.$/, '')
          .slice(0, 2)
      ),
  };
  return clock;
}

/** Drops trailing «(…)» groups, linearly (no backtracking regex). */
function stripTrailingGroups(value: string): string {
  let rest = value.trimEnd();
  while (rest.endsWith(')')) {
    const open = rest.lastIndexOf('(');
    if (open === -1 || rest.slice(open + 1, -1).includes(')')) break;
    rest = rest.slice(0, open).trimEnd();
  }
  return rest;
}

function stylistName(name: string): string {
  const trimmed = name.trim();
  const stripped = stripTrailingGroups(trimmed) || trimmed;
  return stripped === '' ? '' : `${stripped.charAt(0).toUpperCase()}${stripped.slice(1)}`;
}

function initials(name: string): string {
  return stylistName(name)
    .split(/\s+/u)
    .map((word) => word.match(/\p{L}/u)?.[0])
    .filter((letter): letter is string => letter !== undefined)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const NB_DAYPARTS = [
  { key: 'morning', from: 0 },
  { key: 'afternoon', from: 12 },
  { key: 'evening', from: 17 },
] as const;

export const demoFormatNb: BookingFormat = {
  clock: createDemoClock({
    timeZone: 'Europe/Oslo',
    locale: 'nb-NO',
    today: 'I dag',
    tomorrow: 'I morgen',
    timePrefix: 'kl. ',
    dayparts: NB_DAYPARTS,
  }),
  price: (minor) =>
    `${Math.round(minor / 100)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)}${NBSP}kr`,
  telHref: (phone) => `tel:${phone.replace(/\s/g, '')}`,
  stylistName,
  initials,
  ageLabel: (range: AgeRange) =>
    range.min === range.max ? `${range.min} år` : `${range.min}–${range.max} år`,
};

export const demoFormatEn: BookingFormat = {
  clock: createDemoClock({
    timeZone: 'Europe/London',
    locale: 'en-GB',
    today: 'Today',
    tomorrow: 'Tomorrow',
    timePrefix: 'at ',
    dayparts: NB_DAYPARTS,
  }),
  price: (minor) => `£${(minor / 100).toFixed(minor % 100 === 0 ? 0 : 2)}`,
  telHref: (phone) => `tel:${phone.replace(/\s/g, '')}`,
  stylistName,
  initials,
  ageLabel: (range: AgeRange) =>
    range.min === range.max ? `${range.min} years` : `${range.min}–${range.max} years`,
};

export const demoDaypartsNb: BookingDaypart[] = [
  { key: 'morning', label: 'Formiddag' },
  { key: 'afternoon', label: 'Ettermiddag' },
  { key: 'evening', label: 'Kveld' },
];

export const demoDaypartsEn: BookingDaypart[] = [
  { key: 'morning', label: 'Morning' },
  { key: 'afternoon', label: 'Afternoon' },
  { key: 'evening', label: 'Evening' },
];

// ---------------------------------------------------------------------------
// «Salong Demo»
// ---------------------------------------------------------------------------

/** Monday 14 September 2026, 08:00 in Oslo. Every fixture is relative to it. */
export const DEMO_NOW = Date.UTC(2026, 8, 14, 6, 0);

export const DEMO_PHONE = '22 00 00 00';
export const DEMO_ADDRESS = 'Demogata 1, 0150 Oslo';

const base = {
  maxPerBooking: 3,
  weekendSurchargePct: 10,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 0,
};

export const demoServices: BookingServiceDto[] = [
  {
    ...base,
    id: 'svc-kids',
    name: 'Barneklipp',
    category: 'kids',
    durationMinutes: 30,
    priceOre: 39_000,
    ageMaxYears: 12,
    bookableOnline: true,
  },
  {
    ...base,
    id: 'svc-kids-wash',
    name: 'Barneklipp med vask',
    category: 'kids',
    durationMinutes: 45,
    priceOre: 49_000,
    ageMaxYears: 12,
    bookableOnline: true,
  },
  {
    ...base,
    id: 'svc-cut',
    name: 'Klipp',
    category: 'adults',
    durationMinutes: 45,
    priceOre: 69_000,
    ageMinYears: 13,
    bookableOnline: true,
  },
  {
    ...base,
    id: 'svc-colour',
    name: 'Farge og klipp',
    category: 'colour',
    durationMinutes: 120,
    priceOre: 186_000,
    bookableOnline: true,
  },
  {
    ...base,
    id: 'svc-piercing',
    name: 'Hull i ørene',
    category: 'other',
    durationMinutes: 15,
    priceOre: 45_000,
    bookableOnline: false,
  },
];

export const demoResources: BookingResourceDto[] = [
  {
    id: 'res-ada',
    name: 'Ada Demo',
    photoUrl: null,
    bio: 'Barneklipp og rolige hender.',
    serviceIds: ['svc-kids', 'svc-kids-wash', 'svc-cut'],
    sortOrder: 1,
  },
  {
    id: 'res-bo',
    name: 'Bo Eksempel (Demo)',
    photoUrl: null,
    bio: null,
    serviceIds: ['svc-kids', 'svc-cut', 'svc-colour'],
    sortOrder: 2,
  },
  {
    id: 'res-cleo',
    name: 'Cleo Prøve',
    photoUrl: null,
    bio: 'Farge, striper og lange lugger.',
    serviceIds: ['svc-colour', 'svc-cut'],
    sortOrder: 3,
  },
];

const HOUR = 3_600_000;
const MINUTE = 60_000;

/** Seven open days from DEMO_NOW: Mon–Fri 09–17, Sat 10–15, Sun closed. */
export function demoOpenDays(clock: BookingClock = demoFormatNb.clock): BookingDayDto[] {
  const days: BookingDayDto[] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const start = clock.dayStart(DEMO_NOW, offset);
    const weekday = new Date(start + 12 * HOUR).getUTCDay();
    if (weekday === 0) continue;
    const opens = start + (weekday === 6 ? 10 : 9) * HOUR;
    const closes = start + (weekday === 6 ? 15 : 17) * HOUR;
    days.push({
      dayKey: clock.dayKey(start),
      opensTs: opens,
      closesTs: closes,
      lastStartTs: closes - 30 * MINUTE,
    });
  }
  return days;
}

/** A spread of free slots over the open days, with a gap on Wednesday (full). */
export function demoSlots(clock: BookingClock = demoFormatNb.clock): BookingSlotDto[] {
  const slots: BookingSlotDto[] = [];
  for (const day of demoOpenDays(clock)) {
    const weekday = new Date(day.opensTs).getUTCDay();
    if (weekday === 3) continue;
    for (let ts = day.opensTs; ts <= (day.lastStartTs ?? day.opensTs); ts += 45 * MINUTE) {
      slots.push({ startTs: ts, resourceId: (ts / MINUTE) % 2 === 0 ? 'res-ada' : 'res-bo' });
    }
  }
  return slots;
}

/** The instants the strip is built from (one per day of the window). */
export function demoDays(clock: BookingClock = demoFormatNb.clock): number[] {
  return Array.from({ length: 7 }, (_, offset) => clock.dayStart(DEMO_NOW, offset));
}
