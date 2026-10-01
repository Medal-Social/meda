'use client';

import type { ComponentType } from 'react';
import type { BookingFormat } from './format.js';
import { joinLabelParts, renderLabel } from './internal/label-parts.js';
import { BookingButton } from './internal/ui.js';
import { type BookingLabel, fillLabel, labelText } from './labels.js';
import { type SlotClassNames, slotClass } from './slots.js';
import type { WizardItem } from './types.js';

/**
 * The confirmation screen — the one the whole flow exists to reach.
 *
 * Presentational, and computes nothing about the booking: each line's start
 * and price, the total, and the calendar file all come in precomputed from the
 * same machine the details step read, so the number the visitor agreed to and
 * the number on this card cannot drift apart.
 *
 * Everything it was not given, it does not draw: an empty address line or a
 * link to a page that 404s reads as a booking that did not quite happen.
 */

export const CONFIRMATION_LABEL_KEYS = [
  'confirmation.heading',
  /** `{service}` booked for `{name}` (used when a name is known). */
  'confirmation.serviceFor',
  /** `{day}` `{time}` — the single booking's «when». */
  'confirmation.when',
  /** `{day}` — the family card's heading. */
  'confirmation.party.heading',
  /** `{time} {name} – {service} {stylist} – {price}`; blank parts collapse. */
  'confirmation.party.line',
  /** `{name}` — the stylist part of a family line. */
  'confirmation.party.stylist',
  /** `{total}` — the family card's total line. */
  'confirmation.party.total',
  'confirmation.calendar',
  'confirmation.manage',
  /** `{who}` `{time}` — accessible name of a family line's manage link. */
  'confirmation.manageFor',
  'confirmation.portal',
  'confirmation.startOver',
] as const;

export type ConfirmationLabels = Record<(typeof CONFIRMATION_LABEL_KEYS)[number], BookingLabel>;

/**
 * One booked line (one person's appointment). One array rather than parallel
 * lists, because every part answers about the SAME line.
 */
export interface ConfirmationLine {
  /** With the booked-for name filled in. */
  item: WizardItem;
  /** THIS line's own booking id. */
  bookingId: string;
  /** Who takes this line; `null` = «first available» not worth naming. Cleaned with `format.stylistName`. */
  stylistName: string | null;
  /** Where this line's own booking is managed; `null` draws no link. */
  manageHref: string | null;
  /** When this line starts (a sequential party runs back to back). */
  startTs: number;
  /** What this line costs on the day it is booked for, in minor units. */
  priceOre: number;
}

/**
 * - `root` the `<section>`
 * - `heading` the `<h2>`
 * - `card` the single booking's card
 * - `partyCard` the family card
 * - `address` the address line
 * - `link` every text link (calendar, manage, portal)
 * - `startOver` the «book again» button
 */
export type ConfirmationSlot =
  | 'root'
  | 'heading'
  | 'card'
  | 'partyCard'
  | 'address'
  | 'link'
  | 'startOver';

export interface PartyLineProps {
  /** The line, with its stylist name already cleaned. */
  line: ConfirmationLine;
  /** The whole line as a sentence, e.g. «15:00 Name – Service with Stylist – 490 kr». */
  text: string;
  /** Visible manage-link text. */
  manageLabel: string;
  /** Accessible manage-link name, naming whose appointment it is. */
  manageAriaLabel: string;
  linkClassName?: string;
}

/** One row of the family card: the line and its own manage link. Renders an `<li>`. */
export function DefaultPartyLine({
  line,
  text,
  manageLabel,
  manageAriaLabel,
  linkClassName,
}: PartyLineProps) {
  return (
    <li className="flex flex-wrap items-baseline gap-x-3">
      <span className="tabular-nums">{text}</span>
      {line.manageHref && (
        <a
          href={line.manageHref}
          // The visible words stay short; the accessible name says whose appointment it is.
          aria-label={manageAriaLabel}
          className={
            linkClassName ?? 'text-sm font-semibold text-primary underline underline-offset-4'
          }
        >
          {manageLabel}
        </a>
      )}
    </li>
  );
}

export interface ConfirmationComponents {
  PartyLine?: ComponentType<PartyLineProps>;
}

export interface ConfirmationProps {
  /** One per booked person, in the order they sit down. */
  lines: readonly ConfirmationLine[];
  /** When the visit starts. */
  startTs: number;
  /** The visit's total in minor units. */
  totalOre: number;
  address?: string | null;
  /** The calendar file (e.g. a `data:text/calendar` URL). `null` draws no link. */
  calendarHref?: string | null;
  /** `download` filename for the calendar link. Required for a `data:` URL to work. */
  calendarFileName?: string;
  /** Where all of the visitor's bookings are listed. `null` draws no link. */
  portalHref?: string | null;
  /** A way back to an empty wizard. Absent, the button is not drawn. */
  onStartOver?: () => void;
  /** «today» is relative to this. Read once, so it cannot change mid-card. */
  now?: number;
  format: BookingFormat;
  labels: ConfirmationLabels;
  classNames?: SlotClassNames<ConfirmationSlot>;
  components?: ConfirmationComponents;
}

const SEPARATOR = ' · ';

export function Confirmation({
  lines: rawLines,
  startTs,
  totalOre,
  address = null,
  calendarHref = null,
  calendarFileName = 'booking.ics',
  portalHref = null,
  onStartOver,
  now = Date.now(),
  format,
  labels,
  classNames,
  components,
}: ConfirmationProps) {
  const { clock } = format;
  // Cleaned here as well as upstream: a restored confirmation carries whatever
  // name was resolved when it was stored.
  const lines = rawLines.map((line) => ({
    ...line,
    stylistName: line.stylistName ? format.stylistName(line.stylistName) || null : null,
  }));
  const linkClass = slotClass(
    classNames,
    'link',
    'font-semibold text-primary underline underline-offset-4'
  );
  const first = lines[0];
  const singleCard = first ? (
    <p
      className={slotClass(
        classNames,
        'card',
        'rounded-lg border border-border bg-card px-5 py-4 font-medium'
      )}
    >
      {/* Filtered, not conditionally joined: an absent stylist closes the gap. */}
      {joinLabelParts(
        [
          first.item.bookedForName
            ? renderLabel(labels['confirmation.serviceFor'], {
                service: first.item.service.name,
                name: first.item.bookedForName,
              })
            : first.item.service.name,
          first.stylistName,
          renderLabel(labels['confirmation.when'], {
            day: clock.dayLabel(startTs, now),
            time: clock.formatTime(startTs),
          }),
          // This line's own price, which for one person is the whole total.
          format.price(first.priceOre),
        ],
        SEPARATOR
      )}
    </p>
  ) : null;

  return (
    <section
      aria-labelledby="booking-confirmed-heading"
      className={slotClass(classNames, 'root', 'space-y-6')}
    >
      <h2
        id="booking-confirmed-heading"
        tabIndex={-1}
        className={slotClass(
          classNames,
          'heading',
          'font-sans text-2xl font-bold outline-none md:text-3xl'
        )}
      >
        {labels['confirmation.heading']}
      </h2>

      {lines.length > 1 ? (
        <PartyCard
          lines={lines}
          totalOre={totalOre}
          now={now}
          format={format}
          labels={labels}
          classNames={classNames}
          PartyLine={components?.PartyLine ?? DefaultPartyLine}
        />
      ) : (
        singleCard
      )}

      {address && (
        <p className={slotClass(classNames, 'address', 'text-sm text-muted-foreground')}>
          {address}
        </p>
      )}

      <div className="flex flex-wrap gap-4">
        {/* `download` is not decoration: browsers refuse a top-level navigation
            to a `data:` URL, so it is what makes the link do anything. */}
        {calendarHref && (
          <a href={calendarHref} download={calendarFileName} className={linkClass}>
            {labels['confirmation.calendar']}
          </a>
        )}
        {/* One line, one link, here beside the calendar. A family gets one per
            line inside the card instead. */}
        {lines.length === 1 && first?.manageHref && (
          <a href={first.manageHref} className={linkClass}>
            {labels['confirmation.manage']}
          </a>
        )}
      </div>
      {/* ONE link for the visit: the portal lists every booking, so it answers
          «where are all of them?» rather than being a way into any one. */}
      {portalHref && (
        <p className="text-sm">
          <a href={portalHref} className={linkClass}>
            {labels['confirmation.portal']}
          </a>
        </p>
      )}
      {onStartOver && (
        <div>
          {/* Low-key on purpose: the loud thing on this screen is the calendar. */}
          <BookingButton
            variant="outline"
            className={slotClass(classNames, 'startOver')}
            onClick={onStartOver}
          >
            {labels['confirmation.startOver']}
          </BookingButton>
        </div>
      )}
    </section>
  );
}

/**
 * The family card: one line per person in the order they sit down, each with
 * its own manage link (each line is its own booking), and a total.
 */
function PartyCard({
  lines,
  totalOre,
  now,
  format,
  labels,
  classNames,
  PartyLine,
}: {
  lines: ConfirmationLine[];
  totalOre: number;
  now: number;
  format: BookingFormat;
  labels: ConfirmationLabels;
  classNames?: SlotClassNames<ConfirmationSlot>;
  PartyLine: ComponentType<PartyLineProps>;
}) {
  const { clock } = format;
  const firstStart = lines[0]?.startTs ?? 0;
  return (
    <div
      className={slotClass(
        classNames,
        'partyCard',
        'space-y-2 rounded-lg border border-border bg-card px-5 py-4'
      )}
    >
      <p className="font-semibold">
        {renderLabel(labels['confirmation.party.heading'], {
          day: clock.dayLabel(firstStart, now),
        })}
      </p>
      <ul className="space-y-1">
        {lines.map((line, index) => {
          const time = clock.formatTime(line.startTs);
          const text = fillLabel(labels['confirmation.party.line'], {
            time,
            name: line.item.bookedForName ?? '',
            service: line.item.service.name,
            stylist: line.stylistName
              ? fillLabel(labels['confirmation.party.stylist'], { name: line.stylistName })
              : '',
            price: format.price(line.priceOre),
          })
            // Blank parts collapse. Plain spaces only: a price joined with a
            // non-breaking space must keep it.
            .replace(/ {2,}/g, ' ')
            .trim();
          return (
            <PartyLine
              // biome-ignore lint/suspicious/noArrayIndexKey: two lines can share a service; the index is the identity
              key={index}
              line={line}
              text={text}
              manageLabel={labelText(labels['confirmation.manage'])}
              manageAriaLabel={fillLabel(labels['confirmation.manageFor'], {
                who: line.item.bookedForName ?? line.item.service.name,
                time,
              })}
              linkClassName={slotClass(
                classNames,
                'link',
                'text-sm font-semibold text-primary underline underline-offset-4'
              )}
            />
          );
        })}
      </ul>
      <p className="font-semibold">
        {renderLabel(labels['confirmation.party.total'], { total: format.price(totalOre) })}
      </p>
    </div>
  );
}
