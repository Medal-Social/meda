'use client';

import type { ComponentType } from 'react';
import { cn } from '../../lib/utils.js';
import type { BookingFormat } from '../format.js';
import { labelParts } from '../internal/label-parts.js';
import { bookingButtonClass } from '../internal/ui.js';
import { fillLabel } from '../labels.js';
import { type SlotClassNames, slotClass } from '../slots.js';
import type { PortalBookingDto } from '../types.js';

export const UPCOMING_BOOKINGS_LABEL_KEYS = [
  'upcoming.heading',
  'upcoming.empty',
  'upcoming.book',
  'upcoming.next',
  'upcoming.today',
  'upcoming.tomorrow',
  'upcoming.inDays',
  'upcoming.when',
  'upcoming.serviceFallback',
  'upcoming.anyStylist',
  'upcoming.manage',
  'upcoming.noManage',
  'upcoming.noManageWithPhone',
  'upcoming.call',
] as const;

/**
 * Placeholders: `upcoming.next` `{when}` (the `today` / `tomorrow` / `inDays`
 * phrase), `upcoming.inDays` `{count}`, `upcoming.when` `{day}` `{time}`,
 * `upcoming.noManageWithPhone` `{call}` (where the `upcoming.call` link goes),
 * `upcoming.call` `{phone}`.
 */
export type UpcomingBookingsLabels = Record<(typeof UPCOMING_BOOKINGS_LABEL_KEYS)[number], string>;

/**
 * - `root`: the section. - `heading`. - `empty`: the no-bookings box.
 * - `list`. - `card`: a plain card; `cardHero`: the first (next) one.
 * - `badge`: the hero's «next appointment» pill. - `manage`: the manage link.
 * - `heroMuted`: the hero's softened lines (when, and the no-manage sentence).
 *   The defaults tint `primary-foreground` down; a brand whose `--primary` is
 *   mid-luminance may need full strength here (and a plain `badge`) to keep
 *   4.5:1 contrast.
 */
export type UpcomingBookingsSlot =
  | 'root'
  | 'heading'
  | 'empty'
  | 'list'
  | 'card'
  | 'cardHero'
  | 'badge'
  | 'manage'
  | 'heroMuted';

export interface BookingCardProps {
  booking: PortalBookingDto;
  phone: string | null;
  now: number;
  /** The first card: the next appointment, drawn as the hero panel. */
  hero: boolean;
  labels: UpcomingBookingsLabels;
  format: BookingFormat;
  classNames?: SlotClassNames<UpcomingBookingsSlot>;
}

export interface UpcomingBookingsComponents {
  BookingCard?: ComponentType<BookingCardProps>;
}

export interface UpcomingBookingsProps {
  /** Soonest first. */
  bookings: PortalBookingDto[];
  /** The business's number, or `null` (then «contact us» is unlinked). */
  phone: string | null;
  labels: UpcomingBookingsLabels;
  format: BookingFormat;
  /** Where booking happens (the empty state's button). */
  bookingHref: string;
  /** Default `Date.now()`. */
  now?: number;
  /** `id` of the heading. Default `portal-upcoming-heading`. */
  headingId?: string;
  classNames?: SlotClassNames<UpcomingBookingsSlot>;
  components?: UpcomingBookingsComponents;
}

const SEPARATOR = ' · ';

/**
 * How far off the next appointment is, on the BUSINESS's calendar — so
 * «tomorrow» means the next date rather than «in 24 hours».
 */
function howFarOff(
  startTs: number,
  now: number,
  labels: UpcomingBookingsLabels,
  format: BookingFormat
): string {
  const days = format.clock.daysBetween(now, startTs);
  if (days <= 0) return labels['upcoming.today'];
  if (days === 1) return labels['upcoming.tomorrow'];
  return fillLabel(labels['upcoming.inDays'], { count: days });
}

/** What is booked and who for. */
function whatLine(booking: PortalBookingDto, labels: UpcomingBookingsLabels): string {
  return [booking.serviceName ?? labels['upcoming.serviceFallback'], booking.bookedForName]
    .filter(Boolean)
    .join(SEPARATOR);
}

/** When, with whom, and what it costs. */
function whenLine(
  booking: PortalBookingDto,
  now: number,
  labels: UpcomingBookingsLabels,
  format: BookingFormat
): string {
  return [
    fillLabel(labels['upcoming.when'], {
      day: format.clock.dayLabel(booking.startTs, now),
      time: format.clock.formatTime(booking.startTs),
    }),
    booking.resourceName ?? labels['upcoming.anyStylist'],
    booking.amountOre === null ? null : format.price(booking.amountOre),
  ]
    .filter(Boolean)
    .join(SEPARATOR);
}

/**
 * «Upcoming appointments» — one card per appointment still ahead.
 *
 * The one action per card is the manage link minted for that booking; a row
 * with no `managePath` (made over the counter, say) is sent to the telephone
 * instead, because a link to nowhere is worse than none.
 *
 * THE FIRST CARD IS THE HERO: the next appointment is the one fact a user
 * opens this page for. Everything after it stays a plain card — a list of
 * heroes is a list of nothing.
 */
export function UpcomingBookings({
  bookings,
  phone,
  labels,
  format,
  bookingHref,
  now = Date.now(),
  headingId = 'portal-upcoming-heading',
  classNames,
  components,
}: UpcomingBookingsProps) {
  const Card = components?.BookingCard ?? DefaultBookingCard;
  return (
    <section aria-labelledby={headingId} className={slotClass(classNames, 'root', 'space-y-4')}>
      <h2
        id={headingId}
        className={slotClass(classNames, 'heading', 'font-sans text-xl font-bold md:text-2xl')}
      >
        {labels['upcoming.heading']}
      </h2>
      {bookings.length === 0 ? (
        <div
          className={slotClass(
            classNames,
            'empty',
            'space-y-4 rounded-lg border border-border bg-card px-5 py-4'
          )}
        >
          <p className="text-muted-foreground">{labels['upcoming.empty']}</p>
          <a href={bookingHref} className={bookingButtonClass({ size: 'lg' })}>
            {labels['upcoming.book']}
          </a>
        </div>
      ) : (
        <ul className={slotClass(classNames, 'list', 'space-y-3')}>
          {bookings.map((booking, index) => (
            <Card
              key={booking.bookingId}
              booking={booking}
              phone={phone}
              now={now}
              hero={index === 0}
              labels={labels}
              format={format}
              classNames={classNames}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

/** One appointment (an `<li>`), drawn as the hero panel or as a plain card. */
export function DefaultBookingCard({
  booking,
  phone,
  now,
  hero,
  labels,
  format,
  classNames,
}: BookingCardProps) {
  return (
    <li
      className={cn(
        'space-y-2 px-5 py-4',
        hero
          ? slotClass(
              classNames,
              'cardHero',
              'rounded-2xl bg-primary p-6 text-primary-foreground md:p-8'
            )
          : slotClass(classNames, 'card', 'rounded-lg border border-border bg-card')
      )}
    >
      {hero && (
        <p
          className={slotClass(
            classNames,
            'badge',
            'inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-bold'
          )}
        >
          <span aria-hidden="true" className="size-2 rounded-full bg-current" />
          {fillLabel(labels['upcoming.next'], {
            when: howFarOff(booking.startTs, now, labels, format),
          })}
        </p>
      )}
      <p className={cn('font-semibold', hero && 'font-sans text-2xl md:text-3xl')}>
        {whatLine(booking, labels)}
      </p>
      <p
        className={cn(
          'tabular-nums',
          hero && slotClass(classNames, 'heroMuted', 'text-primary-foreground/85')
        )}
      >
        {whenLine(booking, now, labels, format)}
      </p>
      {booking.managePath ? (
        <a
          href={booking.managePath}
          className={slotClass(
            classNames,
            'manage',
            'text-sm font-semibold underline underline-offset-4',
            hero
              ? 'inline-block rounded-lg bg-background px-4 py-2 text-foreground no-underline'
              : 'text-primary'
          )}
        >
          {labels['upcoming.manage']}
        </a>
      ) : (
        <p
          className={cn(
            'text-sm',
            hero
              ? slotClass(classNames, 'heroMuted', 'text-primary-foreground/85')
              : 'text-muted-foreground'
          )}
        >
          {phone
            ? labelParts(labels['upcoming.noManageWithPhone'], {
                call: (
                  <a
                    href={format.telHref(phone)}
                    className={cn(
                      'font-semibold underline underline-offset-4',
                      hero ? 'text-primary-foreground' : 'text-primary'
                    )}
                  >
                    {fillLabel(labels['upcoming.call'], { phone })}
                  </a>
                ),
              })
            : // No number on file: the sentence without a link, because a `tel:`
              // that dials nothing fails in the hand of someone already stuck.
              labels['upcoming.noManage']}
        </p>
      )}
    </li>
  );
}
