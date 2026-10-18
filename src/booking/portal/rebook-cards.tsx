'use client';

import type { ComponentType } from 'react';
import { type BookingLabel, labelText } from '../labels.js';
import { type SlotClassNames, slotClass } from '../slots.js';
import type { RebookSuggestion } from '../types.js';

export const REBOOK_CARDS_LABEL_KEYS = [
  'rebook.heading',
  'rebook.empty',
  'rebook.serviceFallback',
  'rebook.anyStylist',
  'rebook.cta',
] as const;

export type RebookCardsLabels = Record<(typeof REBOOK_CARDS_LABEL_KEYS)[number], BookingLabel>;

/** - `root`: the section. - `heading`. - `empty`. - `list`. - `card`. - `link`: the book link. */
export type RebookCardsSlot = 'root' | 'heading' | 'empty' | 'list' | 'card' | 'link';

export interface RebookCardProps {
  suggestion: RebookSuggestion;
  href: string;
  onRebook?: (suggestion: RebookSuggestion) => void;
  labels: RebookCardsLabels;
  classNames?: SlotClassNames<RebookCardsSlot>;
}

export interface RebookCardsComponents {
  RebookCard?: ComponentType<RebookCardProps>;
}

export interface RebookCardsProps {
  /** Already deduped and ordered by the caller. */
  suggestions: RebookSuggestion[];
  /** The booking link for a suggestion (the catalogue ids the booking flow reads). */
  hrefFor: (suggestion: RebookSuggestion) => string;
  /**
   * Called on the tap, before the link navigates — e.g. to stash the person's
   * name somewhere other than the URL (a minor's name has no business in a
   * query string, which lands in history, access logs and analytics).
   */
  onRebook?: (suggestion: RebookSuggestion) => void;
  labels: RebookCardsLabels;
  /** `id` of the heading. Default `portal-rebook-heading`. */
  headingId?: string;
  classNames?: SlotClassNames<RebookCardsSlot>;
  components?: RebookCardsComponents;
}

const SEPARATOR = ' · ';

/**
 * «Book again» — the visits this user has had before, one tap from the
 * booking flow with its questions already answered. A plain `<a>` does the
 * navigating, so the card works as a link; the tap only calls `onRebook`
 * first. Given nothing, it keeps its heading and one sentence, so the
 * overview keeps the same shape for a new user.
 */
export function RebookCards({
  suggestions,
  hrefFor,
  onRebook,
  labels,
  headingId = 'portal-rebook-heading',
  classNames,
  components,
}: RebookCardsProps) {
  const Card = components?.RebookCard ?? DefaultRebookCard;
  return (
    <section aria-labelledby={headingId} className={slotClass(classNames, 'root', 'space-y-4')}>
      <h2
        id={headingId}
        className={slotClass(classNames, 'heading', 'font-sans text-xl font-bold md:text-2xl')}
      >
        {labels['rebook.heading']}
      </h2>
      {suggestions.length === 0 ? (
        <p className={slotClass(classNames, 'empty', 'text-muted-foreground')}>
          {labels['rebook.empty']}
        </p>
      ) : (
        <ul className={slotClass(classNames, 'list', 'grid gap-3 sm:grid-cols-2')}>
          {suggestions.map((suggestion) => {
            const href = hrefFor(suggestion);
            return (
              <Card
                key={`${href}#${suggestion.bookedForName ?? ''}`}
                suggestion={suggestion}
                href={href}
                onRebook={onRebook}
                labels={labels}
                classNames={classNames}
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** One suggestion (an `<li>`): what · who for · with whom, and the book link. */
export function DefaultRebookCard({
  suggestion,
  href,
  onRebook,
  labels,
  classNames,
}: RebookCardProps) {
  return (
    <li
      className={slotClass(
        classNames,
        'card',
        'space-y-2 rounded-lg border border-border bg-card px-5 py-4'
      )}
    >
      <p className="font-semibold">
        {[
          suggestion.serviceName ?? labelText(labels['rebook.serviceFallback']),
          suggestion.bookedForName,
          suggestion.resourceName ?? labelText(labels['rebook.anyStylist']),
        ]
          .filter(Boolean)
          .join(SEPARATOR)}
      </p>
      <a
        href={href}
        onClick={onRebook ? () => onRebook(suggestion) : undefined}
        className={slotClass(
          classNames,
          'link',
          'text-sm font-semibold text-primary underline underline-offset-4'
        )}
      >
        {labels['rebook.cta']}
      </a>
    </li>
  );
}
