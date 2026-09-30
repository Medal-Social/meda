'use client';

import { useId, useState } from 'react';
import { Field } from '../../primitives/field.js';
import { BookingButton } from '../internal/ui.js';
import { fillLabel } from '../labels.js';
import { type SlotClassNames, slotClass } from '../slots.js';

export const AGE_CONFIRM_CARD_LABEL_KEYS = [
  'ageConfirm.heading',
  'ageConfirm.lead',
  'ageConfirm.legend',
  'ageConfirm.birthYear',
  'ageConfirm.birthMonth',
  'ageConfirm.birthMonthUnknown',
  'ageConfirm.confirm',
  'ageConfirm.dismiss',
] as const;

/** `heading` and `legend` take `{name}`. */
export type AgeConfirmCardLabels = Record<(typeof AGE_CONFIRM_CARD_LABEL_KEYS)[number], string>;

/** `root` (the section), `heading`, `form`, `actions` (the button row). */
export type AgeConfirmCardSlot = 'root' | 'heading' | 'form' | 'actions';

export interface AgeConfirmCardProps {
  labels: AgeConfirmCardLabels;
  name: string;
  /** The year on file, as the editor holds it (a string: `''` is «not chosen»). */
  birthYear: string;
  years: readonly number[];
  /** Month names, January first (e.g. from `format.clock.monthName`). */
  months: readonly string[];
  busy: boolean;
  /** Why the last confirm failed, or `null`. */
  error: string | null;
  /** `birthMonth` is `''` for «don't know». */
  onConfirm: (answer: { birthYear: string; birthMonth: string }) => void;
  onDismiss: () => void;
  classNames?: SlotClassNames<AgeConfirmCardSlot>;
}

const SELECT_CLASS =
  'h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

/**
 * «Confirm {name}'s age» — one small card at the top of the family editor,
 * for a child whose birth month the booking system does not know.
 *
 * Presentational: `FamilyEditor` owns the save, so the editor row below and
 * this card never disagree about what is stored. The year arrives prefilled
 * and the month is optional, because «don't know» is a legitimate answer and
 * the card must not hold a parent hostage for it.
 *
 * LAYOUT-STABLE: the caller decides up front whether the card is drawn, so it
 * is in the first paint or not at all; its error line is always mounted, so a
 * failure does not grow it; and it leaves only on the parent's own tap.
 */
export function AgeConfirmCard({
  labels,
  name,
  birthYear,
  years,
  months,
  busy,
  error,
  onConfirm,
  onDismiss,
  classNames,
}: AgeConfirmCardProps) {
  const id = useId();
  const [year, setYear] = useState(birthYear);
  const [month, setMonth] = useState('');
  const headingId = `${id}-heading`;
  const errorId = `${id}-error`;

  return (
    <section
      aria-labelledby={headingId}
      aria-busy={busy || undefined}
      className={slotClass(
        classNames,
        'root',
        'space-y-3 rounded-lg border border-secondary/40 bg-secondary/10 px-5 py-4'
      )}
    >
      <div className="space-y-1">
        <h3
          id={headingId}
          className={slotClass(classNames, 'heading', 'font-sans text-lg font-bold')}
        >
          {fillLabel(labels['ageConfirm.heading'], { name })}
        </h3>
        <p className="text-sm text-muted-foreground">{labels['ageConfirm.lead']}</p>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm({ birthYear: year, birthMonth: month });
        }}
        aria-describedby={error ? errorId : undefined}
        className={slotClass(classNames, 'form', 'space-y-3')}
      >
        <fieldset disabled={busy} className="grid min-w-0 grid-cols-2 gap-3">
          <legend className="sr-only">{fillLabel(labels['ageConfirm.legend'], { name })}</legend>
          <Field>
            <Field.Label htmlFor={`${id}-year`}>{labels['ageConfirm.birthYear']}</Field.Label>
            <select
              id={`${id}-year`}
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className={SELECT_CLASS}
            >
              {years.map((option) => (
                <option key={option} value={String(option)}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <Field.Label htmlFor={`${id}-month`}>{labels['ageConfirm.birthMonth']}</Field.Label>
            <select
              id={`${id}-month`}
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className={SELECT_CLASS}
            >
              <option value="">{labels['ageConfirm.birthMonthUnknown']}</option>
              {months.map((label, index) => (
                <option key={label} value={String(index + 1)}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </fieldset>
        <div className={slotClass(classNames, 'actions', 'flex flex-wrap items-center gap-3')}>
          <BookingButton type="submit" size="sm" disabled={busy}>
            {labels['ageConfirm.confirm']}
          </BookingButton>
          <BookingButton
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={onDismiss}
          >
            {labels['ageConfirm.dismiss']}
          </BookingButton>
          {/* Always mounted, so a failure does not grow the card. */}
          <span aria-live="polite" className="min-h-5 text-sm">
            {error && <Field.Error id={errorId}>{error}</Field.Error>}
          </span>
        </div>
      </form>
    </section>
  );
}
