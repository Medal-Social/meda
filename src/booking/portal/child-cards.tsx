'use client';

import { ArrowRight } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import type { BookingFormat } from '../format.js';
import { renderLabel } from '../internal/label-parts.js';
import type { BookingLabel } from '../labels.js';
import { type SlotClassNames, slotClass } from '../slots.js';
import type { ChildSummary } from '../types.js';

export const CHILD_CARDS_LABEL_KEYS = [
  'childCards.empty',
  'childCards.neverVisited',
  'childCards.lastVisit',
  'childCards.lastVisitNoService',
  'childCards.book',
  'childCards.stylist',
  'childCards.next',
  'childCards.none',
] as const;

/**
 * Placeholders: `childCards.neverVisited` `{age}`; `childCards.lastVisit`
 * `{age}` `{service}` `{date}`; `childCards.lastVisitNoService` `{age}`
 * `{date}`; `childCards.book` `{name}`.
 */
export type ChildCardsLabels = Record<(typeof CHILD_CARDS_LABEL_KEYS)[number], BookingLabel>;

/**
 * - `list`: the grid. - `card`: one child. - `avatar`: the initial.
 * - `name`, `detail`: the two lines. - `details`: the full card's facts.
 * - `link`: the book link. - `empty`: the default empty sentence.
 */
export type ChildCardsSlot =
  | 'list'
  | 'card'
  | 'avatar'
  | 'name'
  | 'detail'
  | 'details'
  | 'link'
  | 'empty';

export type ChildCardsVariant = 'full' | 'compact';

export interface ChildCardProps {
  child: ChildSummary;
  /** Position in the list (drives the avatar tint). */
  index: number;
  variant: ChildCardsVariant;
  href: string;
  onBook?: (child: ChildSummary) => void;
  stylistNames?: Readonly<Record<string, string>>;
  labels: ChildCardsLabels;
  format: Pick<BookingFormat, 'ageLabel' | 'clock'>;
  classNames?: SlotClassNames<ChildCardsSlot>;
}

export interface ChildCardsComponents {
  ChildCard?: ComponentType<ChildCardProps>;
}

export interface ChildCardsProps {
  /** Named `kids` rather than `children`, which would collide with React's own. */
  kids: ChildSummary[];
  /**
   * `full`: avatar, age, last visit, details and the book link (the children
   * section). `compact`: a two-line row (the overview's reminder).
   */
  variant?: ChildCardsVariant;
  /** The booking link for a child (their last service and usual stylist, when known). */
  hrefFor: (child: ChildSummary) => string;
  /** Called on the tap, before the link navigates (e.g. to stash the name outside the URL). */
  onBook?: (child: ChildSummary) => void;
  /**
   * What to draw when there are no children. Default: the `childCards.empty`
   * sentence. `null` where something next to it already says so.
   */
  empty?: ReactNode;
  /** Stylist display names by id, for the «usual stylist» line. */
  stylistNames?: Readonly<Record<string, string>>;
  labels: ChildCardsLabels;
  format: Pick<BookingFormat, 'ageLabel' | 'clock'>;
  classNames?: SlotClassNames<ChildCardsSlot>;
  components?: ChildCardsComponents;
}

/** The avatar tints, in order. Cosmetic, and deliberately not derived from the
 * name: a hash would recolour a child the day they are renamed. */
const AVATAR_TINTS = ['bg-secondary/30', 'bg-primary/10', 'bg-accent'] as const;

function lastVisitLine(
  child: ChildSummary,
  labels: ChildCardsLabels,
  format: ChildCardProps['format']
): ReactNode {
  const age = format.ageLabel(child.ageRange);
  if (child.lastVisitTs === null) return renderLabel(labels['childCards.neverVisited'], { age });
  const date = format.clock.date(child.lastVisitTs);
  return child.serviceName
    ? renderLabel(labels['childCards.lastVisit'], { age, service: child.serviceName, date })
    : renderLabel(labels['childCards.lastVisitNoService'], { age, date });
}

/**
 * «My children» — one card per child, and one tap to book them again. A plain
 * `<a>` does the navigating, so the card works as a link; the tap only calls
 * `onBook` first.
 */
export function ChildCards({
  kids,
  variant = 'full',
  hrefFor,
  onBook,
  empty,
  stylistNames,
  labels,
  format,
  classNames,
  components,
}: ChildCardsProps) {
  if (kids.length === 0) {
    return empty === undefined ? (
      <p className={slotClass(classNames, 'empty', 'text-muted-foreground')}>
        {labels['childCards.empty']}
      </p>
    ) : (
      empty
    );
  }
  const Card = components?.ChildCard ?? DefaultChildCard;

  return (
    <ul
      className={slotClass(
        classNames,
        'list',
        'grid gap-4',
        variant === 'full' && 'sm:grid-cols-2'
      )}
    >
      {kids.map((child, index) => (
        <Card
          // Twins without Medal ids share name and year; the position keeps them apart.
          key={child.personId ?? `${child.name}-${child.birthYear}-${index}`}
          child={child}
          index={index}
          variant={variant}
          href={hrefFor(child)}
          onBook={onBook}
          stylistNames={stylistNames}
          labels={labels}
          format={format}
          classNames={classNames}
        />
      ))}
    </ul>
  );
}

/** One child (an `<li>`). */
export function DefaultChildCard({
  child,
  index,
  variant,
  href,
  onBook,
  stylistNames,
  labels,
  format,
  classNames,
}: ChildCardProps) {
  return (
    <li
      className={slotClass(
        classNames,
        'card',
        'flex gap-4 rounded-lg border border-border bg-card px-5 py-4',
        variant === 'full' ? 'flex-col' : 'items-center'
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className={slotClass(
            classNames,
            'avatar',
            'flex size-11 shrink-0 items-center justify-center rounded-full font-sans text-lg font-bold',
            AVATAR_TINTS[index % AVATAR_TINTS.length]
          )}
        >
          {child.name.trim().charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className={slotClass(classNames, 'name', 'block truncate font-semibold')}>
            {child.name}
          </span>
          <span
            className={slotClass(
              classNames,
              'detail',
              'block truncate text-sm text-muted-foreground'
            )}
          >
            {lastVisitLine(child, labels, format)}
          </span>
        </span>
      </div>
      {variant === 'full' && (
        <ChildDetails
          child={child}
          stylistNames={stylistNames}
          labels={labels}
          format={format}
          className={classNames?.details}
        />
      )}
      <a
        href={href}
        onClick={onBook ? () => onBook(child) : undefined}
        className={slotClass(
          classNames,
          'link',
          'font-semibold text-primary underline underline-offset-4',
          variant === 'full'
            ? 'inline-flex items-center gap-2 no-underline'
            : 'ms-auto shrink-0 text-sm'
        )}
      >
        {renderLabel(labels['childCards.book'], { name: child.name })}
        {variant === 'full' && <ArrowRight aria-hidden="true" className="size-4" />}
      </a>
    </li>
  );
}

/**
 * The full card's two facts beyond the last visit: the usual stylist and the
 * next appointment. Both lines are always drawn — a dash where there is
 * nothing — so every card in the grid is the same height.
 */
function ChildDetails({
  child,
  stylistNames,
  labels,
  format,
  className,
}: {
  child: ChildSummary;
  stylistNames?: Readonly<Record<string, string>>;
  labels: ChildCardsLabels;
  format: ChildCardProps['format'];
  className?: string;
}) {
  const stylist =
    child.preferredResourceId === null ? null : (stylistNames?.[child.preferredResourceId] ?? null);
  return (
    <dl className={cn('grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm', className)}>
      <dt className="text-muted-foreground">{labels['childCards.stylist']}</dt>
      <dd className="truncate">{stylist ?? labels['childCards.none']}</dd>
      <dt className="text-muted-foreground">{labels['childCards.next']}</dt>
      <dd className="truncate">
        {child.nextVisitTs === null
          ? labels['childCards.none']
          : format.clock.dateTime(child.nextVisitTs)}
      </dd>
    </dl>
  );
}
