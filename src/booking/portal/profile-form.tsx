'use client';

import { type FormEvent, useId, useOptimistic, useState, useTransition } from 'react';
import { Checkbox } from '../../primitives/checkbox.js';
import { Field } from '../../primitives/field.js';
import { Input } from '../../primitives/input.js';
import { BOOKING_CHECKBOX_CLASS, BOOKING_INPUT_CLASS, BookingButton } from '../internal/ui.js';
import { type BookingLabel, labelText } from '../labels.js';
import { type SlotClassNames, slotClass } from '../slots.js';
import type { PortalProfileDto } from '../types.js';
import { type PortalActionFailure, settle } from './action-result.js';

export const PROFILE_FORM_LABEL_KEYS = [
  'profileForm.heading',
  'profileForm.firstName',
  'profileForm.lastName',
  'profileForm.phone',
  'profileForm.email',
  'profileForm.emailHelp',
  'profileForm.save',
  'profileForm.saved',
  'profileForm.restored',
  'profileForm.marketing',
  'profileForm.unreachable',
] as const;

/** `marketing` is the consent sentence and usually names the business. */
export type ProfileFormLabels = Record<(typeof PROFILE_FORM_LABEL_KEYS)[number], BookingLabel>;

/**
 * `root` (the section), `heading`, `form`, `status` (the save notice's live
 * region), `save` (the submit button), `consent` (the marketing box's field).
 */
export type ProfileFormSlot = 'root' | 'heading' | 'form' | 'status' | 'save' | 'consent';

/**
 * What a save sends. A name is present only when non-empty (a cleared field
 * is not an instruction to file a blank name); the phone always travels, and
 * `''` is how «no phone» is spelled.
 */
export interface ProfilePatch {
  firstName?: string;
  lastName?: string;
  phone: string;
}

/** The fields of the profile the backend stored. */
export interface StoredProfile {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

export type ProfileSaveResult =
  | { ok: true; profile: StoredProfile }
  | { ok: false; kind: 'session' }
  | {
      ok: false;
      kind: 'error';
      message?: string;
      /** The field the rejection is about, when it is about one (only the phone can be). */
      field?: 'phone';
    };

export type ConsentResult = { ok: true; marketingConsent: boolean } | PortalActionFailure;

export interface ProfileFormProps {
  labels: ProfileFormLabels;
  profile: Pick<
    PortalProfileDto,
    'email' | 'firstName' | 'lastName' | 'phone' | 'marketingConsent'
  >;
  /** Saves names and phone. */
  onSave: (patch: ProfilePatch) => Promise<ProfileSaveResult>;
  /** Stores the marketing choice. The box then shows what was stored. */
  onConsentChange: (accepted: boolean) => Promise<ConsentResult>;
  /** A callback answered `{ kind: 'session' }`: send the visitor to the login. */
  onSessionExpired?: () => void;
  classNames?: SlotClassNames<ProfileFormSlot>;
}

type Status =
  | { kind: 'saved' }
  | { kind: 'restored'; first: boolean; last: boolean }
  | { kind: 'error'; message: string; field: 'phone' | null }
  | null;

/** The fields and the notice, as the form draws them. */
interface FormView {
  firstName: string;
  lastName: string;
  phone: string;
  status: Status;
}

/**
 * What to say after an accepted save. A name the parent emptied that came
 * back non-empty was kept, not saved — say which; otherwise plain «saved».
 */
function afterSave(sent: { first: string; last: string }, saved: StoredProfile): Status {
  const first = sent.first === '' && (saved.firstName ?? '') !== '';
  const last = sent.last === '' && (saved.lastName ?? '') !== '';
  return first || last ? { kind: 'restored', first, last } : { kind: 'saved' };
}

/**
 * What the form will show once the patch is taken: a cleared name back to
 * the one on file, and the notice `afterSave` would give.
 */
function predictSaved(
  sent: { first: string; last: string; phone: string },
  onFile: StoredProfile
): FormView {
  return {
    firstName: sent.first || (onFile.firstName ?? ''),
    lastName: sent.last || (onFile.lastName ?? ''),
    phone: sent.phone,
    status: afterSave(sent, onFile),
  };
}

/**
 * «About you» — name and phone, the e-mail the login is bound to (read-only:
 * changing it would change who can log in), and the marketing box.
 *
 * When a name WAS cleared, the save re-fills it from the stored profile and
 * the notice says so rather than «saved». The marketing box is its own
 * callback: it flips at once, and flips back if the change was not taken, so
 * the box shows what is stored and not what the browser hoped for.
 *
 * Every message is wired to the input it is about (`aria-describedby`, and
 * `aria-invalid` when it is a mistake). A failure about the REQUEST rather
 * than a field is announced by the live region alone.
 *
 * OPTIMISTIC: the tap shows the outcome at once through `useOptimistic` —
 * names trimmed, a cleared name back to the one on file, and «saved» or the
 * «kept your name» notice — with the fields locked until the callback
 * answers. On failure the optimistic view ends, which rolls the form back to
 * what the parent typed, with the reason.
 */
export function ProfileForm({
  labels,
  profile,
  onSave,
  onConsentChange,
  onSessionExpired,
  classNames,
}: ProfileFormProps) {
  const id = useId();
  const [firstName, setFirstName] = useState(profile.firstName ?? '');
  const [lastName, setLastName] = useState(profile.lastName ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [consent, setConsent] = useState(profile.marketingConsent);
  const [status, setStatus] = useState<Status>(null);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [consentPending, startConsent] = useTransition();
  /** What was last stored — the basis for predicting a kept name. */
  const [onFile, setOnFile] = useState<StoredProfile>(profile);
  // The fields are locked while a save is in flight (`disabled` on the
  // fieldset), so the optimistic view is simply the snapshot the tap took.
  const [shown, showSaving] = useOptimistic<FormView, FormView>(
    { firstName, lastName, phone, status },
    (_current, saving) => saving
  );

  const statusId = `${id}-status`;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const first = firstName.trim();
    const last = lastName.trim();
    const patch: ProfilePatch = {
      ...(first ? { firstName: first } : {}),
      ...(last ? { lastName: last } : {}),
      phone,
    };

    startTransition(async () => {
      showSaving(predictSaved({ first, last, phone }, onFile));
      const result = await settle(() => onSave(patch));
      if (result.ok) {
        const saved = result.profile;
        setOnFile(saved);
        setFirstName(saved.firstName ?? '');
        setLastName(saved.lastName ?? '');
        setPhone(saved.phone ?? '');
        setStatus(afterSave({ first, last }, saved));
        return;
      }
      if (result.kind === 'session') {
        onSessionExpired?.();
        return;
      }
      setStatus({
        kind: 'error',
        message: result.message ?? labelText(labels['profileForm.unreachable']),
        field: 'field' in result && result.field === 'phone' ? 'phone' : null,
      });
    });
  }

  function toggleConsent(granted: boolean) {
    const previous = consent;
    setConsent(granted);
    setConsentError(null);
    startConsent(async () => {
      const result = await settle(() => onConsentChange(granted));
      if (result.ok) {
        setConsent(result.marketingConsent);
        return;
      }
      // Nothing was saved either way, so the box goes back first.
      setConsent(previous);
      if (result.kind === 'session') {
        onSessionExpired?.();
        return;
      }
      setConsentError(labelText(labels['profileForm.unreachable']));
    });
  }

  const view = shown.status;
  const phoneInvalid = view?.kind === 'error' && view.field === 'phone';
  const firstRestored = view?.kind === 'restored' && view.first;
  const lastRestored = view?.kind === 'restored' && view.last;

  return (
    <section
      aria-labelledby="portal-profile-heading"
      className={slotClass(classNames, 'root', 'space-y-4')}
    >
      <h2
        id="portal-profile-heading"
        className={slotClass(classNames, 'heading', 'font-sans text-xl font-bold md:text-2xl')}
      >
        {labels['profileForm.heading']}
      </h2>
      <form onSubmit={save} className={slotClass(classNames, 'form', 'space-y-4')}>
        {/* Locked while saving: an edit typed mid-save would be shown through
            the optimistic snapshot and then overwritten by the answer. */}
        <fieldset disabled={pending} className="min-w-0 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field>
              <Field.Label htmlFor={`${id}-first`}>{labels['profileForm.firstName']}</Field.Label>
              <Input
                id={`${id}-first`}
                autoComplete="given-name"
                maxLength={60}
                value={shown.firstName}
                aria-describedby={firstRestored ? statusId : undefined}
                onChange={(event) => {
                  setFirstName(event.target.value);
                  setStatus(null);
                }}
                className={BOOKING_INPUT_CLASS}
              />
            </Field>
            <Field>
              <Field.Label htmlFor={`${id}-last`}>{labels['profileForm.lastName']}</Field.Label>
              <Input
                id={`${id}-last`}
                autoComplete="family-name"
                maxLength={60}
                value={shown.lastName}
                aria-describedby={lastRestored ? statusId : undefined}
                onChange={(event) => {
                  setLastName(event.target.value);
                  setStatus(null);
                }}
                className={BOOKING_INPUT_CLASS}
              />
            </Field>
          </div>
          <Field>
            <Field.Label htmlFor={`${id}-phone`}>{labels['profileForm.phone']}</Field.Label>
            <Input
              id={`${id}-phone`}
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={shown.phone}
              aria-invalid={phoneInvalid || undefined}
              aria-describedby={phoneInvalid ? statusId : undefined}
              onChange={(event) => {
                setPhone(event.target.value);
                setStatus(null);
              }}
              className={BOOKING_INPUT_CLASS}
            />
          </Field>
          <Field>
            <Field.Label htmlFor={`${id}-email`}>{labels['profileForm.email']}</Field.Label>
            <Input
              id={`${id}-email`}
              type="email"
              value={profile.email}
              readOnly
              aria-describedby={`${id}-email-help`}
              className={BOOKING_INPUT_CLASS}
            />
            <Field.Description id={`${id}-email-help`}>
              {labels['profileForm.emailHelp']}
            </Field.Description>
          </Field>
        </fieldset>
        <div aria-live="polite" className={slotClass(classNames, 'status')}>
          {view?.kind === 'saved' && (
            <p id={statusId} className="text-sm text-muted-foreground">
              {labels['profileForm.saved']}
            </p>
          )}
          {view?.kind === 'restored' && (
            <p id={statusId} className="text-sm text-muted-foreground">
              {labels['profileForm.restored']}
            </p>
          )}
          {view?.kind === 'error' && <Field.Error id={statusId}>{view.message}</Field.Error>}
        </div>
        <BookingButton type="submit" disabled={pending} className={slotClass(classNames, 'save')}>
          {labels['profileForm.save']}
        </BookingButton>
      </form>

      <Field orientation="horizontal" className={slotClass(classNames, 'consent')}>
        <Checkbox
          id={`${id}-marketing`}
          checked={consent}
          disabled={consentPending}
          onCheckedChange={toggleConsent}
          className={BOOKING_CHECKBOX_CLASS}
        />
        <Field.Label htmlFor={`${id}-marketing`} className="cursor-pointer font-normal">
          {labels['profileForm.marketing']}
        </Field.Label>
      </Field>
      <div aria-live="polite">{consentError && <Field.Error>{consentError}</Field.Error>}</div>
    </section>
  );
}
