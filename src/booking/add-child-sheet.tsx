'use client';

import { Plus, XIcon } from 'lucide-react';
import { type FormEvent, useId, useState, useTransition } from 'react';
import { Field } from '../primitives/field.js';
import { Input } from '../primitives/input.js';
import { Sheet } from '../primitives/sheet.js';
import { Textarea } from '../primitives/textarea.js';
import type { BookingFormat } from './format.js';
import {
  BOOKING_INPUT_CLASS,
  BOOKING_SELECT_CLASS,
  BOOKING_TEXTAREA_CLASS,
  BookingButton,
} from './internal/ui.js';
import { type SlotClassNames, slotClass } from './slots.js';
import type { NewChild, SaveResult } from './types.js';

/**
 * «+ Add child» — a dashed card that opens a small sheet: name, birth year,
 * birth month (optional) and, where there is somewhere to keep it, a note for
 * the stylist. Never a full birth date; the month is all a salon needs.
 *
 * The sheet only collects. What saving MEANS is the caller's: a logged-in
 * parent's child may be created on their profile (`saveNotes`), a guest's
 * lives in this booking only. The sheet stays open, fields locked, until
 * `onSave` resolves — and shows the sentence it answers with if it could not
 * save — so a child is never shown as added before it exists.
 */

export const ADD_CHILD_SHEET_LABEL_KEYS = [
  'addChild.trigger',
  'addChild.title',
  'addChild.description.saved',
  'addChild.description.local',
  'addChild.name',
  'addChild.birthYear',
  'addChild.birthYearPlaceholder',
  'addChild.birthMonth',
  'addChild.birthMonthUnknown',
  'addChild.notes',
  'addChild.missing',
  'addChild.submit',
  'addChild.close',
] as const;

export type AddChildSheetLabels = Record<(typeof ADD_CHILD_SHEET_LABEL_KEYS)[number], string>;

/**
 * - `root` — the dashed trigger card (the only element in the page flow)
 * - `content` — the sheet (`<dialog>`)
 * - `title` — the sheet's heading
 * - `submit` — the save button
 */
export type AddChildSheetSlot = 'root' | 'content' | 'title' | 'submit';

export interface AddChildSheetProps {
  labels: AddChildSheetLabels;
  /** Month names come from `format.clock.monthName`. */
  format: BookingFormat;
  /** Offer the note for the stylist — only where it has somewhere to be kept. */
  saveNotes: boolean;
  disabled: boolean;
  onSave: (child: NewChild) => Promise<SaveResult>;
  /** The newest birth year offered. Defaults to the business-local year now. */
  currentYear?: number;
  /** How many years back the birth-year list goes. Default 18. */
  oldestYearsBack?: number;
  classNames?: SlotClassNames<AddChildSheetSlot>;
}

const DEFAULT_OLDEST_YEARS_BACK = 18;

export function AddChildSheet({
  labels,
  format,
  saveNotes,
  disabled,
  onSave,
  currentYear,
  oldestYearsBack = DEFAULT_OLDEST_YEARS_BACK,
  classNames,
}: AddChildSheetProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const newestYear = currentYear ?? Number(format.clock.dayKey(Date.now()).slice(0, 4));
  const years = Array.from({ length: oldestYearsBack + 1 }, (_, index) => newestYear - index);
  const months = Array.from({ length: 12 }, (_, index) => index + 1);

  function reset() {
    setName('');
    setYear('');
    setMonth('');
    setNotes('');
    setError(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === '' || year === '') {
      setError(labels['addChild.missing']);
      return;
    }
    startTransition(async () => {
      const result = await onSave({
        name: trimmed,
        birthYear: Number(year),
        ...(month === '' ? {} : { birthMonth: Number(month) }),
        ...(saveNotes && notes.trim() !== '' ? { notes: notes.trim() } : {}),
      });
      if (result.ok) {
        reset();
        setOpen(false);
        return;
      }
      setError(result.message);
    });
  }

  return (
    <Sheet
      open={open}
      dismissible={!pending}
      onOpenChange={(next) => {
        if (pending) return;
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <Sheet.Trigger
        disabled={disabled}
        className={slotClass(
          classNames,
          'root',
          'flex h-[4.5rem] w-full items-center gap-3 rounded-lg border border-dashed border-border px-4 text-left font-medium text-primary transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50'
        )}
      >
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-dashed border-primary"
        >
          <Plus className="size-5" />
        </span>
        {labels['addChild.trigger']}
      </Sheet.Trigger>
      <Sheet.Content className={slotClass(classNames, 'content')}>
        <form onSubmit={submit} className="space-y-5">
          <Sheet.Title
            className={slotClass(classNames, 'title', 'pe-10 font-sans text-2xl font-bold')}
          >
            {labels['addChild.title']}
          </Sheet.Title>
          <Sheet.Description className="text-muted-foreground">
            {saveNotes
              ? labels['addChild.description.saved']
              : labels['addChild.description.local']}
          </Sheet.Description>
          <fieldset disabled={pending} className="space-y-4">
            <Field>
              <Field.Label htmlFor={`${id}-name`}>{labels['addChild.name']}</Field.Label>
              <Input
                id={`${id}-name`}
                value={name}
                maxLength={60}
                autoComplete="off"
                onChange={(event) => setName(event.target.value)}
                className={BOOKING_INPUT_CLASS}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Field.Label htmlFor={`${id}-year`}>{labels['addChild.birthYear']}</Field.Label>
                <select
                  id={`${id}-year`}
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className={BOOKING_SELECT_CLASS}
                >
                  <option value="">{labels['addChild.birthYearPlaceholder']}</option>
                  {years.map((option) => (
                    <option key={option} value={String(option)}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <Field.Label htmlFor={`${id}-month`}>{labels['addChild.birthMonth']}</Field.Label>
                <select
                  id={`${id}-month`}
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  className={BOOKING_SELECT_CLASS}
                >
                  <option value="">{labels['addChild.birthMonthUnknown']}</option>
                  {months.map((option) => (
                    <option key={option} value={String(option)}>
                      {format.clock.monthName(option)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            {saveNotes && (
              <Field>
                <Field.Label htmlFor={`${id}-notes`}>{labels['addChild.notes']}</Field.Label>
                <Textarea
                  id={`${id}-notes`}
                  rows={2}
                  maxLength={500}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className={BOOKING_TEXTAREA_CLASS}
                />
              </Field>
            )}
          </fieldset>
          {/* A <div>, not a <p>: the error inside is itself a paragraph. */}
          <div aria-live="polite" className="min-h-5">
            {error && <Field.Error>{error}</Field.Error>}
          </div>
          <BookingButton
            type="submit"
            size="lg"
            className={slotClass(classNames, 'submit', 'w-full')}
            disabled={pending}
          >
            {labels['addChild.submit']}
          </BookingButton>
        </form>
        <Sheet.Close
          render={
            <BookingButton variant="ghost" className="absolute top-4 right-4" size="icon-sm">
              <XIcon aria-hidden="true" />
              <span className="sr-only">{labels['addChild.close']}</span>
            </BookingButton>
          }
        />
      </Sheet.Content>
    </Sheet>
  );
}
