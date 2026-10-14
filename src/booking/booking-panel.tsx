'use client';

import { ArrowLeftRight, CreditCard, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils.js';
import type { BookingFormat } from './format.js';
import { renderLabel } from './internal/label-parts.js';
import { BookingButton } from './internal/ui.js';
import { type BookingLabel, fillLabel } from './labels.js';
import { type SlotClassNames, slotClass } from './slots.js';

/**
 * «Your appointment» — the desktop's sticky side panel: everything chosen so
 * far, the price, and the way on, in the half of a wide window a single
 * column leaves empty.
 *
 * Presentational, like the summary bar it replaces from `lg` up: the rows,
 * the total and whether «continue» does anything come in precomputed from the
 * caller's machine. A row with no answer yet says so in muted text rather
 * than disappearing, so the panel keeps its shape while it fills in.
 */

export const BOOKING_PANEL_LABEL_KEYS = [
  /** The panel's heading, «Your appointment». */
  'panel.heading',
  /** Row names. */
  'panel.who',
  'panel.service',
  'panel.time',
  'panel.stylist',
  /** A row with nothing chosen yet, «Not chosen». */
  'panel.notChosen',
  /** After the stylist's name when «first available» picked them, «first available». */
  'panel.firstAvailable',
  /** Leads the swap row, «Also free then:». */
  'panel.alsoFree',
  /** The swap button's words, «Switch». */
  'panel.swap',
  /** `{name}` — its accessible name, «Book with {name} instead». */
  'panel.swapTo',
  /** The total's words, «Total, paid at the salon». */
  'panel.total',
  /** The button, «Continue». */
  'panel.continue',
] as const;

export type BookingPanelLabels = Record<(typeof BOOKING_PANEL_LABEL_KEYS)[number], BookingLabel>;

export interface BookingPanelStylist {
  name: string;
  photoUrl?: string | null;
  /** «First available» chose them. */
  firstAvailable?: boolean;
}

export interface BookingPanelAlternative {
  resourceId: string;
  name: string;
  photoUrl?: string | null;
}

/** The small print under the button: the change rule, how to pay, where. */
export interface BookingPanelNote {
  kind: 'change' | 'payment' | 'place';
  text: ReactNode;
}

/**
 * - `root` the `<aside>`
 * - `heading` the `<h2>`
 * - `total` the total row
 * - `continue` the button
 */
export type BookingPanelSlot = 'root' | 'heading' | 'total' | 'continue';

export interface BookingPanelProps {
  labels: BookingPanelLabels;
  format: BookingFormat;
  /** «1 child, 1 adult»; `null` while nobody is chosen. */
  who: string | null;
  /** «Boys' cut · 30 min»; `null` while nothing is chosen. */
  services: string | null;
  /** The chosen start; `null` before a time is picked. */
  startTs: number | null;
  /**
   * `null` before one is chosen; `undefined` draws no row at all (a family
   * seen at once has a stylist per person, which the time chips already name).
   */
  stylist?: BookingPanelStylist | null;
  /** Others free at the same start. Drawn with `onSwap`; at most two. */
  alternatives?: readonly BookingPanelAlternative[];
  onSwap?: (resourceId: string) => void;
  /** The visit's total in minor units; `null` draws no total. */
  totalOre: number | null;
  /** Absent: no button (a step with its own, like the details form). */
  onContinue?: () => void;
  canContinue?: boolean;
  notes?: readonly BookingPanelNote[];
  classNames?: SlotClassNames<BookingPanelSlot>;
}

const NOTE_ICONS = { change: ArrowLeftRight, payment: CreditCard, place: MapPin } as const;
const MAX_ALTERNATIVES = 2;

function Face({ photoUrl }: { photoUrl?: string | null }) {
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

export function BookingPanel({
  labels,
  format,
  who,
  services,
  startTs,
  stylist,
  alternatives,
  onSwap,
  totalOre,
  onContinue,
  canContinue = false,
  notes = [],
  classNames,
}: BookingPanelProps) {
  const notChosen = (
    <span className="text-muted-foreground">{renderLabel(labels['panel.notChosen'])}</span>
  );
  const swaps = onSwap ? (alternatives ?? []).slice(0, MAX_ALTERNATIVES) : [];
  const rows: { name: BookingLabel; value: ReactNode; strong?: boolean }[] = [
    { name: labels['panel.who'], value: who ?? notChosen },
    { name: labels['panel.service'], value: services ?? notChosen },
    {
      name: labels['panel.time'],
      value: startTs === null ? notChosen : format.clock.dateTime(startTs),
      strong: startTs !== null,
    },
  ];
  if (stylist !== undefined) {
    rows.push({
      name: labels['panel.stylist'],
      value: stylist ? (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <Face photoUrl={stylist.photoUrl} />
          {format.stylistName(stylist.name)}
          {stylist.firstAvailable && (
            <span className="text-xs text-muted-foreground">
              {renderLabel(labels['panel.firstAvailable'])}
            </span>
          )}
        </span>
      ) : (
        notChosen
      ),
    });
  }

  return (
    <aside
      aria-labelledby="booking-panel-heading"
      data-testid="booking-panel"
      className={slotClass(
        classNames,
        'root',
        'rounded-lg border border-border bg-card p-5 shadow-sm'
      )}
    >
      <h2
        id="booking-panel-heading"
        className={slotClass(classNames, 'heading', 'font-sans text-xl font-bold')}
      >
        {renderLabel(labels['panel.heading'])}
      </h2>
      <dl className="mt-3 divide-y divide-border text-sm">
        {rows.map((row) => (
          <div key={fillLabel(row.name, {})} className="flex gap-3 py-2.5">
            <dt className="w-14 shrink-0 text-muted-foreground">{renderLabel(row.name)}</dt>
            <dd className={cn('min-w-0 flex-1', row.strong && 'font-semibold tabular-nums')}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      {swaps.length > 0 && (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 ps-[4.25rem] pb-2 text-sm text-muted-foreground">
          {renderLabel(labels['panel.alsoFree'])}
          {swaps.map((alternative) => (
            <span key={alternative.resourceId} className="inline-flex items-center gap-1.5">
              <Face photoUrl={alternative.photoUrl} />
              {format.stylistName(alternative.name)}
              <button
                type="button"
                aria-label={fillLabel(labels['panel.swapTo'], {
                  name: format.stylistName(alternative.name),
                })}
                onClick={() => onSwap?.(alternative.resourceId)}
                className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
              >
                {renderLabel(labels['panel.swap'])}
              </button>
            </span>
          ))}
        </p>
      )}
      {totalOre !== null && (
        <p
          className={slotClass(
            classNames,
            'total',
            'mt-2 flex items-baseline justify-between gap-3 border-t border-border pt-3 text-sm'
          )}
        >
          <span className="text-muted-foreground">{renderLabel(labels['panel.total'])}</span>
          <span className="font-sans text-lg font-bold tabular-nums">{format.price(totalOre)}</span>
        </p>
      )}
      {onContinue && (
        <BookingButton
          size="lg"
          className={slotClass(classNames, 'continue', 'mt-4 w-full')}
          disabled={!canContinue}
          onClick={onContinue}
        >
          {renderLabel(labels['panel.continue'])}
        </BookingButton>
      )}
      {notes.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {notes.map((note) => {
            const Icon = NOTE_ICONS[note.kind];
            return (
              <li key={note.kind} className="flex items-center gap-2">
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span>{note.text}</span>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
