'use client';

import { cn } from '../lib/utils.js';
import type { BookingFormat } from './format.js';
import { labelParts, renderLabel } from './internal/label-parts.js';
import { BookingButton } from './internal/ui.js';
import { type BookingLabel, fillLabel } from './labels.js';
import { type SlotClassNames, slotClass } from './slots.js';

/**
 * What is about to be booked, at the top of the last step.
 *
 * Without it the details step asks for a phone number and a «confirm» under
 * no day, no time and no stylist: the visitor agrees to a price alone. This
 * card names the day (a calendar leaf), the hours, each person's services and
 * who takes them, and the total — and offers the two changes worth one tap:
 * «edit» back to the time step, and, when «first available» resolved to one
 * stylist while others are free at the same minute, a swap to one of them.
 *
 * Presentational: the caller resolves who and when (the same lines the
 * submission is built from), so the card cannot describe a different booking.
 */

export const BOOKING_RECAP_LABEL_KEYS = [
  /** Accessible name of the card, e.g. «The appointment you are booking». */
  'recap.label',
  /** `{start}` `{end}` — the visit's hours, e.g. «{start}–{end}». */
  'recap.time',
  /** `{services}` `{stylist}` — one person's line, e.g. «{services} with {stylist}». */
  'recap.line',
  /** `{who}` `{services}` `{stylist}` — a line in a family booking. */
  'recap.lineFor',
  /** The stylist part when nobody is named yet, e.g. «the first free stylist». */
  'recap.anyStylist',
  /** `{price}` — the total line, e.g. «{price}, paid at the salon». */
  'recap.total',
  /** Visible text of the edit button. */
  'recap.edit',
  /** Accessible name of the edit button, e.g. «Change day and time». */
  'recap.editLabel',
  /** `{time}` — leads the swap row, e.g. «Also free at {time}:». */
  'recap.alsoFree',
  /** `{name}` — accessible name of a swap button, e.g. «Book with {name} instead». */
  'recap.swapTo',
] as const;

export type BookingRecapLabels = Record<(typeof BOOKING_RECAP_LABEL_KEYS)[number], BookingLabel>;

/** One person's part of the visit. */
export interface BookingRecapLine {
  startTs: number;
  endTs: number;
  /** The services, in the order they are done. */
  services: readonly string[];
  /** Who takes this line; `null` until a slot names somebody. Cleaned with `format.stylistName`. */
  stylist: { name: string; photoUrl?: string | null } | null;
  /** Whose line it is; only drawn when there is more than one line. */
  who?: string | null;
}

/** A stylist free at the same start who could take the whole visit instead. */
export interface BookingRecapAlternative {
  resourceId: string;
  name: string;
  photoUrl?: string | null;
}

/**
 * - `root` the card
 * - `leaf` the calendar leaf
 * - `edit` the edit button
 * - `alternatives` the swap row
 */
export type BookingRecapSlot = 'root' | 'leaf' | 'edit' | 'alternatives';

export interface BookingRecapProps {
  /** At least one, in the order the visit runs. */
  lines: readonly BookingRecapLine[];
  /** The whole visit in minor units. */
  totalOre: number;
  format: BookingFormat;
  labels: BookingRecapLabels;
  /** Back to the time step. Absent: no edit button. */
  onEdit?: () => void;
  /** Others free at the same start. Drawn with `onSwap`; at most three are shown. */
  alternatives?: readonly BookingRecapAlternative[];
  onSwap?: (resourceId: string) => void;
  classNames?: SlotClassNames<BookingRecapSlot>;
}

const MAX_ALTERNATIVES = 3;

/** A stylist's face beside the name. Nothing without a photo: the name already says who. */
function Avatar({ photoUrl }: { photoUrl?: string | null }) {
  if (!photoUrl) return null;
  return (
    <img
      src={photoUrl}
      alt=""
      width={24}
      height={24}
      decoding="async"
      className="size-6 shrink-0 rounded-full object-cover"
    />
  );
}

export function BookingRecap({
  lines,
  totalOre,
  format,
  labels,
  onEdit,
  alternatives,
  onSwap,
  classNames,
}: BookingRecapProps) {
  const first = lines[0];
  if (!first) return null;
  const { clock } = format;
  const last = lines.reduce((latest, line) => (line.endTs > latest.endTs ? line : latest), first);
  const [, month, day] = clock.dayKey(first.startTs).split('-').map(Number);
  const many = lines.length > 1;
  const swaps = onSwap ? (alternatives ?? []).slice(0, MAX_ALTERNATIVES) : [];

  const stylistOf = (line: BookingRecapLine) =>
    line.stylist ? (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-medium text-foreground">
        <Avatar photoUrl={line.stylist.photoUrl} />
        {format.stylistName(line.stylist.name)}
      </span>
    ) : (
      renderLabel(labels['recap.anyStylist'])
    );

  return (
    <section
      aria-label={fillLabel(labels['recap.label'], {})}
      data-testid="booking-recap"
      className={slotClass(classNames, 'root', 'rounded-lg border border-border bg-card')}
    >
      <div className="flex items-start gap-4 p-4">
        {/* The day as a calendar leaf: the one fact a parent checks first. */}
        <span
          aria-hidden="true"
          className={slotClass(
            classNames,
            'leaf',
            'flex w-16 shrink-0 flex-col overflow-hidden rounded-md border border-border bg-background text-center'
          )}
        >
          <span className="truncate bg-primary px-1 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            {clock.weekday(first.startTs)}
          </span>
          <span className="pt-1 font-sans text-2xl font-bold leading-none tabular-nums">{day}</span>
          <span className="truncate px-1 pt-0.5 pb-1.5 text-[11px] text-muted-foreground">
            {month ? clock.monthName(month) : ''}
          </span>
        </span>

        <div className="min-w-0 flex-1 space-y-1">
          {/* Read in full by a screen reader; the leaf above is decoration. */}
          <p className="font-semibold tabular-nums">
            <span className="sr-only">{clock.dayLabel(first.startTs)} </span>
            {renderLabel(labels['recap.time'], {
              start: clock.formatTime(first.startTs),
              end: clock.formatTime(last.endTs),
            })}
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {lines.map((line, index) => (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: lines are positional (one per seat) and never reorder while shown.
                key={index}
                className="flex flex-wrap items-center gap-x-1"
              >
                {labelParts(many && line.who ? labels['recap.lineFor'] : labels['recap.line'], {
                  who: line.who ?? '',
                  services: line.services.join(' + '),
                  stylist: stylistOf(line),
                })}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground tabular-nums">
            {renderLabel(labels['recap.total'], { price: format.price(totalOre) })}
          </p>
        </div>

        {onEdit && (
          <BookingButton
            variant="link"
            size="sm"
            aria-label={fillLabel(labels['recap.editLabel'], {})}
            onClick={onEdit}
            className={slotClass(classNames, 'edit', 'h-auto px-0 py-0.5')}
          >
            {renderLabel(labels['recap.edit'])}
          </BookingButton>
        )}
      </div>

      {swaps.length > 0 && (
        <div
          className={slotClass(
            classNames,
            'alternatives',
            'flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border px-4 py-2.5 text-sm text-muted-foreground'
          )}
        >
          <span>
            {renderLabel(labels['recap.alsoFree'], { time: clock.formatTime(first.startTs) })}
          </span>
          {swaps.map((alternative) => (
            <button
              key={alternative.resourceId}
              type="button"
              aria-label={fillLabel(labels['recap.swapTo'], {
                name: format.stylistName(alternative.name),
              })}
              onClick={() => onSwap?.(alternative.resourceId)}
              className={cn(
                'inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 font-semibold text-primary',
                'transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              )}
            >
              <Avatar photoUrl={alternative.photoUrl} />
              {format.stylistName(alternative.name)}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
