'use client';

import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '../lib/utils.js';
import { type SlotClassNames, slotClass } from './slots.js';

const LENGTH = 6;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '').slice(0, LENGTH);
}

/** A box's border and text colour: invalid, then active, then filled, then empty. */
function slotTone(invalid: boolean, active: boolean, filled: boolean): string {
  if (invalid) return 'border-destructive text-foreground';
  if (active) return 'border-primary text-foreground';
  if (filled) return 'border-primary/40 text-foreground';
  return 'border-input text-muted-foreground';
}

export const OTP_SLOTS_LABEL_KEYS = ['otp.label'] as const;
export type OtpSlotsLabels = Record<(typeof OTP_SLOTS_LABEL_KEYS)[number], string>;

/**
 * - `root`: the positioned wrapper.
 * - `row`: the six-box grid.
 * - `slot`: every box.
 * - `slotActive`: the box the caret is on.
 * - `slotFilled`: a box holding a digit (not active).
 */
export type OtpSlotsSlot = 'root' | 'row' | 'slot' | 'slotActive' | 'slotFilled';

export interface OtpSlotsProps {
  /** The hidden input's id — point a `<label htmlFor>` at it. */
  id?: string;
  name?: string;
  /** The code so far; anything but digits is dropped, and it is capped at six. */
  value: string;
  disabled?: boolean;
  /**
   * Holds the value still without letting go of focus — for while a code is
   * being checked. `disabled` would blur the field, and inside a modal dialog
   * a blurred field is focus the trap has to put somewhere.
   */
  readOnly?: boolean;
  invalid?: boolean;
  describedBy?: string;
  labels: OtpSlotsLabels;
  classNames?: SlotClassNames<OtpSlotsSlot>;
  onChange: (next: string) => void;
  /** Called with the six digits the moment the sixth lands. */
  onComplete?: (code: string) => void;
}

/**
 * Six digit boxes for a one-time code, with one hidden `one-time-code` input
 * so iOS / Android / a password manager can still paste or autofill the whole
 * code in one go.
 *
 * The visible boxes are not six independent form fields. They are a display
 * over a single value: arrow keys, Backspace, and a paste of «492 155» all
 * edit that value. Submitting still posts six digits with no spaces.
 */
export function OtpSlots({
  id,
  name = 'code',
  value,
  disabled = false,
  readOnly = false,
  invalid = false,
  describedBy,
  labels,
  classNames,
  onChange,
  onComplete,
}: OtpSlotsProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hiddenRef = useRef<HTMLInputElement>(null);
  const digits = digitsOnly(value);
  // Where the hidden input's caret is, so the highlighted box follows arrow
  // keys and pointer placement instead of always sitting after the last digit.
  // `null` until the caret has moved: then the box after the last digit is
  // active, exactly as with plain sequential typing.
  const [caret, setCaret] = useState<number | null>(null);
  const active = Math.min(caret ?? digits.length, digits.length, LENGTH - 1);
  // Backspace is handled by hand (preventDefault), so the browser never moves
  // the real caret. Park the target position here and apply it once React has
  // rendered the new value; otherwise the keyup that follows would read the
  // stale DOM selection and drag the highlight back.
  const pendingCaret = useRef<number | null>(null);

  useLayoutEffect(() => {
    const position = pendingCaret.current;
    const input = hiddenRef.current;
    if (position === null || !input) return;
    pendingCaret.current = null;
    const clamped = Math.min(position, input.value.length);
    input.setSelectionRange(clamped, clamped);
  });

  function commit(next: string) {
    if (readOnly) return;
    const cleaned = digitsOnly(next);
    onChange(cleaned);
    if (cleaned.length === LENGTH) onComplete?.(cleaned);
  }

  function syncCaret(input: HTMLInputElement) {
    setCaret(input.selectionStart ?? null);
  }

  function focusHidden() {
    hiddenRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Backspace' || digits.length === 0) return;

    const start = event.currentTarget.selectionStart ?? digits.length;
    const end = event.currentTarget.selectionEnd ?? start;
    if (start === 0 && end === 0) return;

    event.preventDefault();
    const next =
      start === end
        ? digits.slice(0, start - 1) + digits.slice(start)
        : digits.slice(0, start) + digits.slice(end);
    const after = start === end ? start - 1 : start;
    pendingCaret.current = after;
    setCaret(after);
    commit(next);
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    setCaret(null);
    commit(event.clipboardData.getData('text'));
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    const start = event.target.selectionStart ?? raw.length;
    // Count only the digits that survive cleaning before the caret, so a
    // digit typed in the middle of the code highlights the box after it.
    setCaret(digitsOnly(raw.slice(0, start)).length);
    commit(raw);
  }

  return (
    <div className={slotClass(classNames, 'root', 'relative')}>
      <input
        ref={hiddenRef}
        id={fieldId}
        name={name}
        inputMode="numeric"
        autoComplete="one-time-code"
        autoCorrect="off"
        spellCheck={false}
        // `\d*` rather than `[0-9]{6}`: it is the spelling iOS reads as «show the
        // number pad», and the length is `minLength`/`maxLength`'s job.
        pattern="\d*"
        minLength={LENGTH}
        maxLength={LENGTH}
        required
        disabled={disabled}
        readOnly={readOnly}
        aria-busy={readOnly || undefined}
        value={digits}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-label={labels['otp.label']}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={(event) => syncCaret(event.currentTarget)}
        onSelect={(event) => syncCaret(event.currentTarget)}
        onClick={(event) => syncCaret(event.currentTarget)}
        onPaste={handlePaste}
        className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
      />
      <div
        aria-hidden="true"
        data-slot="otp-row"
        className={slotClass(classNames, 'row', 'grid grid-cols-6 gap-1.5 sm:gap-2.5')}
        onMouseDown={(event) => {
          event.preventDefault();
          focusHidden();
        }}
      >
        {Array.from({ length: LENGTH }, (_, index) => {
          const filled = digits[index] ?? '';
          const isActive = !disabled && index === active;
          return (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: six fixed boxes, never reordered
              key={index}
              data-slot="otp-slot"
              data-active={isActive || undefined}
              className={cn(
                slotClass(
                  classNames,
                  'slot',
                  'flex aspect-square min-w-0 w-full items-center justify-center rounded-[4px] border-[1.5px] font-display text-xl font-bold tabular-nums sm:text-2xl',
                  slotTone(invalid, isActive, filled !== '')
                ),
                isActive && classNames?.slotActive,
                !isActive && filled && classNames?.slotFilled
              )}
            >
              {filled}
            </span>
          );
        })}
      </div>
    </div>
  );
}
