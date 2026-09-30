import { Skeleton } from '../primitives/skeleton.js';
import { type SlotClassNames, slotClass } from './slots.js';

export const BOOKING_SKELETON_LABEL_KEYS = ['bookingSkeleton.opening'] as const;

/** Copy for the pending skeleton: the sentence a screen reader hears while it is up. */
export type BookingSkeletonLabels = Record<(typeof BOOKING_SKELETON_LABEL_KEYS)[number], string>;

/**
 * `classNames` slots: `root` the fixed overlay · `frame` the pulsing column ·
 * `bar` the active step-bar segment · `chip` one of the four person chips.
 */
export type BookingSkeletonSlot = 'root' | 'frame' | 'bar' | 'chip';

export interface BookingSkeletonProps {
  labels: BookingSkeletonLabels;
  classNames?: SlotClassNames<BookingSkeletonSlot>;
}

/**
 * The first screen of the booking flow, drawn while a navigation into it is
 * still pending.
 *
 * Fixed and over the page rather than in its flow, so it moves nothing; under a
 * `z-50` site header, which stays put across the navigation, and over a `z-40`
 * sticky booking bar, which the flow hides. Its shapes follow the first step —
 * title, lead, step bar, four person chips — so the page that replaces it lands
 * where the skeleton was. Pure markup: when to show it is the caller's call.
 */
export function BookingSkeleton({ labels, classNames }: BookingSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="booking-pending"
      className={slotClass(classNames, 'root', 'fixed inset-0 z-[45] bg-background')}
    >
      <span className="sr-only">{labels['bookingSkeleton.opening']}</span>
      <div
        aria-hidden="true"
        className={slotClass(
          classNames,
          'frame',
          'mx-auto w-full max-w-[720px] px-8 pt-28 motion-safe:animate-pulse'
        )}
      >
        <Skeleton className="h-11 w-56 animate-none rounded-lg" />
        <Skeleton className="mt-5 h-4 w-full max-w-md animate-none rounded" />
        <Skeleton className="mt-2 h-4 w-3/4 max-w-sm animate-none rounded" />
        <div className="mt-12 flex gap-2">
          <div
            className={slotClass(classNames, 'bar', 'h-1.5 flex-1 rounded-full bg-primary/60')}
          />
          <Skeleton className="h-1.5 flex-1 animate-none rounded-full" />
          <Skeleton className="h-1.5 flex-1 animate-none rounded-full" />
          <Skeleton className="h-1.5 flex-1 animate-none rounded-full" />
        </div>
        <Skeleton className="mt-10 h-7 w-60 animate-none rounded-lg" />
        <div className="mt-8 grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={slotClass(
                classNames,
                'chip',
                'h-12 rounded-full border border-border bg-card'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
