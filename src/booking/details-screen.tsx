'use client';

import { type ComponentType, useId, useRef, useState } from 'react';
import { Checkbox } from '../primitives/checkbox.js';
import { Field } from '../primitives/field.js';
import { Input } from '../primitives/input.js';
import { Textarea } from '../primitives/textarea.js';
import type { BookingFormat } from './format.js';
import { renderLabel } from './internal/label-parts.js';
import {
  BOOKING_CHECKBOX_CLASS,
  BOOKING_INPUT_CLASS,
  BOOKING_TEXTAREA_CLASS,
  BookingButton,
} from './internal/ui.js';
import { type BookingLabel, fillLabel, labelText } from './labels.js';
import { type SlotClassNames, slotClass } from './slots.js';
import type { BookingFamilyMember, WizardAction, WizardError, WizardState } from './types.js';

/**
 * The last step of the booking wizard: contact details, who each seat is for,
 * the consents, and the button that books.
 *
 * Presentational, with the same bargain the other steps make: every answer
 * leaves as an action (`onChange`) and the caller's machine decides what it
 * means. What stays here is local UI state that is not an answer about the
 * booking — the keystrokes behind the per-child fields, which field has focus,
 * whether submit has been pressed, and a fallback submission nonce.
 */

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const DETAILS_SCREEN_LABEL_KEYS = [
  'details.heading',
  'details.phone.label',
  /** The country code shown (not typed) before the number. Empty string hides it. */
  'details.phone.prefix',
  'details.phone.error',
  'details.name.label',
  /** Accessible name of the list of seats step 1 already named. */
  'details.known.label',
  /** `{who}` follows the bold service name: «for {who}». */
  'details.known.for',
  'details.known.self',
  'details.known.adult',
  'details.known.child',
  'details.child.name',
  'details.child.year',
  'details.child.yearPlaceholder',
  'details.email.label',
  'details.email.help',
  'details.email.error',
  'details.notes.label',
  'details.notes.placeholder',
  'details.terms.text',
  /** Link text after the terms sentence; only drawn when `termsHref` is set. */
  'details.terms.link',
  'details.marketing.text',
  'details.error.maxParty',
  'details.error.slotTaken',
  'details.error.conflict',
  'details.error.invalidInput',
  'details.error.unconfigured',
  'details.error.upstreamError',
  'details.error.inProgress',
  /** `{phone}` — visible text and accessible name of the call link. */
  'details.call.link',
  /** The rescue sentence when there is no phone number to link. */
  'details.call.none',
  /** `{price}` — the total, already formatted. */
  'details.submit',
] as const;

export type DetailsScreenLabelKey = (typeof DETAILS_SCREEN_LABEL_KEYS)[number];
export type DetailsScreenLabels = Record<DetailsScreenLabelKey, BookingLabel>;

/**
 * The label key for each failure the wizard can carry. Exported because some
 * of them (e.g. `maxParty`) are raised on earlier steps, where the shell shows
 * the same sentence — one map, so one refusal is never explained two ways.
 */
export const DETAILS_ERROR_LABEL_KEYS: Record<WizardError, DetailsScreenLabelKey> = {
  maxParty: 'details.error.maxParty',
  slotTaken: 'details.error.slotTaken',
  conflict: 'details.error.conflict',
  invalidInput: 'details.error.invalidInput',
  unconfigured: 'details.error.unconfigured',
  upstreamError: 'details.error.upstreamError',
  inProgress: 'details.error.inProgress',
};

// ---------------------------------------------------------------------------
// Submission (what `onSubmit` receives)
// ---------------------------------------------------------------------------

/** One line of the submission. Optional fields are ABSENT, never blank. */
export interface BookingSubmissionItem {
  serviceId: string;
  resourceId?: string;
  startTs: number;
  bookedForName?: string;
  bookedForBirthYear?: number;
  bookedForPersonId?: string;
}

/** The booking as the details step submits it. Optional fields are ABSENT, never blank. */
export interface BookingSubmission {
  items: BookingSubmissionItem[];
  contact: { phone: string; name?: string; email?: string };
  notes?: string;
  consentTerms: boolean;
  consentMarketing: boolean;
  /** Identifies the submission attempt, so a retry can be made idempotent. */
  submissionNonce?: string;
}

/** Where and with whom one basket line sits, precomputed by the caller's machine. */
export interface DetailsLine {
  startTs: number;
  /** The resource the slot RESOLVED to for this line; `null` sends none. */
  resourceId: string | null;
}

// ---------------------------------------------------------------------------
// Slots and components
// ---------------------------------------------------------------------------

/**
 * - `root` the `<section>`
 * - `heading` the `<h2>`
 * - `field` every `Field` wrapper
 * - `input` every text input and the notes textarea
 * - `childGroup` the per-line `<fieldset>` (only drawn for more than one line)
 * - `consent` the two consent rows
 * - `error` the submit-failure alert
 * - `submit` the submit button
 */
export type DetailsScreenSlot =
  | 'root'
  | 'heading'
  | 'field'
  | 'input'
  | 'childGroup'
  | 'consent'
  | 'error'
  | 'submit';

export interface FamilyChipProps {
  member: BookingFamilyMember;
  /** Both the name and the year in the fields match this member. */
  pressed: boolean;
  onPick: () => void;
}

/** One saved child offered as a single tap above the child fields. */
export function DefaultFamilyChip({ member, pressed, onPick }: FamilyChipProps) {
  return (
    <BookingButton
      variant="outline"
      size="sm"
      // Both fields, because tapping the chip writes both: a chip still
      // announced as chosen after its year was corrected would tell a screen
      // reader something the form does not say.
      aria-pressed={pressed}
      className="rounded-full"
      onClick={onPick}
    >
      {member.name}
    </BookingButton>
  );
}

export interface DetailsScreenComponents {
  FamilyChip?: ComponentType<FamilyChipProps>;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DetailsScreenProps {
  state: WizardState;
  /** Raises `setContact`, `setItemField`, `setNotes` and `setConsent`. */
  onChange: (action: WizardAction) => void;
  onSubmit: (submission: BookingSubmission) => void;
  /**
   * One per `state.items`, in the same order: the start the machine seated
   * each line at and the resource it resolved to.
   */
  lines: readonly DetailsLine[];
  /** The whole basket's price in minor units, as the business will charge it. */
  totalOre: number;
  /** Whether the phone field holds a number the business can use. */
  phoneLooksValid: (value: string) => boolean;
  /** The phone as it is submitted and compared (e.g. national digits only). */
  normalisePhone: (value: string) => string;
  /** True while a submission is in flight: the button goes inert and `aria-busy`. */
  submitting?: boolean;
  /** The business's phone for the failure message; `null` renders the sentence unlinked. */
  phone?: string | null;
  /**
   * The submission nonce, held by the caller so it survives a remount. Absent,
   * one is minted for the life of this mount.
   */
  submissionNonce?: string;
  /** Saved children on a logged-in profile, offered as one tap each. */
  family?: readonly BookingFamilyMember[];
  /**
   * The logged-in guardian's phone. A line's saved-person id is only submitted
   * while the phone in the form normalises to this one.
   */
  guardianPhone?: string | null;
  /** When set, a link to the full terms is drawn after the terms sentence. */
  termsHref?: string | null;
  /** Draw the (optional, unticked) marketing opt-in. */
  marketingConsent?: boolean;
  format: BookingFormat;
  labels: DetailsScreenLabels;
  classNames?: SlotClassNames<DetailsScreenSlot>;
  components?: DetailsScreenComponents;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Deliberately loose: one `@`, something on each side, a dot in the domain,
 * no spaces. The field is optional, so the only job is to catch an address
 * that cannot receive anything. Not RFC 5322 — a stricter pattern rejects real
 * addresses.
 */
/**
 * A random submission id. `crypto.randomUUID` only exists in secure contexts
 * (https, localhost); a plain-http origin falls back to `getRandomValues`,
 * which is available everywhere, shaped as a v4 UUID.
 */
function mintNonce(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Blank is fine (the field is optional). Anything else has to be reachable. */
export function looksLikeEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return true;
  // Hand-rolled rather than a regex: linear on any input, same rule as
  // /^[^\s@]+@[^\s@]+\.[^\s@]+$/.
  if (/\s/.test(trimmed)) return false;
  const at = trimmed.indexOf('@');
  if (at < 1 || at !== trimmed.lastIndexOf('@')) return false;
  const domain = trimmed.slice(at + 1);
  for (let index = 1; index < domain.length - 1; index += 1) {
    if (domain[index] === '.') return true;
  }
  return false;
}

/** The child's two fields as typed — both strings, including the year. */
interface ChildInput {
  name: string;
  birthYear: string;
}

const NO_CHILD: ChildInput = { name: '', birthYear: '' };

function seedChildren(items: WizardState['items']): Record<number, ChildInput> {
  return Object.fromEntries(
    items.map((item, index) => [
      index,
      {
        name: item.bookedForName ?? '',
        birthYear: item.bookedForBirthYear === undefined ? '' : String(item.bookedForBirthYear),
      },
    ])
  );
}

/** Four digits and nothing else — `parseInt` would accept a numeric prefix. */
const FOUR_DIGITS = /^\d{4}$/;
const EARLIEST_BIRTH_YEAR = 1900;
const LATEST_BIRTH_YEAR = 2200;

/** The year as a number, or `null` for «nothing usable typed». */
function parseBirthYear(raw: string): number | null {
  const trimmed = raw.trim();
  if (!FOUR_DIGITS.test(trimmed)) return null;
  const year = Number(trimmed);
  return year >= EARLIEST_BIRTH_YEAR && year <= LATEST_BIRTH_YEAR ? year : null;
}

/** Spread into an object literal, so «nothing typed» is an absent key, not `''`. */
function present<K extends string>(key: K, value: string): Record<K, string> | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? ({ [key]: trimmed } as Record<K, string>) : undefined;
}

/** Who a seat step 1 already named is for, in words. */
function knownWho(state: WizardState, index: number, labels: DetailsScreenLabels): string {
  const item = state.items[index];
  if (item?.adult) {
    return state.people[index]?.key === 'self'
      ? labelText(labels['details.known.self'])
      : labelText(labels['details.known.adult']);
  }
  return item?.bookedForName ?? labelText(labels['details.known.child']);
}

/**
 * Whether step 1 already said who sits in this seat: a saved person's card
 * (`p:` / `n:`), the logged-in guardian (`self`) or a guest adult (`adult`).
 */
function isKnownChair(state: WizardState, index: number): boolean {
  const key = state.people[index]?.key ?? '';
  return key.startsWith('p:') || key.startsWith('n:') || key === 'self' || key === 'adult';
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export function DetailsScreen({
  state,
  onChange,
  onSubmit,
  lines,
  totalOre,
  phoneLooksValid,
  normalisePhone,
  submitting = false,
  phone = null,
  submissionNonce: nonceProp,
  family,
  guardianPhone = null,
  termsHref = null,
  marketingConsent = false,
  format,
  labels,
  classNames,
  components,
}: DetailsScreenProps) {
  const ids = useId();
  const field = (name: string) => `${ids}-${name}`;
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);

  // The text on the way to the machine's answers. Seeded from the items so a
  // visitor who steps back and returns finds the names still in the boxes;
  // keyed by index because two lines can share a service.
  const [children, setChildren] = useState<Record<number, ChildInput>>(() =>
    seedChildren(state.items)
  );
  const childAt = (index: number) => children[index] ?? NO_CHILD;

  // Minted once per mount (a lazy initialiser), never per press: a
  // double-tapped submit must carry the same nonce twice.
  // Only minted when the caller does not pass one (lazily, once per mount).
  const ownNonce = useRef<string | null>(null);
  if (nonceProp === undefined && ownNonce.current === null) ownNonce.current = mintNonce();
  const submissionNonce = nonceProp ?? ownNonce.current ?? '';

  // Which field has focus: the phone error is held back while the visitor is
  // still typing and appears the moment the field is left.
  const [focused, setFocused] = useState<string | null>(null);
  // Submit is never disabled for validation, so pressing it is what explains a refusal.
  const [attempted, setAttempted] = useState(false);

  const phoneTyped = state.contact.phone.trim().length > 0;
  const phoneValid = phoneLooksValid(state.contact.phone);
  const emailValid = looksLikeEmail(state.contact.email);
  const showPhoneError = !phoneValid && (attempted || (phoneTyped && focused !== 'phone'));
  const showEmailError = !emailValid && (attempted || focused !== 'email');
  const showTermsError = attempted && !state.consentTerms;

  const price = format.price(totalOre);
  const phonePrefix = labels['details.phone.prefix'];
  const FamilyChip = components?.FamilyChip ?? DefaultFamilyChip;

  function setContact(name: keyof WizardState['contact'], value: string) {
    onChange({ type: 'setContact', field: name, value });
  }

  /** Written to the buffer (what the field shows) and to the machine (the answer). */
  function setChild(index: number, patch: Partial<ChildInput>, personId?: string) {
    setChildren((previous) => ({
      ...previous,
      [index]: { ...(previous[index] ?? NO_CHILD), ...patch },
    }));
    if (patch.name !== undefined) {
      onChange({ type: 'setItemField', index, field: 'bookedForName', value: patch.name });
      // A family chip names a saved person; a name typed by hand may be someone
      // the business does not know.
      onChange({
        type: 'setItemField',
        index,
        field: 'bookedForPersonId',
        value: personId ?? null,
      });
    }
    if (patch.birthYear !== undefined) {
      onChange({
        type: 'setItemField',
        index,
        field: 'bookedForBirthYear',
        value: parseBirthYear(patch.birthYear),
      });
    }
  }

  function submissionItems(startTs: number): BookingSubmissionItem[] {
    // A saved person's id is only valid under the number of the guardian who owns them.
    const ownPhone =
      guardianPhone !== null &&
      normalisePhone(guardianPhone) === normalisePhone(state.contact.phone);
    return state.items.map((item, index) => {
      const child = childAt(index);
      const birthYear = parseBirthYear(child.birthYear);
      const line = lines[index];
      const resourceId = line?.resourceId ?? null;
      return {
        serviceId: item.service.id,
        ...(resourceId === null ? {} : { resourceId }),
        startTs: line?.startTs ?? startTs,
        ...present(
          'bookedForName',
          isKnownChair(state, index) ? (item.bookedForName ?? '') : child.name
        ),
        ...(birthYear === null ? {} : { bookedForBirthYear: birthYear }),
        ...(ownPhone && item.bookedForPersonId
          ? { bookedForPersonId: item.bookedForPersonId }
          : {}),
      };
    });
  }

  function handleSubmit() {
    setAttempted(true);

    // Unreachable through the wizard, but submitting without a slot would book 1970.
    if (state.startTs === null) return;

    // Focus rather than scroll: it moves the viewport, puts the caret where the
    // fix is needed, and works for whoever is not looking at the screen.
    if (!phoneValid) {
      phoneRef.current?.focus();
      return;
    }
    if (!emailValid) {
      emailRef.current?.focus();
      return;
    }
    if (!state.consentTerms) {
      termsRef.current?.focus();
      return;
    }

    onSubmit({
      items: submissionItems(state.startTs),
      contact: {
        phone: normalisePhone(state.contact.phone),
        ...present('name', state.contact.name),
        ...present('email', state.contact.email),
      },
      ...present('notes', state.notes),
      consentTerms: state.consentTerms,
      consentMarketing: state.consentMarketing,
      submissionNonce,
    });
  }

  const inputClass = (...extra: string[]) =>
    slotClass(classNames, 'input', BOOKING_INPUT_CLASS, ...extra);
  const fieldClass = slotClass(classNames, 'field');

  return (
    <section
      aria-labelledby="booking-details-heading"
      className={slotClass(classNames, 'root', 'space-y-6')}
    >
      <h2
        id="booking-details-heading"
        tabIndex={-1}
        className={slotClass(
          classNames,
          'heading',
          'font-sans text-2xl font-bold outline-none md:text-3xl'
        )}
      >
        {labels['details.heading']}
      </h2>

      <Field className={fieldClass}>
        <Field.Label htmlFor={field('phone')}>{labels['details.phone.label']}</Field.Label>
        {/* The country code is shown rather than typed. `aria-describedby`
            rather than `aria-hidden`: the prefix is information. */}
        <div className="flex items-stretch">
          {phonePrefix && (
            <span
              id={field('phone-prefix')}
              className="flex h-12 items-center rounded-l-[4px] border border-r-0 border-input bg-muted px-4 text-base text-muted-foreground"
            >
              {phonePrefix}
            </span>
          )}
          <Input
            id={field('phone')}
            ref={phoneRef}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            className={inputClass(phonePrefix ? 'rounded-l-none' : '')}
            value={state.contact.phone}
            aria-describedby={phonePrefix ? field('phone-prefix') : undefined}
            aria-invalid={showPhoneError || undefined}
            onFocus={() => setFocused('phone')}
            onBlur={() => setFocused(null)}
            onChange={(event) => setContact('phone', event.target.value)}
          />
        </div>
        {showPhoneError && <Field.Error>{labels['details.phone.error']}</Field.Error>}
      </Field>

      <Field className={fieldClass}>
        <Field.Label htmlFor={field('name')}>{labels['details.name.label']}</Field.Label>
        <Input
          id={field('name')}
          autoComplete="name"
          className={inputClass()}
          value={state.contact.name}
          onChange={(event) => setContact('name', event.target.value)}
        />
      </Field>

      {state.items.some((_, index) => isKnownChair(state, index)) && (
        <ul aria-label={labelText(labels['details.known.label'])} className="space-y-1 text-sm">
          {state.items.map((item, index) =>
            isKnownChair(state, index) ? (
              // biome-ignore lint/suspicious/noArrayIndexKey: two lines can share a service; the index is the identity
              <li key={index}>
                <span className="font-semibold">{item.service.name}</span>{' '}
                {renderLabel(labels['details.known.for'], { who: knownWho(state, index, labels) })}
              </li>
            ) : null
          )}
        </ul>
      )}

      {state.items.map((item, index) =>
        // A seat step 1 already named is not asked again: a second answer could disagree.
        isKnownChair(state, index) ? null : (
          <ChildFields
            // biome-ignore lint/suspicious/noArrayIndexKey: two lines can share a service; the index is the identity
            key={index}
            legend={state.items.length > 1 ? item.service.name : null}
            nameId={field(`child-name-${index}`)}
            yearId={field(`child-year-${index}`)}
            value={childAt(index)}
            family={family}
            labels={labels}
            classNames={classNames}
            FamilyChip={FamilyChip}
            onChange={(patch, personId) => setChild(index, patch, personId)}
          />
        )
      )}

      <Field className={fieldClass}>
        <Field.Label htmlFor={field('email')}>{labels['details.email.label']}</Field.Label>
        <Input
          id={field('email')}
          ref={emailRef}
          type="email"
          autoComplete="email"
          className={inputClass()}
          value={state.contact.email}
          aria-describedby={field('email-help')}
          aria-invalid={showEmailError || undefined}
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
          onChange={(event) => setContact('email', event.target.value)}
        />
        <Field.Description id={field('email-help')}>
          {labels['details.email.help']}
        </Field.Description>
        {showEmailError && <Field.Error>{labels['details.email.error']}</Field.Error>}
      </Field>

      <Field className={fieldClass}>
        <Field.Label htmlFor={field('notes')}>{labels['details.notes.label']}</Field.Label>
        <Textarea
          id={field('notes')}
          rows={3}
          className={slotClass(classNames, 'input', BOOKING_TEXTAREA_CLASS)}
          placeholder={labelText(labels['details.notes.placeholder'])}
          value={state.notes}
          onChange={(event) => onChange({ type: 'setNotes', value: event.target.value })}
        />
      </Field>

      <Field orientation="horizontal" className={slotClass(classNames, 'consent')}>
        <Checkbox
          id={field('terms')}
          ref={termsRef}
          className={BOOKING_CHECKBOX_CLASS}
          checked={state.consentTerms}
          aria-invalid={showTermsError || undefined}
          onCheckedChange={(accepted) => onChange({ type: 'setConsent', which: 'terms', accepted })}
        />
        <Field.Label htmlFor={field('terms')} className="cursor-pointer font-normal">
          {labels['details.terms.text']}
        </Field.Label>
        {termsHref && (
          <a
            href={termsHref}
            className="col-start-2 text-sm font-semibold text-primary underline underline-offset-4"
          >
            {labels['details.terms.link']}
          </a>
        )}
      </Field>

      {marketingConsent && (
        <Field orientation="horizontal" className={slotClass(classNames, 'consent')}>
          {/* Unticked unless the visitor ticks it: a pre-ticked box is not consent. */}
          <Checkbox
            id={field('marketing')}
            className={BOOKING_CHECKBOX_CLASS}
            checked={state.consentMarketing}
            onCheckedChange={(accepted) =>
              onChange({ type: 'setConsent', which: 'marketing', accepted })
            }
          />
          <Field.Label htmlFor={field('marketing')} className="cursor-pointer font-normal">
            {labels['details.marketing.text']}
          </Field.Label>
        </Field>
      )}

      {state.error && (
        <SubmitFailure
          error={state.error}
          phone={phone}
          format={format}
          labels={labels}
          className={slotClass(
            classNames,
            'error',
            'rounded-lg border border-destructive/40 bg-destructive/10 px-5 py-3 text-sm'
          )}
        />
      )}

      {/* Enabled with an invalid form on purpose: a greyed-out submit names no
          field. `submitting` is the exception — the double-tap courtesy. */}
      <BookingButton
        size="lg"
        className={slotClass(classNames, 'submit', 'w-full')}
        disabled={submitting}
        aria-busy={submitting || undefined}
        onClick={handleSubmit}
      >
        {renderLabel(labels['details.submit'], { price })}
      </BookingButton>
    </section>
  );
}

/**
 * The name and birth year for one line. Wrapped in a fieldset only when there
 * is more than one line: two identically labelled fields with nothing between
 * them is how one child's name lands on the other's booking.
 */
function ChildFields({
  legend,
  nameId,
  yearId,
  value,
  family,
  labels,
  classNames,
  FamilyChip,
  onChange,
}: {
  legend: string | null;
  nameId: string;
  yearId: string;
  value: ChildInput;
  family?: readonly BookingFamilyMember[];
  labels: DetailsScreenLabels;
  classNames?: SlotClassNames<DetailsScreenSlot>;
  FamilyChip: ComponentType<FamilyChipProps>;
  onChange: (patch: Partial<ChildInput>, personId?: string) => void;
}) {
  const fields = (
    // Side by side: the year qualifies the name.
    <div className="grid grid-cols-[1fr_7rem] gap-3">
      <Field className={slotClass(classNames, 'field')}>
        <Field.Label htmlFor={nameId}>{labels['details.child.name']}</Field.Label>
        <Input
          id={nameId}
          className={slotClass(classNames, 'input', BOOKING_INPUT_CLASS)}
          value={value.name}
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </Field>
      <Field className={slotClass(classNames, 'field')}>
        <Field.Label htmlFor={yearId}>{labels['details.child.year']}</Field.Label>
        {/* Text with a numeric keypad rather than `type="number"`: no spinner
            to nudge a birth year, and an emptied field stays a string. */}
        <Input
          id={yearId}
          inputMode="numeric"
          maxLength={4}
          className={slotClass(classNames, 'input', BOOKING_INPUT_CLASS)}
          placeholder={labelText(labels['details.child.yearPlaceholder'])}
          value={value.birthYear}
          onChange={(event) => onChange({ birthYear: event.target.value })}
        />
      </Field>
    </div>
  );

  const withSuggestions = (
    <div className="space-y-3">
      {family !== undefined && family.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {family.map((member) => (
            <FamilyChip
              key={`${member.name}-${member.birthYear}`}
              member={member}
              pressed={value.name === member.name && value.birthYear === String(member.birthYear)}
              onPick={() =>
                onChange(
                  { name: member.name, birthYear: String(member.birthYear) },
                  member.personId
                )
              }
            />
          ))}
        </div>
      )}
      {fields}
    </div>
  );

  if (legend === null) return withSuggestions;
  return (
    <fieldset
      className={slotClass(
        classNames,
        'childGroup',
        'space-y-2 rounded-lg border border-border px-5 py-4'
      )}
    >
      <legend className="px-1 font-sans text-sm font-bold text-muted-foreground">{legend}</legend>
      {withSuggestions}
    </fieldset>
  );
}

/**
 * A failed submit must not be silent: announced (nothing else on the screen
 * moved), and it offers the phone, because what reaches here is what the
 * visitor cannot fix by trying harder.
 */
function SubmitFailure({
  error,
  phone,
  format,
  labels,
  className,
}: {
  error: WizardError;
  phone: string | null;
  format: BookingFormat;
  labels: DetailsScreenLabels;
  className: string;
}) {
  const template = labels['details.call.link'];
  const call = phone ? fillLabel(template, { phone }) : null;
  return (
    <p role="alert" className={className}>
      {labels[DETAILS_ERROR_LABEL_KEYS[error]]}{' '}
      {phone && call ? (
        <a
          href={format.telHref(phone)}
          aria-label={call}
          className="font-semibold text-primary underline underline-offset-4"
        >
          {renderLabel(template, { phone })}
        </a>
      ) : (
        labels['details.call.none']
      )}
    </p>
  );
}
