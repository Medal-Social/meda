'use client';

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, X } from 'lucide-react';
import { type ComponentType, type ReactNode, useEffect, useState } from 'react';
import { cn } from '../lib/utils.js';
import type { BookingClock, BookingDaypart, BookingFormat } from './format.js';
import { renderLabel } from './internal/label-parts.js';
import { BookingButton, bookingButtonClass } from './internal/ui.js';
import { type BookingLabel, fillLabel, labelText } from './labels.js';
import { LiveStatus } from './live-status.js';
import { type SlotClassNames, slotClass } from './slots.js';
import type { BookingDayDto, BookingSlotDto, PartySlot, WizardItem } from './types.js';

/**
 * How many day chips sit under the heading.
 *
 * A thumb can scan about a week. The rest of the fetched window is picked
 * from the month, not from a wrap of every open day.
 */
const DAY_STRIP_LIMIT = 7;

/**
 * The time step — «when suits you?».
 *
 * Presentational, with one piece of state the booking machine deliberately does
 * not hold: which day the visitor is *looking at*. Nothing about it is
 * submitted and it survives no further than this screen, so putting it in the
 * machine would make the wizard remember a scroll position. What gets booked
 * still leaves here as `onPick(slot)`.
 */

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const TIME_SCREEN_LABEL_KEYS = [
  'time.heading',
  'time.dayStrip.legend',
  'time.nearest',
  'time.current',
  'time.nextFree',
  'time.shortNotice',
  'time.weekend.pct',
  'time.weekend.mixed',
  'time.month.show',
  'time.month.hide',
  'time.month.previous',
  'time.month.next',
  'time.month.heading',
  'time.month.note',
  'time.party.sequential',
  'time.party.parallel',
  'time.party.seat',
  'time.party.seatSeparator',
  'time.parallel.offer.two',
  'time.parallel.offer.other',
  'time.parallel.accept',
  'time.empty.closed',
  'time.empty.over',
  'time.empty.full',
  'time.empty.stylist',
  'time.empty.unknown',
  'time.empty.callLink',
  'time.empty.callLinkAria',
  'time.empty.callSuffix',
  'time.empty.callPlain',
  'time.loading',
  'time.skeleton.dayPlaceholder',
  'time.taken.message',
  'time.taken.close',
] as const;

/**
 * Copy for the time step. Placeholders:
 * - `time.current` `{time}`; `time.weekend.pct` `{pct}` `{price}`; `time.weekend.mixed` `{price}`
 *   (keep a non-breaking space inside «+10 %» and the price so neither wraps)
 * - `time.month.heading` `{month}` `{year}`
 * - `time.party.sequential` `{start}` `{end}`; `time.party.parallel` `{time}` `{seats}`;
 *   `time.party.seat` `{who}` `{stylist}`
 * - `time.parallel.offer.*` `{day}` `{time}` (`two` for two people, `other` for more);
 *   `time.parallel.accept` `{time}`
 * - `time.empty.closed|over|full|unknown` `{day}`; `time.empty.stylist` `{stylist}` `{day}`.
 *   `full`, `stylist` and `unknown` are the lead of a sentence the phone line
 *   finishes (end them with the dash); `closed` and `over` are whole sentences.
 * - `time.empty.callLink|callLinkAria` `{phone}`
 */
export type TimeScreenLabels = Record<(typeof TIME_SCREEN_LABEL_KEYS)[number], BookingLabel>;

// ---------------------------------------------------------------------------
// Slots and components
// ---------------------------------------------------------------------------

/**
 * `classNames` slots:
 * - `root` the section · `heading` the h2
 * - `dayStrip` the fieldset of day chips · `dayChip` / `dayChipSelected` one day chip
 * - `month` the month-view wrapper · `monthCell` / `monthCellSelected` a tappable date
 * - `surcharge` the weekend-note row
 * - `daypart` one daypart section · `daypartHeading` its h3
 * - `chip` a time chip · `chipNearest` a chip marked nearest · `chipCurrent` the current-hour chip
 * - `parallel` the «both at once» offer · `empty` the nothing-free card
 * - `nextFree` the «next free time» link-button · `shortNotice` the short-notice line
 */
export type TimeScreenSlot =
  | 'root'
  | 'heading'
  | 'dayStrip'
  | 'dayChip'
  | 'dayChipSelected'
  | 'month'
  | 'monthCell'
  | 'monthCellSelected'
  | 'surcharge'
  | 'daypart'
  | 'daypartHeading'
  | 'chip'
  | 'chipNearest'
  | 'chipCurrent'
  | 'parallel'
  | 'empty'
  | 'nextFree'
  | 'shortNotice';

export interface DayChipProps {
  /** An instant inside the day. */
  dayTs: number;
  /** «Today», «Thu 3». */
  label: string;
  selected: boolean;
  /** The resolved classes (base + selected + slot overrides). */
  className: string;
  onSelect: () => void;
}

/** One chip of the day strip: an `aria-pressed` outline button. */
export function DefaultDayChip({ label, selected, className, onSelect }: DayChipProps) {
  return (
    <BookingButton
      variant="outline"
      size="sm"
      aria-pressed={selected}
      onClick={onSelect}
      className={className}
    >
      {label}
    </BookingButton>
  );
}

export interface TimeChipProps {
  startTs: number;
  /** «14:30», a party's «15:00 → 16:00», or the current hour's «15:00 · Current time». */
  label: string;
  /** One of the nearest alternatives to a slot that was just taken. */
  nearest: boolean;
  /** The screen-reader text that says so. */
  nearestLabel: string;
  /** The hour the visitor already holds: drawn, disabled, `aria-current`. */
  current: boolean;
  /** The resolved classes (base + state + slot overrides). */
  className: string;
  onPick: () => void;
}

/** One time chip. */
export function DefaultTimeChip({
  label,
  nearest,
  nearestLabel,
  current,
  className,
  onPick,
}: TimeChipProps) {
  if (current) {
    return (
      <BookingButton variant="outline" size="lg" disabled aria-current="true" className={className}>
        {label}
      </BookingButton>
    );
  }
  return (
    <BookingButton variant="outline" size="lg" onClick={onPick} className={className}>
      {label}
      {nearest && (
        // The ring says «nearest» to everyone who can see it; this says it to
        // everyone who cannot.
        <span className="sr-only"> {nearestLabel}</span>
      )}
    </BookingButton>
  );
}

export interface TimeScreenComponents {
  DayChip?: ComponentType<DayChipProps>;
  TimeChip?: ComponentType<TimeChipProps>;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** What the weekend note says for one day. `pct: null` = the basket carries more than one rate. */
export interface WeekendNote {
  pct: number | null;
  /** The basket's total priced on the day asked about, in minor units. */
  priceOre: number;
}

/** A family, whose slots are whole visits rather than single openings. */
export interface TimeScreenParty {
  /** The basket, for the chip label — who is being served, and the family size. */
  items: WizardItem[];
  mode: 'sequential' | 'parallel';
  /** Whole visits in the mode the visitor chose. */
  slots: PartySlot[];
  /** When a back-to-back visit starting at `slot.startTs` ends (the sequential chip's «→ 16:00»). */
  chipEndTs: (slot: PartySlot) => number;
  /**
   * The rescue for a `sequential` family whose day on screen has no
   * back-to-back opening: a simultaneous visit that day, or `null`. Asked about
   * the day actually on screen, only in `sequential` mode.
   */
  alternativeFor?: (dayTs: number) => PartySlot | null;
  /** The machine holds stylist ids; the parallel chip names people. */
  resolveStylistName: (resourceId: string) => string | null;
  onPick: (slot: PartySlot) => void;
}

export interface TimeScreenProps {
  labels: TimeScreenLabels;
  format: BookingFormat;
  /** Dayparts in display order; `format.clock.daypartOf` returns their keys. */
  dayparts: readonly BookingDaypart[];
  /** Free slots, any number of days' worth. */
  slots: BookingSlotDto[];
  /**
   * The days availability was asked for, as an instant inside each. Without it
   * the strip can only be the days that have slots — and a booked-out day has
   * none, so it could never be shown.
   */
  days?: number[];
  /**
   * The business's open dates over the same window, or `null` when they could
   * not be read (NOT the same as `[]`, which says it keeps no hours at all).
   * A date missing from the list is one it keeps no hours on. This is what
   * separates «closed», «too late today» and «full» — free slots alone cannot.
   */
  openDays?: readonly BookingDayDto[] | null;
  /**
   * The stylist the visitor asked for by name. Holds the empty-day card back
   * from claiming «full»: the hours are the business's, so an open day with no
   * slots may just be a day that stylist does not work.
   */
  stylistName?: string | null;
  /** The instant that was taken while the visitor was typing, if one was. */
  takenSlotTs?: number | null;
  /** `null` renders every phone sentence without a link. */
  phone?: string | null;
  /**
   * Offer «show the whole month» under the day strip. Every cell is coloured
   * from the same days the strip is built from; nothing outside them is tappable.
   */
  monthView?: boolean;
  /**
   * The weekend note for a day: `null` when the basket never pays a surcharge,
   * otherwise its rate and the basket total priced on `dayTs` (asked about
   * weekdays too — the row is kept, empty, so a day tap cannot move the grid).
   */
  weekendNote?: (dayTs: number) => WeekendNote | null;
  /**
   * The hour the visitor already holds, when moving an appointment. Drawn among
   * the chips, marked and not tappable; availability can never return it.
   */
  currentSlotTs?: number | null;
  onPick: (slot: BookingSlotDto) => void;
  /** A family. Present, its slots replace `slots` entirely. */
  party?: TimeScreenParty;
  /** «Now», for today / tomorrow and whether today is over. Defaults to `Date.now()`. */
  now?: number;
  classNames?: SlotClassNames<TimeScreenSlot>;
  components?: TimeScreenComponents;
}

// ---------------------------------------------------------------------------
// View logic
// ---------------------------------------------------------------------------

/** How many alternatives to point at when a slot is taken: what fits under the message on a phone. */
const NEAREST_COUNT = 2;

/**
 * Where one day stands with the business — the question an empty day cannot
 * answer on its own.
 * - `unknown` — the hours could not be read.
 * - `closed` — no hours on the date, or hours posted and shut anyway (holiday).
 * - `over` — open, but the last start this visit could take has passed.
 * - `open` — open, with a start still ahead.
 */
export type DayStanding = 'unknown' | 'closed' | 'over' | 'open';

function dayStanding(
  clock: BookingClock,
  dayTs: number,
  openDays: readonly BookingDayDto[] | null | undefined,
  now: number
): DayStanding {
  if (openDays == null) return 'unknown';
  const entry = openDays.find((day) => day.dayKey === clock.dayKey(dayTs));
  if (entry === undefined || entry.lastStartTs === null) return 'closed';
  return now > entry.lastStartTs ? 'over' : 'open';
}

/**
 * The strip, in order: the days the caller offered, else the days that have
 * slots, else today — so the empty-day card always has a day to name.
 *
 * Closed days, and today once it is over, are left out (a chip is an offer);
 * a booked-out day keeps its chip, because «full» is something the visitor must
 * be able to read. A day with a bookable slot is always kept whatever the hours
 * say, and so are the day a slot was stolen from and the day of an appointment
 * being moved — the visitor is standing on them.
 */
function buildDayStrip(
  clock: BookingClock,
  slots: BookingSlotDto[],
  days: number[] | undefined,
  takenSlotTs: number | null,
  currentSlotTs: number | null,
  openDays: readonly BookingDayDto[] | null | undefined,
  now: number
): number[] {
  const bookableKeys = new Set(slots.map((slot) => clock.dayKey(slot.startTs)));
  const byKey = new Map<string, number>();
  for (const day of days ?? slots.map((slot) => slot.startTs)) {
    const standing = dayStanding(clock, day, openDays, now);
    if (!bookableKeys.has(clock.dayKey(day)) && (standing === 'closed' || standing === 'over')) {
      continue;
    }
    byKey.set(clock.dayKey(day), day);
  }
  for (const anchor of [takenSlotTs, currentSlotTs]) {
    if (anchor !== null && !byKey.has(clock.dayKey(anchor))) {
      byKey.set(clock.dayKey(anchor), anchor);
    }
  }
  if (byKey.size === 0) byKey.set(clock.dayKey(now), now);
  return [...byKey.values()].sort((a, b) => a - b);
}

/**
 * The one chip a family taps: `15:00 → 16:00`, or the parallel form
 * `15:00 (Name with Stylist · Name with Stylist)`. The parallel chip names the
 * people where the visitor has given a name and the service otherwise.
 */
function partyChipLabel(
  labels: TimeScreenLabels,
  clock: BookingClock,
  slot: PartySlot,
  party: TimeScreenParty
): string {
  if (slot.mode === 'sequential') {
    return fillLabel(labels['time.party.sequential'], {
      start: clock.formatTime(slot.startTs),
      end: clock.formatTime(party.chipEndTs(slot)),
    });
  }
  const seats = slot.seats.map((seat, index) => {
    const who = party.items[index]?.bookedForName ?? party.items[index]?.service.name ?? '';
    const stylist = party.resolveStylistName(seat.resourceId);
    // No «with», rather than «with null»: a stylist the catalogue cannot name
    // is a reload of the resource list, not a reason to hide the slot.
    return stylist === null ? who : fillLabel(labels['time.party.seat'], { who, stylist });
  });
  return fillLabel(labels['time.party.parallel'], {
    time: clock.formatTime(slot.startTs),
    seats: seats.join(labelText(labels['time.party.seatSeparator'])),
  });
}

/**
 * The instants on offer — ONE per instant. Availability is per (start,
 * resource), so «first available» returns an 11:00 once per free stylist.
 * First-seen wins, and the stylist it carries is the one submitted. A party
 * slot is reduced to its start and first stylist for everything structural.
 */
function offeredSlots(
  slots: BookingSlotDto[],
  party: TimeScreenParty | undefined
): BookingSlotDto[] {
  if (party === undefined) {
    const byStart = new Map<number, BookingSlotDto>();
    for (const slot of slots) {
      if (!byStart.has(slot.startTs)) byStart.set(slot.startTs, slot);
    }
    return [...byStart.values()];
  }
  return party.slots.map((slot) => ({
    startTs: slot.startTs,
    resourceId: slot.seats[0]?.resourceId ?? null,
  }));
}

function weekendSentence(
  labels: TimeScreenLabels,
  format: BookingFormat,
  note: WeekendNote
): ReactNode {
  const price = format.price(note.priceOre);
  return note.pct === null
    ? renderLabel(labels['time.weekend.mixed'], { price })
    : renderLabel(labels['time.weekend.pct'], { pct: note.pct, price });
}

// Month grid — pure calendar arithmetic over the business-local date, so a
// viewer in another zone is never shown a grid built around the wrong day.

function ymd(clock: BookingClock, ts: number): { year: number; month: number; day: number } {
  const [year = 0, month = 1, day = 1] = clock.dayKey(ts).split('-').map(Number);
  return { year, month, day };
}

const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

function daysInMonth(year: number, month: number): number {
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return month === 2 && leap ? 29 : (MONTH_LENGTHS[month - 1] ?? 30);
}

const SAKAMOTO = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4] as const;

/** Monday = 0 … Sunday = 6 for a calendar date. */
function weekdayIndex(year: number, month: number, day: number): number {
  const y = month < 3 ? year - 1 : year;
  const sunday0 =
    (y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) +
      SAKAMOTO[month - 1] +
      day) %
    7;
  return (sunday0 + 6) % 7;
}

/**
 * Every date of the month `ts` falls in, one instant inside each, padded with
 * `null` so the first lands under its weekday. Stepped with `dayStart`, never
 * `+ 86 400 000`, so a clock change cannot drop or double a day.
 */
function monthGrid(clock: BookingClock, ts: number): Array<number | null> {
  const { year, month, day } = ymd(clock, ts);
  const first = clock.dayStart(ts, 1 - day);
  const cells: Array<number | null> = Array.from(
    { length: weekdayIndex(year, month, 1) },
    () => null
  );
  for (let index = 0; index < daysInMonth(year, month); index += 1) {
    cells.push(clock.dayStart(first, index));
  }
  return cells;
}

// ---------------------------------------------------------------------------
// TimeScreen
// ---------------------------------------------------------------------------

export function TimeScreen({
  labels,
  format,
  dayparts,
  slots,
  days,
  openDays = null,
  stylistName = null,
  takenSlotTs = null,
  phone = null,
  weekendNote,
  currentSlotTs = null,
  monthView = false,
  onPick,
  party,
  now: nowProp,
  classNames,
  components,
}: TimeScreenProps) {
  const now = nowProp ?? Date.now();
  const { clock } = format;
  const DayChip = components?.DayChip ?? DefaultDayChip;

  const bookable = offeredSlots(slots, party);
  // The current-hour marker rides along with the real openings so the strip,
  // the daypart grouping and the chip order all place it without a second code
  // path. Every decision about whether there is anything to BOOK reads
  // `bookable` instead.
  const offered =
    currentSlotTs !== null && !bookable.some((slot) => slot.startTs === currentSlotTs)
      ? [...bookable, { startTs: currentSlotTs, resourceId: null }]
      : bookable;
  const partyByStart = new Map(party?.slots.map((slot) => [slot.startTs, slot]) ?? []);

  const offeredDays = buildDayStrip(
    clock,
    offered,
    days,
    takenSlotTs,
    currentSlotTs,
    openDays,
    now
  );
  // The chips are the near week. The month is handed the whole window, so a
  // day three weeks out stays tappable without sitting in the strip.
  const strip = offeredDays.slice(0, DAY_STRIP_LIMIT);

  // Read back through the offered days rather than held as a day of its own,
  // so new availability cannot leave the step pointing at a day no longer
  // offered — including one chosen from the month, past the chip strip.
  const [tappedDayKey, setTappedDayKey] = useState<string | null>(null);
  const [showMonth, setShowMonth] = useState(false);
  const [monthTs, setMonthTs] = useState<number | null>(null);
  const selectedDay =
    offeredDays.find((day) => clock.dayKey(day) === tappedDayKey) ??
    // A stolen slot lands the visitor back on the day they just lost.
    (takenSlotTs === null
      ? undefined
      : offeredDays.find((day) => clock.dayKey(day) === clock.dayKey(takenSlotTs))) ??
    // Moving an appointment opens on the day it is on.
    (currentSlotTs === null
      ? undefined
      : offeredDays.find((day) => clock.dayKey(day) === clock.dayKey(currentSlotTs))) ??
    offeredDays[0] ??
    now;

  const selectedKey = clock.dayKey(selectedDay);
  const daySlots = offered
    .filter((slot) => clock.dayKey(slot.startTs) === selectedKey)
    .sort((a, b) => a.startTs - b.startTs);
  const dayBookable = daySlots.filter((slot) => slot.startTs !== currentSlotTs);

  const nearest = new Set(
    takenSlotTs === null
      ? []
      : [...dayBookable]
          .sort((a, b) => Math.abs(a.startTs - takenSlotTs) - Math.abs(b.startTs - takenSlotTs))
          .slice(0, NEAREST_COUNT)
          .map((slot) => slot.startTs)
  );

  // Over the openings, never the marker.
  const earliest = bookable.reduce<BookingSlotDto | null>(
    (best, slot) => (best === null || slot.startTs < best.startTs ? slot : best),
    null
  );
  const elsewhere =
    earliest !== null && clock.dayKey(earliest.startTs) !== selectedKey ? earliest : null;

  const isToday = clock.daysBetween(now, selectedDay) === 0;

  // Whether the basket pays a surcharge on ANY day decides whether the row
  // exists; the day on screen only decides what is in it.
  const surcharge = weekendNote?.(selectedDay) ?? null;
  const alternative =
    party !== undefined && party.mode === 'sequential'
      ? (party.alternativeFor?.(selectedDay) ?? null)
      : null;

  return (
    <section
      aria-labelledby="booking-time-heading"
      className={slotClass(classNames, 'root', 'space-y-6')}
    >
      <TimeHeading labels={labels} className={classNames?.heading} />

      {strip.length > 1 && (
        <fieldset className={slotClass(classNames, 'dayStrip', 'flex flex-wrap gap-2')}>
          <legend className="sr-only">{labels['time.dayStrip.legend']}</legend>
          {strip.map((day) => {
            const selected = clock.dayKey(day) === selectedKey;
            return (
              <DayChip
                key={clock.dayKey(day)}
                dayTs={day}
                label={clock.dayChip(day, now)}
                selected={selected}
                onSelect={() => setTappedDayKey(clock.dayKey(day))}
                className={cn(
                  'rounded-full',
                  selected ? 'border-primary bg-primary/10 font-bold ring-2 ring-primary' : '',
                  classNames?.dayChip,
                  selected ? classNames?.dayChipSelected : undefined
                )}
              />
            );
          })}
        </fieldset>
      )}

      {monthView && (
        <MonthCalendar
          labels={labels}
          clock={clock}
          open={showMonth}
          onToggle={() => setShowMonth((shown) => !shown)}
          monthTs={monthTs ?? selectedDay}
          onMonth={setMonthTs}
          strip={offeredDays}
          selectedDay={selectedDay}
          now={now}
          onPickDay={(day) => setTappedDayKey(clock.dayKey(day))}
          classNames={classNames}
        />
      )}

      {surcharge !== null && (
        // The label's own pieces rather than JSX whitespace: the non-breaking
        // spaces in the label are load-bearing, and JSX whitespace between
        // children is not the place to rely on which kind of space survived.
        <p
          data-testid="surcharge-row"
          className={slotClass(classNames, 'surcharge', 'min-h-5 text-sm text-muted-foreground')}
        >
          {clock.isWeekend(selectedDay) ? weekendSentence(labels, format, surcharge) : null}
        </p>
      )}

      {/* A family whose chosen day has no back-to-back opening is offered the
          simultaneous one rather than the telephone — never beside slots that
          already exist, because it is only asked when the day is empty. */}
      {dayBookable.length === 0 && alternative && party && (
        <ParallelInstead
          labels={labels}
          clock={clock}
          slot={alternative}
          day={selectedDay}
          now={now}
          size={party.items.length}
          onAccept={() => party.onPick(alternative)}
          className={classNames?.parallel}
        />
      )}
      {dayBookable.length === 0 && !(alternative && party) && (
        <NothingFreeCard
          labels={labels}
          format={format}
          day={selectedDay}
          now={now}
          phone={phone}
          standing={dayStanding(clock, selectedDay, openDays, now)}
          stylistName={stylistName}
          className={classNames?.empty}
        />
      )}
      {dayBookable.length > 0 && (
        <DaypartSections
          labels={labels}
          clock={clock}
          dayparts={dayparts}
          daySlots={daySlots}
          nearest={nearest}
          currentSlotTs={currentSlotTs}
          party={party}
          partyByStart={partyByStart}
          onPick={onPick}
          classNames={classNames}
          TimeChip={components?.TimeChip ?? DefaultTimeChip}
        />
      )}

      {elsewhere && (
        <BookingButton
          variant="link"
          onClick={() => setTappedDayKey(clock.dayKey(elsewhere.startTs))}
          className={classNames?.nextFree}
        >
          {labels['time.nextFree']}
        </BookingButton>
      )}

      {isToday && dayBookable.length > 0 && (
        <ShortNoticeLine
          labels={labels}
          format={format}
          phone={phone}
          className={classNames?.shortNotice}
        />
      )}
    </section>
  );
}

function TimeHeading({
  labels,
  className,
}: {
  labels: Pick<TimeScreenLabels, 'time.heading'>;
  className?: string;
}) {
  return (
    <h2
      id="booking-time-heading"
      tabIndex={-1}
      className={cn('font-sans text-2xl font-bold outline-none md:text-3xl', className)}
    >
      {labels['time.heading']}
    </h2>
  );
}

// ---------------------------------------------------------------------------
// TakenToast
// ---------------------------------------------------------------------------

/** How long the «just taken» toast stays up before it gets out of the way. */
const TOAST_MS = 8000;

export interface TakenToastProps {
  labels: Pick<TimeScreenLabels, 'time.taken.message' | 'time.taken.close'>;
  /** The instant that was just lost; each new one is a fresh toast. */
  takenSlotTs: number | null;
  className?: string;
}

/**
 * «That one was just taken», as a toast over the page. Fixed, so it moves
 * nothing; the ringed chips carry the message once it has gone. Render it ONCE,
 * outside any skeleton-or-step switch, so a re-read of the openings cannot
 * remount it. The live region is mounted empty and filled after mount.
 */
export function TakenToast({ labels, takenSlotTs, className }: TakenToastProps) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (takenSlotTs === null) {
      setShown(false);
      return;
    }
    setShown(true);
    const timer = window.setTimeout(() => setShown(false), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [takenSlotTs]);
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        shown
          ? cn(
              'fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-md items-center gap-3 rounded-lg border border-secondary/40 bg-background px-5 py-3 text-sm shadow-lg',
              className
            )
          : 'sr-only'
      }
    >
      {shown && (
        <>
          <p className="flex-1">{labels['time.taken.message']}</p>
          <button
            type="button"
            aria-label={labelText(labels['time.taken.close'])}
            onClick={() => setShown(false)}
            className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-muted"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TimeScreenSkeleton
// ---------------------------------------------------------------------------

export interface TimeScreenSkeletonProps {
  labels: Pick<TimeScreenLabels, 'time.heading' | 'time.loading' | 'time.skeleton.dayPlaceholder'>;
  /** How many day chips to hold. */
  days?: number;
  /** Hold the «show the whole month» row too, when the real step will draw it. */
  monthView?: boolean;
  /** Hold the weekend-surcharge row, when the basket pays one — the real step keeps it on every day. */
  surchargeRow?: boolean;
  className?: string;
}

/**
 * The time step before its openings are in: the same heading, a strip of day
 * chips and a daypart of time chips, each built from the real chip's own button
 * classes so every box is the same size.
 */
export function TimeScreenSkeleton({
  labels,
  days = 7,
  monthView = false,
  surchargeRow = false,
  className,
}: TimeScreenSkeletonProps) {
  const dayChip = bookingButtonClass({
    variant: 'outline',
    size: 'sm',
    className: 'animate-pulse rounded-full border-border bg-muted text-transparent',
  });
  const slotChip = bookingButtonClass({
    variant: 'outline',
    size: 'lg',
    className: 'min-w-20 animate-pulse border-border bg-muted text-transparent',
  });
  return (
    <section aria-labelledby="booking-time-heading" className={cn('space-y-6', className)}>
      <TimeHeading labels={labels} />
      <LiveStatus text={labelText(labels['time.loading'])} />
      <div aria-hidden="true" className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: Math.min(days, DAY_STRIP_LIMIT) }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholders
            <span key={index} data-testid="day-chip-skeleton" className={dayChip}>
              {labels['time.skeleton.dayPlaceholder']}
            </span>
          ))}
        </div>
        {monthView && <span className="block h-8 w-36 animate-pulse rounded bg-muted" />}
        {surchargeRow && <span data-testid="surcharge-row-skeleton" className="block min-h-5" />}
        <div className="space-y-3">
          <span className="block h-7 w-32 animate-pulse rounded bg-muted" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholders
              <span key={index} data-testid="slot-skeleton" className={slotChip}>
                00:00
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Month view
// ---------------------------------------------------------------------------

/**
 * «Show the whole month» — the fetched window laid out as the month it sits in.
 * Only days the caller asked about are tappable; every other cell is inert,
 * because a calendar that let a visitor tap an unasked-about date and then
 * said «full» would be inventing a fact. Collapsed by default; navigable both
 * ways, never disabled.
 */
function MonthCalendar({
  labels,
  clock,
  open,
  onToggle,
  monthTs,
  onMonth,
  strip,
  selectedDay,
  now,
  onPickDay,
  classNames,
}: {
  labels: TimeScreenLabels;
  clock: BookingClock;
  open: boolean;
  onToggle: () => void;
  monthTs: number;
  onMonth: (ts: number) => void;
  strip: number[];
  selectedDay: number;
  now: number;
  onPickDay: (day: number) => void;
  classNames: SlotClassNames<TimeScreenSlot> | undefined;
}) {
  const offered = new Map(strip.map((day) => [clock.dayKey(day), day]));
  const cells = open ? monthGrid(clock, monthTs) : [];
  const { year, month, day: anchorDay } = ymd(clock, monthTs);
  const firstOfMonth = clock.dayStart(monthTs, 1 - anchorDay);
  const monthName = clock.monthName(month);
  const heading = renderLabel(labels['time.month.heading'], {
    month: `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)}`,
    year,
  });
  const selectedKey = clock.dayKey(selectedDay);

  return (
    <div className={slotClass(classNames, 'month', 'space-y-3')}>
      <BookingButton
        variant="link"
        size="sm"
        aria-expanded={open}
        onClick={onToggle}
        className="px-0"
      >
        {open ? labels['time.month.hide'] : labels['time.month.show']}
        {open ? (
          <ChevronUp aria-hidden="true" className="size-4" />
        ) : (
          <ChevronDown aria-hidden="true" className="size-4" />
        )}
      </BookingButton>

      {open && (
        <div className="space-y-3 rounded-lg border border-border bg-card px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <BookingButton
              variant="outline"
              size="icon"
              aria-label={labelText(labels['time.month.previous'])}
              onClick={() => onMonth(clock.dayStart(firstOfMonth, -1))}
              className="rounded-full"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </BookingButton>
            <p aria-live="polite" className="font-sans font-bold">
              {heading}
            </p>
            <BookingButton
              variant="outline"
              size="icon"
              aria-label={labelText(labels['time.month.next'])}
              onClick={() => onMonth(clock.dayStart(firstOfMonth, daysInMonth(year, month)))}
              className="rounded-full"
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </BookingButton>
          </div>

          <div aria-hidden="true" className="grid grid-cols-7 gap-1 text-center">
            {clock.weekdayHeads().map((head, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: seven fixed columns; heads may repeat in some locales
              <span key={index} className="text-xs font-bold text-muted-foreground">
                {head}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, index) => {
              if (cell === null) {
                // The blanks before the first of the month; the position is
                // the only thing that tells them apart.
                // biome-ignore lint/suspicious/noArrayIndexKey: padding cells
                return <span key={`pad-${index}`} aria-hidden="true" />;
              }
              const key = clock.dayKey(cell);
              const bookable = offered.get(key);
              const selected = key === selectedKey;
              const { day } = ymd(clock, cell);
              if (bookable === undefined) {
                return (
                  <span
                    key={key}
                    className="flex h-10 items-center justify-center rounded-md text-sm text-muted-foreground/50 tabular-nums"
                  >
                    {day}
                  </span>
                );
              }
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={selected}
                  aria-label={clock.dayLabel(bookable, now)}
                  onClick={() => onPickDay(bookable)}
                  className={cn(
                    'flex h-10 items-center justify-center rounded-md border text-sm font-bold tabular-nums transition-colors',
                    selected
                      ? 'border-primary bg-primary/10 ring-2 ring-primary'
                      : 'border-border hover:bg-muted',
                    classNames?.monthCell,
                    selected ? classNames?.monthCellSelected : undefined
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">{labels['time.month.note']}</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dayparts
// ---------------------------------------------------------------------------

/** The chosen day's openings, grouped under the dayparts. A single-service chip
 * and a whole family's visit are the same chip; only its text and what a tap
 * raises differ. */
function DaypartSections({
  labels,
  clock,
  dayparts,
  daySlots,
  nearest,
  currentSlotTs,
  party,
  partyByStart,
  onPick,
  classNames,
  TimeChip,
}: {
  labels: TimeScreenLabels;
  clock: BookingClock;
  dayparts: readonly BookingDaypart[];
  daySlots: BookingSlotDto[];
  nearest: Set<number>;
  currentSlotTs: number | null;
  party: TimeScreenParty | undefined;
  partyByStart: Map<number, PartySlot>;
  onPick: (slot: BookingSlotDto) => void;
  classNames: SlotClassNames<TimeScreenSlot> | undefined;
  TimeChip: ComponentType<TimeChipProps>;
}) {
  return dayparts.map((daypart) => {
    const items = daySlots.filter((slot) => clock.daypartOf(slot.startTs) === daypart.key);
    // An empty daypart is not a heading with nothing under it — there is
    // simply no evening on that day.
    if (items.length === 0) return null;
    return (
      <section
        key={daypart.key}
        aria-labelledby={`booking-${daypart.key}`}
        className={slotClass(classNames, 'daypart', 'space-y-3')}
      >
        <h3
          id={`booking-${daypart.key}`}
          className={slotClass(classNames, 'daypartHeading', 'font-sans text-lg font-bold')}
        >
          {daypart.label}
        </h3>
        <div className="flex flex-wrap gap-2">
          {items.map((slot) => {
            const partySlot = partyByStart.get(slot.startTs);
            const current = slot.startTs === currentSlotTs;
            const isNearest = !current && nearest.has(slot.startTs);
            let label = clock.formatTime(slot.startTs);
            if (current) {
              label = fillLabel(labels['time.current'], { time: label });
            } else if (partySlot && party) {
              label = partyChipLabel(labels, clock, partySlot, party);
            }
            return (
              <TimeChip
                key={slot.startTs}
                startTs={slot.startTs}
                label={label}
                nearest={isNearest}
                nearestLabel={labelText(labels['time.nearest'])}
                current={current}
                onPick={() => (partySlot && party ? party.onPick(partySlot) : onPick(slot))}
                className={cn(
                  'min-w-20 tabular-nums',
                  isNearest ? 'border-primary ring-2 ring-primary' : '',
                  classNames?.chip,
                  isNearest ? classNames?.chipNearest : undefined,
                  current ? classNames?.chipCurrent : undefined
                )}
              />
            );
          })}
        </div>
      </section>
    );
  });
}

// ---------------------------------------------------------------------------
// Empty-day cards
// ---------------------------------------------------------------------------

/**
 * «No back-to-back times on Thursday – but both can be seen at once at 15:00»,
 * with the button that takes it up. `onAccept` raises the whole `PartySlot`,
 * `mode` included, so the caller seats it side by side.
 */
function ParallelInstead({
  labels,
  clock,
  slot,
  day,
  now,
  size,
  onAccept,
  className,
}: {
  labels: TimeScreenLabels;
  clock: BookingClock;
  slot: PartySlot;
  day: number;
  now: number;
  size: number;
  onAccept: () => void;
  className?: string;
}) {
  const time = clock.formatTime(slot.startTs);
  const offer =
    size === 2 ? labels['time.parallel.offer.two'] : labels['time.parallel.offer.other'];
  return (
    <div
      className={cn(
        'space-y-3 rounded-lg border border-primary/40 bg-primary/5 px-5 py-4',
        className
      )}
    >
      <p className="text-sm">{renderLabel(offer, { day: clock.dayLabel(day, now), time })}</p>
      <BookingButton size="lg" onClick={onAccept} className="tabular-nums">
        {renderLabel(labels['time.parallel.accept'], { time })}
      </BookingButton>
    </div>
  );
}

/**
 * A day with nothing left, in four different situations:
 * - `closed` / `over` — say so, with no telephone (nobody is there, or the
 *   last start has gone);
 * - `open` — «full», with the telephone — or, when the visitor asked for one
 *   stylist, that stylist has nothing (the hours are the business's, so «full»
 *   could be false);
 * - `unknown` — the hours could not be read: «nothing free», true whatever they are.
 */
function NothingFreeCard({
  labels,
  format,
  day,
  now,
  phone,
  standing,
  stylistName,
  className,
}: {
  labels: TimeScreenLabels;
  format: BookingFormat;
  day: number;
  now: number;
  phone: string | null;
  standing: DayStanding;
  stylistName: string | null;
  className?: string;
}) {
  const dayLabel = format.clock.dayLabel(day, now);
  const cardClass = cn('rounded-lg border border-border bg-card px-5 py-4 text-sm', className);

  if (standing === 'closed' || standing === 'over') {
    return (
      <p className={cardClass}>
        {renderLabel(labels[standing === 'closed' ? 'time.empty.closed' : 'time.empty.over'], {
          day: dayLabel,
        })}
      </p>
    );
  }

  let lead = renderLabel(labels['time.empty.unknown'], { day: dayLabel });
  if (standing === 'open') {
    lead = stylistName
      ? renderLabel(labels['time.empty.stylist'], { stylist: stylistName, day: dayLabel })
      : renderLabel(labels['time.empty.full'], { day: dayLabel });
  }

  return (
    <p className={cardClass}>
      {lead}{' '}
      {phone ? (
        <>
          <a
            href={format.telHref(phone)}
            aria-label={fillLabel(labels['time.empty.callLinkAria'], { phone })}
            className="font-semibold text-primary underline underline-offset-4"
          >
            {renderLabel(labels['time.empty.callLink'], { phone })}
          </a>
          {labels['time.empty.callSuffix']}
        </>
      ) : (
        labels['time.empty.callPlain']
      )}
    </p>
  );
}

/**
 * Today's remaining gaps sit inside the business's lead time, so they are never
 * offered — but the chair may well be empty in an hour, and the visitor on the
 * pavement is the one customer most worth catching.
 */
function ShortNoticeLine({
  labels,
  format,
  phone,
  className,
}: {
  labels: TimeScreenLabels;
  format: BookingFormat;
  phone: string | null;
  className?: string;
}) {
  const sentence = labels['time.shortNotice'];
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {phone ? (
        <a
          href={format.telHref(phone)}
          className="font-semibold text-primary underline underline-offset-4"
        >
          {sentence}
        </a>
      ) : (
        sentence
      )}
    </p>
  );
}
