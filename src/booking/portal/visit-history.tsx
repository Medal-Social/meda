'use client';

import { type ComponentType, useState } from 'react';
import { cn } from '../../lib/utils.js';
import type { BookingClock, BookingFormat } from '../format.js';
import { fillLabel } from '../labels.js';
import { type SlotClassNames, slotClass } from '../slots.js';
import type { PortalBookingDto } from '../types.js';

export const VISIT_HISTORY_LABEL_KEYS = [
  'history.heading',
  'history.empty',
  'history.serviceFallback',
  'history.count.one',
  'history.count.other',
  'history.unknownAmount',
] as const;

/** `history.count.*` take `{count}` and `{year}`. */
export type VisitHistoryLabels = Record<(typeof VISIT_HISTORY_LABEL_KEYS)[number], string>;

/**
 * - `root`: the section. - `heading`. - `empty`: the no-visits box.
 * - `yearChip` / `yearChipSelected`: the year switcher's buttons.
 * - `list`. - `row`: one visit. - `total`: the year's summary bar.
 */
export type VisitHistorySlot =
  | 'root'
  | 'heading'
  | 'empty'
  | 'yearChip'
  | 'yearChipSelected'
  | 'list'
  | 'row'
  | 'total';

/**
 * One year of completed visits, newest first. `totalOre` is `null` unless
 * EVERY visit that year carried a price — «we do not know», not «nothing».
 *
 * (Declared here: the shared `VisitYear` in `types.ts` carries `bookings` but
 * no total.)
 */
export interface VisitHistoryYear {
  year: number;
  visits: PortalBookingDto[];
  totalOre: number | null;
}

/**
 * The visits behind the history section, grouped by the year the BUSINESS
 * says they happened in (a visit at 00:30 on 1 January belongs to the year the
 * business's calendar says, not the reader's).
 *
 * Completed only: a cancelled appointment is not a visit that happened, and
 * adding it to a year's total would bill the user for a chair nobody sat in.
 */
export function visitHistoryYears(
  past: readonly PortalBookingDto[],
  clock: Pick<BookingClock, 'dayKey'>
): VisitHistoryYear[] {
  const byYear = new Map<number, PortalBookingDto[]>();
  for (const booking of past) {
    if (booking.status !== 'completed') continue;
    const year = Number(clock.dayKey(booking.startTs).slice(0, 4));
    const bucket = byYear.get(year);
    if (bucket === undefined) byYear.set(year, [booking]);
    else bucket.push(booking);
  }
  return [...byYear.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, visits]) => {
      // ALL or nothing: summing only the priced rows would show a total smaller
      // than what was actually paid, labelled as the year's spending.
      const unknown = visits.some((visit) => visit.amountOre === null);
      return {
        year,
        visits: visits.sort((a, b) => b.startTs - a.startTs),
        totalOre: unknown ? null : visits.reduce((sum, visit) => sum + (visit.amountOre ?? 0), 0),
      };
    });
}

export interface VisitRowProps {
  visit: PortalBookingDto;
  labels: VisitHistoryLabels;
  format: BookingFormat;
  classNames?: SlotClassNames<VisitHistorySlot>;
}

export interface VisitHistoryComponents {
  VisitRow?: ComponentType<VisitRowProps>;
}

export interface VisitHistoryProps {
  /** Past bookings in any order and status; only completed ones are shown. */
  past: PortalBookingDto[];
  labels: VisitHistoryLabels;
  format: BookingFormat;
  /** Precomputed years; default `visitHistoryYears(past, format.clock)`. */
  years?: VisitHistoryYear[];
  /** `id` of the heading. Default `portal-history-heading`. */
  headingId?: string;
  classNames?: SlotClassNames<VisitHistorySlot>;
  components?: VisitHistoryComponents;
}

/**
 * «History» — every visit behind this user, by year, with the year's count
 * and total. No receipt link: a button that downloaded nothing would be worse
 * than the honest absence; the row still carries what a receipt would say.
 */
export function VisitHistory({
  past,
  labels,
  format,
  years: yearsProp,
  headingId = 'portal-history-heading',
  classNames,
  components,
}: VisitHistoryProps) {
  const years = yearsProp ?? visitHistoryYears(past, format.clock);
  const [selected, setSelected] = useState<number | null>(null);
  const shown = years.find((year) => year.year === selected) ?? years[0];
  const Row = components?.VisitRow ?? DefaultVisitRow;

  return (
    <section aria-labelledby={headingId} className={slotClass(classNames, 'root', 'space-y-4')}>
      <h2
        id={headingId}
        className={slotClass(classNames, 'heading', 'font-sans text-xl font-bold md:text-2xl')}
      >
        {labels['history.heading']}
      </h2>

      {shown === undefined ? (
        <p
          className={slotClass(
            classNames,
            'empty',
            'rounded-lg border border-border bg-card px-5 py-4 text-muted-foreground'
          )}
        >
          {labels['history.empty']}
        </p>
      ) : (
        <>
          {years.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {years.map((year) => {
                const pressed = year.year === shown.year;
                return (
                  <button
                    key={year.year}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => setSelected(year.year)}
                    className={cn(
                      slotClass(
                        classNames,
                        'yearChip',
                        'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
                        pressed
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border hover:bg-muted'
                      ),
                      pressed && classNames?.yearChipSelected
                    )}
                  >
                    {year.year}
                  </button>
                );
              })}
            </div>
          )}

          <ul
            className={slotClass(
              classNames,
              'list',
              'divide-y divide-border border-y border-border'
            )}
          >
            {shown.visits.map((visit) => (
              <Row
                key={visit.bookingId}
                visit={visit}
                labels={labels}
                format={format}
                classNames={classNames}
              />
            ))}
          </ul>

          <p
            className={slotClass(
              classNames,
              'total',
              'flex flex-wrap items-baseline justify-between gap-3 rounded-lg bg-muted px-5 py-4'
            )}
          >
            <span className="font-semibold">
              {fillLabel(
                labels[shown.visits.length === 1 ? 'history.count.one' : 'history.count.other'],
                { count: shown.visits.length, year: shown.year }
              )}
            </span>
            <span className="font-sans text-lg font-bold tabular-nums">
              {shown.totalOre === null
                ? labels['history.unknownAmount']
                : format.price(shown.totalOre)}
            </span>
          </p>
        </>
      )}
    </section>
  );
}

/** One visit (an `<li>`): what, then when · who for · who with, and the price. */
export function DefaultVisitRow({ visit, labels, format, classNames }: VisitRowProps) {
  const detail = [format.clock.date(visit.startTs), visit.bookedForName, visit.resourceName]
    .filter(Boolean)
    .join(' · ');
  return (
    <li
      className={slotClass(classNames, 'row', 'flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4')}
    >
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">
          {visit.serviceName ?? labels['history.serviceFallback']}
        </span>
        <span className="block text-sm text-muted-foreground">{detail}</span>
      </span>
      <span className="font-bold tabular-nums">
        {visit.amountOre === null ? labels['history.unknownAmount'] : format.price(visit.amountOre)}
      </span>
    </li>
  );
}
