'use client';

import { renderLabel } from './internal/label-parts.js';
import { BookingButton } from './internal/ui.js';
import type { BookingLabel } from './labels.js';
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

/**
 * Opt-in: what the bar says in place of a greyed-out button, per step, when
 * `hideNextWhenDisabled` is on — the step moves on by itself once answered,
 * so the useful words are what to tap (e.g. «Tap a time»). Absent: nothing.
 */
export const SUMMARY_BAR_HINT_LABEL_KEYS = [
  'summary.hint.who',
  'summary.hint.service',
  'summary.hint.when',
] as const;

export type SummaryBarLabels = Record<(typeof SUMMARY_BAR_LABEL_KEYS)[number], BookingLabel> &
  Partial<Record<(typeof SUMMARY_BAR_HINT_LABEL_KEYS)[number], BookingLabel>>;

/** `root` the bar, `line` the summary sentence, `detail` its second line, `next` the button, `hint` the words in its place. */
export type SummaryBarSlot = 'root' | 'line' | 'detail' | 'next' | 'hint';

export interface SummaryBarProps {
  /** The summary sentence, e.g. «Service · Stylist · today 15:00 · 490 kr». Empty = nothing chosen. */
  line: string;
  /**
   * A second, smaller line under it (e.g. «today 15:00 · 490 kr»), so the part
   * a parent checks is not the part an ellipsis eats on a phone. The bar keeps
   * its one fixed height either way.
   */
  detail?: string;
  /** Whether the current step can be left. */
  canAdvance: boolean;
  /** The current step. The bar renders nothing on `details`, which has its own submit. */
  step: WizardStep;
  onNext: () => void;
  /**
   * Draw the button only while it does something. For a step that moves on by
   * itself once answered, a disabled «next» is the loudest thing on the screen
   * and reads as broken; the step's `summary.hint.*` label stands in its place.
   */
  hideNextWhenDisabled?: boolean;
  labels: SummaryBarLabels;
  classNames?: SlotClassNames<SummaryBarSlot>;
}

/** Which hint each step shows. */
const HINT_KEYS: Partial<Record<WizardStep, (typeof SUMMARY_BAR_HINT_LABEL_KEYS)[number]>> = {
  who: 'summary.hint.who',
  service: 'summary.hint.service',
  when: 'summary.hint.when',
};

export function SummaryBar({
  line,
  detail,
  canAdvance,
  step,
  onNext,
  hideNextWhenDisabled = false,
  labels,
  classNames,
}: SummaryBarProps) {
  // Gone on the details step, not merely relabelled: that step's own button
  // carries the price and the commitment, and two sticky submits stacked at the
  // bottom of a phone is the outcome to avoid.
  if (step === 'details') return null;

  const hintKey = HINT_KEYS[step];
  const hint = hideNextWhenDisabled && !canAdvance && hintKey ? labels[hintKey] : undefined;

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
      <div className="flex min-w-0 flex-col">
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
        {line && detail && (
          <p
            className={slotClass(
              classNames,
              'detail',
              'min-w-0 truncate text-xs text-muted-foreground tabular-nums'
            )}
          >
            {detail}
          </p>
        )}
      </div>
      {hideNextWhenDisabled && !canAdvance ? (
        hint && (
          <p
            className={slotClass(
              classNames,
              'hint',
              'shrink-0 text-sm font-medium text-muted-foreground'
            )}
          >
            {renderLabel(hint)}
          </p>
        )
      ) : (
        <BookingButton
          size="lg"
          className={slotClass(classNames, 'next')}
          onClick={onNext}
          disabled={!canAdvance}
        >
          {labels['summary.next']}
        </BookingButton>
      )}
    </div>
  );
}
