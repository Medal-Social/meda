'use client';

import { BookingButton } from './internal/ui.js';
import { type SlotClassNames, slotClass } from './slots.js';
import type { WizardStep } from './types.js';

/**
 * The sticky bar that accretes the visitor's choices, and the one button that
 * leaves a step.
 *
 * It computes nothing: the sentence and whether the button is enabled come in
 * precomputed from the caller's machine, so the bar cannot disagree with the
 * wizard it summarises.
 */

export const SUMMARY_BAR_LABEL_KEYS = [
  /** Shown on the first step while nothing is chosen. */
  'summary.placeholder.who',
  /** Shown on later steps while nothing is chosen. */
  'summary.placeholder.service',
  'summary.next',
] as const;

export type SummaryBarLabels = Record<(typeof SUMMARY_BAR_LABEL_KEYS)[number], string>;

/** `root` the bar, `line` the summary sentence, `next` the button. */
export type SummaryBarSlot = 'root' | 'line' | 'next';

export interface SummaryBarProps {
  /** The summary sentence, e.g. «Service · Stylist · today 15:00 · 490 kr». Empty = nothing chosen. */
  line: string;
  /** Whether the current step can be left. */
  canAdvance: boolean;
  /** The current step. The bar renders nothing on `details`, which has its own submit. */
  step: WizardStep;
  onNext: () => void;
  labels: SummaryBarLabels;
  classNames?: SlotClassNames<SummaryBarSlot>;
}

export function SummaryBar({
  line,
  canAdvance,
  step,
  onNext,
  labels,
  classNames,
}: SummaryBarProps) {
  // Gone on the details step, not merely relabelled: that step's own button
  // carries the price and the commitment, and two sticky submits stacked at the
  // bottom of a phone is the outcome to avoid.
  if (step === 'details') return null;

  // There from the first step at one fixed height, rather than appearing on
  // the first tap and pushing the page down under the visitor's thumb.
  return (
    <div
      className={slotClass(
        classNames,
        'root',
        'sticky bottom-0 z-40 flex h-16 items-center justify-between gap-4 border-t border-border bg-background/95 px-5 backdrop-blur-md'
      )}
    >
      <p
        className={slotClass(
          classNames,
          'line',
          'min-w-0 truncate text-sm font-medium',
          !line && 'text-muted-foreground'
        )}
      >
        {line ||
          (step === 'who'
            ? labels['summary.placeholder.who']
            : labels['summary.placeholder.service'])}
      </p>
      <BookingButton
        size="lg"
        className={slotClass(classNames, 'next')}
        onClick={onNext}
        disabled={!canAdvance}
      >
        {labels['summary.next']}
      </BookingButton>
    </div>
  );
}
