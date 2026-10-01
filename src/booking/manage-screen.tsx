'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { cn } from '../lib/utils.js';
import type { BookingDaypart, BookingFormat } from './format.js';
import { renderLabel } from './internal/label-parts.js';
import { BookingButton } from './internal/ui.js';
import { type BookingLabel, fillLabel, labelText } from './labels.js';
import { type SlotClassNames, slotClass } from './slots.js';
import {
  TimeScreen,
  type TimeScreenComponents,
  type TimeScreenLabels,
  type TimeScreenSlot,
  type WeekendNote,
} from './time-screen.js';
import type { BookingDayDto, BookingManageDto, BookingSlotDto } from './types.js';

/**
 * The page at the end of the «manage your booking» link.
 *
 * Presentational: it never sees the manage token and never fetches. Loading
 * openings, cancelling and moving are callbacks; the screen owns only the view
 * it is on, the chosen reason and new slot, and the pending state of the one
 * mutation in flight.
 *
 * The change windows are NOT decided here. The engine answers `canCancel` /
 * `canReschedule` with the same comparison it enforces on the write, so this
 * screen relays those two booleans and never recomputes them. The only thing it
 * derives is the *sentence* about when free changes end.
 */

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const MANAGE_SCREEN_LABEL_KEYS = [
  'manage.heading',
  'manage.serviceFallback',
  'manage.card.named',
  'manage.card.when',
  'manage.card.whenWithStylist',
  'manage.appointment.named',
  'manage.appointment.namedSibilant',
  'manage.appointment.unnamed',
  'manage.ringUs',
  'manage.ringUsOn',
  'manage.callUs',
  'manage.callUsOn',
  'manage.error.windowPassed',
  'manage.error.slotTaken',
  'manage.error.notFound',
  'manage.error.conflict',
  'manage.error.invalidInput',
  'manage.error.unavailable',
  'manage.freeUntil',
  'manage.remaining.in',
  'manage.remaining.daysAndHours',
  'manage.remaining.underMinute',
  'manage.remaining.day.one',
  'manage.remaining.day.other',
  'manage.remaining.hour.one',
  'manage.remaining.hour.other',
  'manage.remaining.minute.one',
  'manage.remaining.minute.other',
  'manage.change',
  'manage.cancel',
  'manage.callToChange',
  'manage.callToCancel',
  'manage.blocked',
  'manage.blocked.suffix',
  'manage.blocked.plain',
  'manage.calendar',
  'manage.closed.cancelled',
  'manage.closed.completed',
  'manage.closed.noShow',
  'manage.closed.pending',
  'manage.closed.pendingCall',
  'manage.closed.pendingCallPlain',
  'manage.bookNew',
  'manage.party.heading',
  'manage.party.justThisOne',
  'manage.party.unnamed',
  'manage.party.note',
  'manage.party.noteSuffix',
  'manage.back',
  'manage.reschedule.lead',
  'manage.reschedule.leadWithStylist',
  'manage.reschedule.failed',
  'manage.reschedule.failedSuffix',
  'manage.reschedule.loading',
  'manage.move.question',
  'manage.move.questionWithStylist',
  'manage.move.surcharge',
  'manage.move.confirm',
  'manage.move.pickAnother',
  'manage.cancel.question',
  'manage.cancel.reasonLegend',
  'manage.cancel.reason.illness',
  'manage.cancel.reason.noLongerSuits',
  'manage.cancel.reason.other',
  'manage.cancel.confirm',
  'manage.cancel.keep',
  'manage.cancelled',
  'manage.cancelled.findNew',
  'manage.moved',
  'manage.movedTo',
  'manage.moved.view',
  'manage.moved.noLink',
  'manage.moved.noLinkSuffix',
  'manage.portal',
] as const;

/**
 * Copy for the manage screen, plus the embedded time step's (`TimeScreenLabels`).
 *
 * Placeholders: `card.named` `{name}` `{service}`; `card.when*` `{dateTime}` `{stylist}` `{price}`;
 * `appointment.named*` `{name}` (`namedSibilant` is used for names ending in s, x or z);
 * `ringUsOn` / `callUsOn` `{phone}`; `error.windowPassed|conflict|unavailable` `{ringUs}`;
 * `error.notFound` `{callUs}`; `freeUntil` `{dateTime}`; `remaining.in` `{amount}`;
 * `remaining.daysAndHours` `{days}` `{hours}`; `remaining.*.one|other` `{count}`;
 * `callToChange` / `callToCancel` / `blocked` `{hours}`; `closed.pendingCall` `{phone}`;
 * `party.heading` / `party.justThisOne` `{who}`; `reschedule.lead*` `{service}` `{stylist}`;
 * `move.question*` `{appointment}` `{from}` `{to}` `{stylist}`;
 * `move.surcharge` `{weekday}` `{price}` `{pct}`; `cancel.question` `{appointment}` `{dateTime}` `{hours}`;
 * `movedTo` `{dateTime}`.
 *
 * The three `cancel.reason.*` strings are both the chips' text and the value
 * `onCancel` receives.
 */
export type ManageScreenLabels = Record<(typeof MANAGE_SCREEN_LABEL_KEYS)[number], BookingLabel> &
  TimeScreenLabels;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Why a mutation failed. Map anything the route did not name to `unavailable`. */
export type ManageErrorCode =
  | 'windowPassed'
  | 'slotTaken'
  | 'notFound'
  | 'conflict'
  | 'invalidInput'
  | 'unavailable';

/**
 * What a cancel or a move answers. After a move, `manageHref` is the link built
 * from the freshly minted manage token — `null`/absent when the engine did not
 * return one (an idempotent replay), in which case no link is drawn. Putting
 * that href in the address bar (`history.replaceState`) is the caller's job.
 */
export type ManageResult =
  | { ok: true; manageHref?: string | null }
  | { ok: false; code: ManageErrorCode };

/** The openings around the appointment, for the reschedule step. */
export interface ManageReschedule {
  /** `null` until they have been loaded. */
  slots: BookingSlotDto[] | null;
  /** The last load failed. Takes precedence over `slots`. */
  failed?: boolean;
  /** Forwarded to the time step. */
  days?: number[];
  openDays?: readonly BookingDayDto[] | null;
}

/** Today's prices for the booked service, for the weekend note on a new slot. */
export interface ManagePricing {
  /** The service's price for a visit starting at `ts`, in minor units. */
  priceAt: (ts: number) => number;
  weekendSurchargePct: number;
}

/**
 * `classNames` slots: `root` the section · `heading` the h1 · `alert` the error ·
 * `card` the booking card · `actions` the overview's button row · `panel` each
 * confirm / party / result panel · `footer` the portal-link line.
 */
export type ManageScreenSlot =
  | 'root'
  | 'heading'
  | 'alert'
  | 'card'
  | 'actions'
  | 'panel'
  | 'footer';

export interface ManageScreenProps {
  labels: ManageScreenLabels;
  format: BookingFormat;
  dayparts: readonly BookingDaypart[];
  booking: BookingManageDto;
  /** The business's number; `null` renders every phone sentence unlinked. */
  phone?: string | null;
  address?: string | null;
  /** Where «book a new time» goes. */
  bookingHref: string;
  /** The portal («all your appointments») link at the foot of every view; `null` hides it. */
  portalHref?: string | null;
  /**
   * The «add to calendar» href (e.g. an ICS `data:` URL, built by the caller so
   * it can carry this page's manage link); `null` hides the link.
   */
  icsHref?: string | null;
  /** The `download` name for `icsHref` (browsers refuse a top-level `data:` navigation without it). */
  icsFileName?: string;
  /** Absent — the catalogue did not load — means no weekend note rather than a guessed one. */
  pricing?: ManagePricing | null;
  reschedule: ManageReschedule;
  /**
   * Load (or reload) the openings. Called when the visitor opens the time step
   * with nothing loaded or after a failure, and after a move lost its slot.
   */
  onRequestSlots: () => void;
  /** Cancel, with the chosen reason chip's text or `null`. Held pending until it settles. */
  onCancel: (reason: string | null) => Promise<ManageResult>;
  /** Move to `slot`. Held pending until it settles. */
  onReschedule: (slot: BookingSlotDto) => Promise<ManageResult>;
  /** «Now», for the time left to change for free. Defaults to `Date.now()` (read after mount). */
  now?: number;
  classNames?: SlotClassNames<ManageScreenSlot>;
  /** Slot overrides for the embedded time step. */
  timeClassNames?: SlotClassNames<TimeScreenSlot>;
  /** Chip overrides for the embedded time step. */
  components?: TimeScreenComponents;
}

type View = 'overview' | 'party' | 'time' | 'move' | 'cancel' | 'cancelled' | 'moved';

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/** The names the engine substitutes for a deleted catalogue row. Never printed. */
const UNKNOWN_SERVICE = 'Unknown service';
const UNKNOWN_RESOURCE = 'Unknown resource';

const CANCEL_REASON_KEYS = [
  'manage.cancel.reason.illness',
  'manage.cancel.reason.noLongerSuits',
  'manage.cancel.reason.other',
] as const;

const CLOSED_SENTENCE: Partial<
  Record<BookingManageDto['status'], (typeof MANAGE_SCREEN_LABEL_KEYS)[number]>
> = {
  cancelled: 'manage.closed.cancelled',
  completed: 'manage.closed.completed',
  no_show: 'manage.closed.noShow',
};

const LINK_CLASS = 'font-semibold text-primary underline underline-offset-4';

// ---------------------------------------------------------------------------
// Sentences
// ---------------------------------------------------------------------------

/** «Name's appointment» when a name was given, the bare noun when not. */
function theirAppointment(labels: ManageScreenLabels, name: string | null): string {
  if (!name) return labelText(labels['manage.appointment.unnamed']);
  return fillLabel(
    labels[/[sxz]$/i.test(name) ? 'manage.appointment.namedSibilant' : 'manage.appointment.named'],
    { name }
  );
}

/**
 * «in 1 day and 3 hours» — whole days and hours, because it is read as
 * reassurance rather than a countdown; minutes only under an hour.
 */
function remainingLabel(labels: ManageScreenLabels, ms: number): string {
  const days = Math.floor(ms / DAY_MS);
  const hours = Math.floor((ms % DAY_MS) / HOUR_MS);
  const dayPart = fillLabel(
    labels[days === 1 ? 'manage.remaining.day.one' : 'manage.remaining.day.other'],
    { count: days }
  );
  const hourPart = fillLabel(
    labels[hours === 1 ? 'manage.remaining.hour.one' : 'manage.remaining.hour.other'],
    { count: hours }
  );
  if (days > 0) {
    return hours > 0
      ? fillLabel(labels['manage.remaining.daysAndHours'], { days: dayPart, hours: hourPart })
      : fillLabel(labels['manage.remaining.in'], { amount: dayPart });
  }
  if (hours > 0) return fillLabel(labels['manage.remaining.in'], { amount: hourPart });
  const minutes = Math.floor((ms % HOUR_MS) / 60_000);
  if (minutes < 1) return labelText(labels['manage.remaining.underMinute']);
  return fillLabel(labels['manage.remaining.in'], {
    amount: fillLabel(
      labels[minutes === 1 ? 'manage.remaining.minute.one' : 'manage.remaining.minute.other'],
      { count: minutes }
    ),
  });
}

function ringUs(labels: ManageScreenLabels, phone: string | null): string {
  return phone
    ? fillLabel(labels['manage.ringUsOn'], { phone })
    : labelText(labels['manage.ringUs']);
}

function callUs(labels: ManageScreenLabels, phone: string | null): string {
  return phone
    ? fillLabel(labels['manage.callUsOn'], { phone })
    : labelText(labels['manage.callUs']);
}

/** What the visitor is told went wrong — never the upstream's own words. */
function errorSentence(
  labels: ManageScreenLabels,
  code: ManageErrorCode,
  phone: string | null
): string {
  switch (code) {
    case 'windowPassed':
      return fillLabel(labels['manage.error.windowPassed'], { ringUs: ringUs(labels, phone) });
    case 'slotTaken':
      return labelText(labels['manage.error.slotTaken']);
    case 'notFound':
      return fillLabel(labels['manage.error.notFound'], { callUs: callUs(labels, phone) });
    case 'conflict':
      return fillLabel(labels['manage.error.conflict'], { ringUs: ringUs(labels, phone) });
    case 'invalidInput':
      return labelText(labels['manage.error.invalidInput']);
    default:
      return fillLabel(labels['manage.error.unavailable'], { ringUs: ringUs(labels, phone) });
  }
}

/** A sentence that hands the visitor to the telephone: linked with a number, plain without. */
function PhoneSentence({
  format,
  phone,
  children,
  className,
}: {
  format: BookingFormat;
  phone: string | null;
  children: ReactNode;
  className?: string;
}) {
  if (phone === null) return <span className={className}>{children}</span>;
  return (
    <a href={format.telHref(phone)} className={cn(LINK_CLASS, className)}>
      {children}
    </a>
  );
}

// ---------------------------------------------------------------------------
// ManageScreen
// ---------------------------------------------------------------------------

export function ManageScreen({
  labels,
  format,
  dayparts,
  booking,
  phone = null,
  address = null,
  bookingHref,
  portalHref = null,
  icsHref = null,
  icsFileName,
  pricing = null,
  reschedule,
  onRequestSlots,
  onCancel,
  onReschedule,
  now: nowProp,
  classNames,
  timeClassNames,
  components,
}: ManageScreenProps) {
  const [view, setView] = useState<View>('overview');
  const [pending, setPending] = useState<BookingSlotDto | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ManageErrorCode | null>(null);
  const [movedTo, setMovedTo] = useState<number | null>(null);
  const [newManageHref, setNewManageHref] = useState<string | null>(null);
  /**
   * The openings read BEFORE a move lost its slot. Until the caller hands in a
   * fresh array they are not shown: the rejected instant is still on them,
   * still tappable, and still the nearest thing to what the visitor wanted.
   */
  const [staleSlots, setStaleSlots] = useState<BookingSlotDto[] | null>(null);

  const slots =
    reschedule.slots !== null && reschedule.slots === staleSlots ? null : reschedule.slots;
  const slotsFailed = reschedule.failed ?? false;

  const confirmed = booking.status === 'confirmed';
  const stylist =
    booking.resourceName === UNKNOWN_RESOURCE
      ? null
      : format.stylistName(booking.resourceName) || null;
  const serviceLabel =
    booking.serviceName === UNKNOWN_SERVICE
      ? labelText(labels['manage.serviceFallback'])
      : booking.serviceName;

  // The LARGER window wins: the sentence promises both actions, and the earlier
  // of the two deadlines is the one true of both.
  const windowHours = Math.max(booking.cancelWindowHours, booking.rescheduleWindowHours);
  const freeUntilTs = booking.startTs - windowHours * HOUR_MS;

  // Filled in after mount: the one line whose value depends on the millisecond
  // it was produced, so computing it during a server render would mismatch.
  const [remaining, setRemaining] = useState<string | null>(null);
  useEffect(() => {
    const left = freeUntilTs - (nowProp ?? Date.now());
    setRemaining(left > 0 ? remainingLabel(labels, left) : null);
  }, [freeUntilTs, nowProp, labels]);

  /**
   * One mutation, with its buttons held down for the whole round trip. `busy`
   * is enough because each mutation is reachable from exactly one button and
   * both carry `disabled={busy}` — the second tap of a double tap lands on a
   * disabled button. A cancel has no idempotency key, so this matters.
   */
  async function run(action: () => Promise<ManageResult>): Promise<ManageResult> {
    setBusy(true);
    setError(null);
    let result: ManageResult;
    try {
      result = await action();
    } catch {
      result = { ok: false, code: 'unavailable' };
    }
    setBusy(false);
    if (!result.ok) setError(result.code);
    return result;
  }

  const confirmCancel = async () => {
    const result = await run(() => onCancel(reason));
    if (result.ok) setView('cancelled');
  };

  const confirmMove = async () => {
    if (pending === null) return;
    const target = pending;
    const result = await run(() => onReschedule(target));
    if (!result.ok) {
      // A slot that went while the visitor read the confirmation is not an
      // error to sit on — the time step is where the answer is, reloaded.
      if (result.code === 'slotTaken' || result.code === 'invalidInput') {
        setPending(null);
        setStaleSlots(reschedule.slots);
        setView('time');
        onRequestSlots();
      }
      return;
    }
    setMovedTo(target.startTs);
    // The token the visitor arrived with belongs to the row the move
    // cancelled; only a link built from the new one still works.
    setNewManageHref(result.manageHref ?? null);
    setView('moved');
  };

  const goToTime = () => {
    setError(null);
    setView('time');
    // A failure as well as «never loaded», or a transient failure after a
    // successful load would stick until the whole page was reloaded.
    if (reschedule.slots === null || slotsFailed) onRequestSlots();
  };

  const panelClass = (base: string) => slotClass(classNames, 'panel', base);

  return (
    <section
      aria-labelledby="booking-manage-heading"
      className={slotClass(classNames, 'root', 'space-y-6')}
    >
      <h1
        id="booking-manage-heading"
        className={slotClass(classNames, 'heading', 'font-sans text-2xl font-bold md:text-3xl')}
      >
        {labels['manage.heading']}
      </h1>

      {error !== null && (
        <p
          role="alert"
          className={slotClass(
            classNames,
            'alert',
            'rounded-lg border border-secondary/40 bg-secondary/10 px-5 py-3 text-sm'
          )}
        >
          {errorSentence(labels, error, phone)}
        </p>
      )}

      {view === 'cancelled' && (
        <div className={panelClass('space-y-4 rounded-lg border border-border bg-card px-5 py-4')}>
          <p className="font-medium">{labels['manage.cancelled']}</p>
          <a href={bookingHref} className={LINK_CLASS}>
            {labels['manage.cancelled.findNew']}
          </a>
        </div>
      )}
      {view === 'moved' && (
        <div className={panelClass('space-y-4 rounded-lg border border-border bg-card px-5 py-4')}>
          <p className="font-medium">
            {movedTo === null
              ? labels['manage.moved']
              : renderLabel(labels['manage.movedTo'], {
                  dateTime: format.clock.dateTime(movedTo),
                })}
          </p>
          {newManageHref ? (
            <a href={newManageHref} className={LINK_CLASS}>
              {labels['manage.moved.view']}
            </a>
          ) : (
            // No new link to offer: the old token now belongs to the cancelled
            // row. Saying so beats a link that would open «cancelled».
            <p className="text-sm text-muted-foreground">
              {labels['manage.moved.noLink']}{' '}
              <PhoneSentence format={format} phone={phone}>
                {callUs(labels, phone)}
              </PhoneSentence>{' '}
              {labels['manage.moved.noLinkSuffix']}
            </p>
          )}
        </div>
      )}
      {view !== 'cancelled' && view !== 'moved' && (
        <>
          <div
            className={slotClass(
              classNames,
              'card',
              'space-y-1 rounded-lg border border-border bg-card px-5 py-4'
            )}
          >
            <p className="font-semibold">
              {booking.bookedForName
                ? renderLabel(labels['manage.card.named'], {
                    name: booking.bookedForName,
                    service: serviceLabel,
                  })
                : serviceLabel}
            </p>
            <p className="tabular-nums">
              {renderLabel(labels[stylist ? 'manage.card.whenWithStylist' : 'manage.card.when'], {
                dateTime: format.clock.dateTime(booking.startTs),
                stylist: stylist ?? '',
                price: format.price(booking.amountOre),
              })}
            </p>
            {address && <p className="text-sm text-muted-foreground">{address}</p>}
          </div>

          {view === 'overview' &&
            (confirmed ? (
              <Overview
                labels={labels}
                format={format}
                booking={booking}
                freeUntilTs={freeUntilTs}
                remaining={remaining}
                phone={phone}
                icsHref={icsHref}
                icsFileName={icsFileName}
                actionsClassName={classNames?.actions}
                onChange={() => (booking.partySequenceId ? setView('party') : goToTime())}
                onCancel={() => {
                  setError(null);
                  setView('cancel');
                }}
              />
            ) : (
              <ClosedBooking
                labels={labels}
                format={format}
                status={booking.status}
                bookingHref={bookingHref}
                phone={phone}
                className={panelClass(
                  'space-y-3 rounded-lg border border-border bg-card px-5 py-4'
                )}
              />
            ))}

          {view === 'party' && (
            <PartyChoice
              labels={labels}
              format={format}
              bookedForName={booking.bookedForName}
              phone={phone}
              onJustThisOne={goToTime}
              onBack={() => setView('overview')}
              className={panelClass(
                'space-y-4 rounded-lg border border-primary/40 bg-primary/5 px-5 py-4'
              )}
            />
          )}

          {view === 'time' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {stylist
                  ? renderLabel(labels['manage.reschedule.leadWithStylist'], {
                      service: serviceLabel,
                      stylist,
                    })
                  : renderLabel(labels['manage.reschedule.lead'], { service: serviceLabel })}
              </p>

              {slotsFailed && (
                <p className="rounded-lg border border-border bg-card px-5 py-4 text-sm">
                  {labels['manage.reschedule.failed']}{' '}
                  <PhoneSentence format={format} phone={phone}>
                    {ringUs(labels, phone)}
                  </PhoneSentence>
                  {labels['manage.reschedule.failedSuffix']}
                </p>
              )}
              {!slotsFailed && slots === null && (
                <p className="text-sm text-muted-foreground">
                  {labels['manage.reschedule.loading']}
                </p>
              )}
              {!slotsFailed && slots !== null && (
                <TimeScreen
                  labels={labels}
                  format={format}
                  dayparts={dayparts}
                  slots={slots}
                  days={reschedule.days}
                  openDays={reschedule.openDays ?? null}
                  currentSlotTs={booking.startTs}
                  weekendNote={weekendNoteFor(pricing)}
                  phone={phone}
                  now={nowProp}
                  classNames={timeClassNames}
                  components={components}
                  onPick={(slot) => {
                    setPending(slot);
                    setError(null);
                    setView('move');
                  }}
                />
              )}

              <BookingButton variant="outline" onClick={() => setView('overview')}>
                {labels['manage.back']}
              </BookingButton>
            </div>
          )}

          {view === 'move' && pending !== null && (
            <ConfirmMove
              labels={labels}
              format={format}
              booking={booking}
              pricing={pricing}
              stylist={stylist}
              pending={pending}
              busy={busy}
              onConfirm={confirmMove}
              onBack={() => setView('time')}
              className={panelClass(
                'space-y-4 rounded-lg border border-primary/40 bg-primary/5 px-5 py-4'
              )}
            />
          )}

          {view === 'cancel' && (
            <ConfirmCancel
              labels={labels}
              format={format}
              booking={booking}
              reason={reason}
              busy={busy}
              onPickReason={setReason}
              onConfirm={confirmCancel}
              onBack={() => setView('overview')}
              className={panelClass(
                'space-y-4 rounded-lg border border-primary/40 bg-primary/5 px-5 py-4'
              )}
            />
          )}
        </>
      )}

      {/* The one way off this page that is not a phone call or the wizard; it
          stays at the foot of every view. */}
      {portalHref !== null && (
        <p className={slotClass(classNames, 'footer', 'text-sm')}>
          <a href={portalHref} className={LINK_CLASS}>
            {labels['manage.portal']}
          </a>
        </p>
      )}
    </section>
  );
}

function weekendNoteFor(
  pricing: ManagePricing | null
): ((dayTs: number) => WeekendNote | null) | undefined {
  if (pricing === null || pricing.weekendSurchargePct <= 0) return undefined;
  return (dayTs) => ({ pct: pricing.weekendSurchargePct, priceOre: pricing.priceAt(dayTs) });
}

/**
 * The three actions, and what replaces the ones the engine has already closed.
 * `canReschedule` / `canCancel` are read one for one — never `startTs` and a
 * policy number — so this agrees with the write by construction.
 */
function Overview({
  labels,
  format,
  booking,
  freeUntilTs,
  remaining,
  phone,
  icsHref,
  icsFileName,
  actionsClassName,
  onChange,
  onCancel,
}: {
  labels: ManageScreenLabels;
  format: BookingFormat;
  booking: BookingManageDto;
  freeUntilTs: number;
  remaining: string | null;
  phone: string | null;
  icsHref: string | null;
  icsFileName: string | undefined;
  actionsClassName: string | undefined;
  onChange: () => void;
  onCancel: () => void;
}) {
  // The largest window that has already closed — the number the sentence below
  // quotes. Zero when both are open, and then it is not rendered.
  const blockedHours = Math.max(
    booking.canCancel ? 0 : booking.cancelWindowHours,
    booking.canReschedule ? 0 : booking.rescheduleWindowHours
  );

  return (
    <>
      {booking.canCancel && booking.canReschedule && (
        <p className="text-sm text-muted-foreground">
          {renderLabel(labels['manage.freeUntil'], {
            dateTime: format.clock.dateTime(freeUntilTs),
          })}
          {remaining !== null && <span> ({remaining})</span>}
        </p>
      )}

      <div className={cn('flex flex-wrap items-center gap-4', actionsClassName)}>
        {booking.canReschedule ? (
          <BookingButton size="lg" onClick={onChange}>
            {labels['manage.change']}
          </BookingButton>
        ) : (
          <PhoneSentence format={format} phone={phone}>
            {renderLabel(labels['manage.callToChange'], { hours: booking.rescheduleWindowHours })}
          </PhoneSentence>
        )}

        {booking.canCancel ? (
          <BookingButton size="lg" variant="outline" onClick={onCancel}>
            {labels['manage.cancel']}
          </BookingButton>
        ) : (
          <PhoneSentence format={format} phone={phone}>
            {renderLabel(labels['manage.callToCancel'], { hours: booking.cancelWindowHours })}
          </PhoneSentence>
        )}

        {icsHref !== null && (
          // `download` is not decoration — browsers refuse a top-level
          // navigation to a `data:` URL, so without it the link does nothing.
          <a href={icsHref} download={icsFileName ?? true} className={LINK_CLASS}>
            {labels['manage.calendar']}
          </a>
        )}
      </div>

      {blockedHours > 0 && (
        <p className="rounded-lg border border-border bg-card px-5 py-4 text-sm">
          {renderLabel(labels['manage.blocked'], { hours: blockedHours })}{' '}
          {phone ? (
            <>
              <PhoneSentence format={format} phone={phone}>
                {renderLabel(labels['manage.ringUsOn'], { phone })}
              </PhoneSentence>
              {labels['manage.blocked.suffix']}
            </>
          ) : (
            labels['manage.blocked.plain']
          )}
        </p>
      )}
    </>
  );
}

/** A booking no longer open to either action, saying which kind it is. */
function ClosedBooking({
  labels,
  format,
  status,
  bookingHref,
  phone,
  className,
}: {
  labels: ManageScreenLabels;
  format: BookingFormat;
  status: BookingManageDto['status'];
  bookingHref: string;
  phone: string | null;
  className: string;
}) {
  const sentence = labels[CLOSED_SENTENCE[status] ?? 'manage.closed.pending'];
  return (
    <div className={className}>
      <p className="text-sm">{sentence}</p>
      {status === 'pending' ? (
        <p className="text-sm">
          <PhoneSentence format={format} phone={phone}>
            {phone
              ? renderLabel(labels['manage.closed.pendingCall'], { phone })
              : labels['manage.closed.pendingCallPlain']}
          </PhoneSentence>
        </p>
      ) : (
        <a href={bookingHref} className={LINK_CLASS}>
          {labels['manage.bookNew']}
        </a>
      )}
    </div>
  );
}

/**
 * «Move the whole visit, or just this one?» A manage link authorises exactly
 * ONE booking, so the whole visit is a telephone call and says so plainly.
 * «Just this one» keeps the family visit a family visit; it simply stops being
 * contiguous, which the sub-line says.
 */
function PartyChoice({
  labels,
  format,
  bookedForName,
  phone,
  onJustThisOne,
  onBack,
  className,
}: {
  labels: ManageScreenLabels;
  format: BookingFormat;
  bookedForName: string | null;
  phone: string | null;
  onJustThisOne: () => void;
  onBack: () => void;
  className: string;
}) {
  const who = bookedForName ?? labelText(labels['manage.party.unnamed']);
  return (
    <div className={className}>
      <h2 className="font-sans text-lg font-bold">
        {renderLabel(labels['manage.party.heading'], { who })}
      </h2>
      <div className="flex flex-wrap items-center gap-4">
        <BookingButton size="lg" onClick={onJustThisOne}>
          {renderLabel(labels['manage.party.justThisOne'], { who })}
        </BookingButton>
        <BookingButton size="lg" variant="outline" onClick={onBack}>
          {labels['manage.back']}
        </BookingButton>
      </div>
      <p className="text-sm text-muted-foreground">
        {labels['manage.party.note']}{' '}
        <PhoneSentence format={format} phone={phone}>
          {ringUs(labels, phone)}
        </PhoneSentence>
        {labels['manage.party.noteSuffix']}
      </p>
    </div>
  );
}

/**
 * The single confirm for a move. The weekend note appears only when the new
 * hour costs MORE — both sides priced off today's catalogue, never against the
 * amount charged weeks ago.
 */
function ConfirmMove({
  labels,
  format,
  booking,
  pricing,
  stylist,
  pending,
  busy,
  onConfirm,
  onBack,
  className,
}: {
  labels: ManageScreenLabels;
  format: BookingFormat;
  booking: BookingManageDto;
  pricing: ManagePricing | null;
  stylist: string | null;
  pending: BookingSlotDto;
  busy: boolean;
  onConfirm: () => void;
  onBack: () => void;
  className: string;
}) {
  const { clock } = format;
  const nextOre = pricing ? pricing.priceAt(pending.startTs) : 0;
  const nowOre = pricing ? pricing.priceAt(booking.startTs) : 0;
  const dearer = pricing !== null && nextOre > nowOre;
  const question = renderLabel(
    labels[stylist ? 'manage.move.questionWithStylist' : 'manage.move.question'],
    {
      appointment: theirAppointment(labels, booking.bookedForName),
      from: `${clock.date(booking.startTs)} ${clock.formatTime(booking.startTs)}`,
      to: `${clock.date(pending.startTs)} ${clock.formatTime(pending.startTs)}`,
      stylist: stylist ?? '',
    }
  );

  return (
    <div className={className}>
      <p className="font-medium">{question}</p>

      {dearer && pricing && (
        <p className="text-sm">
          {renderLabel(labels['manage.move.surcharge'], {
            weekday: clock.weekday(pending.startTs),
            price: format.price(nextOre),
            pct: pricing.weekendSurchargePct,
          })}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <BookingButton size="lg" disabled={busy} onClick={onConfirm}>
          {labels['manage.move.confirm']}
        </BookingButton>
        <BookingButton variant="outline" disabled={busy} onClick={onBack}>
          {labels['manage.move.pickAnother']}
        </BookingButton>
      </div>
    </div>
  );
}

/** The single confirm for a cancellation, with the reason asked and never required. */
function ConfirmCancel({
  labels,
  format,
  booking,
  reason,
  busy,
  onPickReason,
  onConfirm,
  onBack,
  className,
}: {
  labels: ManageScreenLabels;
  format: BookingFormat;
  booking: BookingManageDto;
  reason: string | null;
  busy: boolean;
  onPickReason: (reason: string | null) => void;
  onConfirm: () => void;
  onBack: () => void;
  className: string;
}): ReactNode {
  return (
    <div className={className}>
      <p className="font-medium">
        {renderLabel(labels['manage.cancel.question'], {
          appointment: theirAppointment(labels, booking.bookedForName),
          dateTime: format.clock.dateTime(booking.startTs),
          hours: booking.cancelWindowHours,
        })}
      </p>

      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">{labels['manage.cancel.reasonLegend']}</legend>
        {CANCEL_REASON_KEYS.map((key) => {
          const option = labelText(labels[key]);
          const picked = reason === option;
          return (
            <BookingButton
              key={key}
              variant="outline"
              size="sm"
              aria-pressed={picked}
              // Tapping the chosen chip again clears it: the answer is
              // optional, so there has to be a way back to having given none.
              onClick={() => onPickReason(picked ? null : option)}
              className={cn('rounded-full', picked ? 'border-primary ring-2 ring-primary' : '')}
            >
              {option}
            </BookingButton>
          );
        })}
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <BookingButton size="lg" disabled={busy} onClick={onConfirm}>
          {labels['manage.cancel.confirm']}
        </BookingButton>
        <BookingButton size="lg" variant="outline" disabled={busy} onClick={onBack}>
          {labels['manage.cancel.keep']}
        </BookingButton>
      </div>
    </div>
  );
}
