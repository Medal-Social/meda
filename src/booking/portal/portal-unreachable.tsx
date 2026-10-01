import type { ReactNode } from 'react';
import type { BookingFormat } from '../format.js';
import { renderLabel } from '../internal/label-parts.js';
import { type SlotClassNames, slotClass } from '../slots.js';

export const PORTAL_UNREACHABLE_LABEL_KEYS = [
  'portalUnreachable.heading',
  'portalUnreachable.body',
  'portalUnreachable.retry',
  'portalUnreachable.call',
] as const;

/** `portalUnreachable.call` takes `{phone}`. */
export type PortalUnreachableLabels = Record<
  (typeof PORTAL_UNREACHABLE_LABEL_KEYS)[number],
  string
>;

/** - `root`: the section. - `heading`. - `actions`: the row of links. - `link`: each link. */
export type PortalUnreachableSlot = 'root' | 'heading' | 'actions' | 'link';

export interface PortalUnreachableProps {
  labels: PortalUnreachableLabels;
  format: Pick<BookingFormat, 'telHref'>;
  /** The business's number, or `null` (then there is no call link). */
  phone: string | null;
  /** «Try again» — the portal page itself. */
  retryHref: string;
  /**
   * The log-out control. This is the one screen a user could otherwise be held
   * on, so the way out must not depend on the thing that is down.
   */
  logout?: ReactNode;
  /** `id` of the heading (for `aria-labelledby`). Default `portal-unreachable-heading`. */
  headingId?: string;
  classNames?: SlotClassNames<PortalUnreachableSlot>;
}

/**
 * What the portal shows when the booking system did not answer. The user's
 * bookings are all still there — it is this page that could not read them —
 * so the honest offer is «try again in a moment», pointed back at the same
 * page, and a phone number. Says nothing about WHAT failed.
 */
export function PortalUnreachable({
  labels,
  format,
  phone,
  retryHref,
  logout,
  headingId = 'portal-unreachable-heading',
  classNames,
}: PortalUnreachableProps) {
  const link = slotClass(
    classNames,
    'link',
    'font-semibold text-primary underline underline-offset-4'
  );
  return (
    <section aria-labelledby={headingId} className={slotClass(classNames, 'root', 'space-y-6')}>
      <h1
        id={headingId}
        className={slotClass(classNames, 'heading', 'font-sans text-2xl font-bold md:text-3xl')}
      >
        {labels['portalUnreachable.heading']}
      </h1>
      <p className="text-muted-foreground">{labels['portalUnreachable.body']}</p>
      <div className={slotClass(classNames, 'actions', 'flex flex-wrap items-center gap-4')}>
        <a href={retryHref} className={link}>
          {labels['portalUnreachable.retry']}
        </a>
        {phone && (
          <a href={format.telHref(phone)} className={link}>
            {renderLabel(labels['portalUnreachable.call'], { phone })}
          </a>
        )}
        {logout}
      </div>
    </section>
  );
}
