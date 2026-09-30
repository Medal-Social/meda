'use client';

import {
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from 'react';
import { Field } from '../primitives/field.js';
import { Input } from '../primitives/input.js';
import { BOOKING_INPUT_CLASS, BookingButton } from './internal/ui.js';
import { fillLabel } from './labels.js';
import {
  OTP_SLOTS_LABEL_KEYS,
  OtpSlots,
  type OtpSlotsLabels,
  type OtpSlotsSlot,
} from './otp-slots.js';
import { type SlotClassNames, slotClass } from './slots.js';
import type { BookingGuardian } from './types.js';
import {
  VIPPS_BUTTON_LABEL_KEYS,
  VippsButton,
  type VippsButtonLabels,
  type VippsButtonSlot,
  type VippsStartAction,
} from './vipps-button.js';

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

export const LOGIN_PANEL_OWN_LABEL_KEYS = [
  'login.heading',
  'login.codeHeading',
  'login.or',
  'login.emailIntro',
  'login.emailLabel',
  'login.sendCode',
  'login.codeLabel',
  'login.submitCode',
  'login.codeHelp',
  'login.codeHelpVipps',
  'login.vippsSentTo',
  'login.vippsSentToUnknown',
  'login.cooldownWait',
  'login.cooldownReady',
  'login.resendIn',
  'login.resend',
  'login.switchEmail',
  'login.useEmailInstead',
  'login.notice.sent',
  'login.notice.resent',
  'login.notice.unreachable',
  'login.notice.badEmail',
  'login.notice.invalid',
  'login.notice.throttled',
  'login.notice.vippsInvalid',
  'login.notice.vippsConflict',
] as const;

export const LOGIN_PANEL_LABEL_KEYS = [
  ...LOGIN_PANEL_OWN_LABEL_KEYS,
  ...OTP_SLOTS_LABEL_KEYS,
  ...VIPPS_BUTTON_LABEL_KEYS,
] as const;

/**
 * Placeholders: `login.codeHelp` `{email}`, `login.vippsSentTo` `{to}`,
 * `login.cooldownWait` `{seconds}`, `login.resendIn` `{time}` («0:30»).
 */
export type LoginPanelLabels = Record<(typeof LOGIN_PANEL_OWN_LABEL_KEYS)[number], string> &
  OtpSlotsLabels &
  VippsButtonLabels;

/**
 * - `root`: the panel's column.
 * - `notice`: a non-error sentence in the live region (errors use `Field.Error`).
 * - `form`: both forms (e-mail, code).
 * - `input`: the e-mail input.
 * - `submit`: both forms' submit buttons.
 * - `divider`: the «or» rule between Vipps and e-mail.
 * - `links`: the row under the code form; `link`: each of its buttons.
 */
export type LoginPanelSlot =
  | 'root'
  | 'notice'
  | 'form'
  | 'input'
  | 'submit'
  | 'divider'
  | 'links'
  | 'link';

/** What asking for a code answered. `invalidEmail`: the address was refused. */
export type LoginStartResult = { ok: true } | { ok: false; reason: 'unreachable' | 'invalidEmail' };

/** What checking a code answered. `conflict`: the Vipps account belongs to another profile. */
export type LoginVerifyResult =
  | { ok: true; guardian: BookingGuardian | null }
  | { ok: false; reason: 'invalid' | 'throttled' | 'conflict' | 'unreachable' };

/** A Vipps return that asks for the e-mailed code. `to` is a masked address, or `null`. */
export interface VippsConfirm {
  to: string | null;
}

/**
 * The part of a login that must outlive the dialog it is drawn in: a user
 * who closes a sheet to check their mail should land back on the code screen
 * for the address the code went to, with the resend wait still running.
 */
export interface LoginPanelMemory {
  /** `vipps`: confirming a Vipps login with a code e-mailed to the address on file. */
  mode: 'start' | 'code' | 'vipps';
  email: string;
  /** The address a code was actually sent to — pinned when the request leaves. */
  sentTo: string;
  /** When «send a new code» opens again (epoch ms); `0` before any code went out. */
  resendAt: number;
}

export const FRESH_LOGIN_MEMORY: LoginPanelMemory = {
  mode: 'start',
  email: '',
  sentTo: '',
  resendAt: 0,
};

/** Where a Vipps return that asks for the code starts: on the code, for `to`. */
export function loginMemoryFor(vippsConfirm: VippsConfirm | null | undefined): LoginPanelMemory {
  return vippsConfirm
    ? { mode: 'vipps', email: '', sentTo: vippsConfirm.to ?? '', resendAt: 0 }
    : FRESH_LOGIN_MEMORY;
}

export interface LoginPanelProps {
  labels: LoginPanelLabels;
  /** Ask for a code for `email` (already trimmed). Resolve `ok` whether or not the address is known. */
  onStartLogin: (email: string) => Promise<LoginStartResult>;
  /**
   * Check a code. `mode: 'email'` carries the address the code went to;
   * `mode: 'vipps'` is a Vipps confirm, checked by the code alone.
   */
  onVerify: (
    code: string,
    context: { mode: 'email' | 'vipps'; email: string }
  ) => Promise<LoginVerifyResult>;
  /** A good code. `guardian` is who logged in, or `null` when that read failed. */
  onSignedIn: (guardian: BookingGuardian | null) => void;
  /** The Vipps start action. Absent: no Vipps button and no «or» rule. */
  onVipps?: VippsStartAction;
  /** Where a Vipps login should land. */
  vippsNext?: string | null;
  /** Replaces the Vipps button's label. */
  vippsLabel?: string;
  /** Start on the Vipps confirm code screen (uncontrolled memory only). */
  vippsConfirm?: VippsConfirm | null;
  /** Controlled memory, for a caller whose panel unmounts (a sheet). */
  memory?: LoginPanelMemory;
  onMemoryChange?: Dispatch<SetStateAction<LoginPanelMemory>>;
  /** Draws the heading («Log in» / «Check your e-mail»). Default: none — the page has its own. */
  heading?: (text: string) => ReactNode;
  /** Drawn above the Vipps button on the first screen. */
  intro?: ReactNode;
  /** Wait between codes. Default 30 s. */
  resendCooldownMs?: number;
  classNames?: SlotClassNames<LoginPanelSlot>;
  otpClassNames?: SlotClassNames<OtpSlotsSlot>;
  vippsClassNames?: SlotClassNames<VippsButtonSlot>;
}

type Notice =
  | 'sent'
  | 'resent'
  | 'unreachable'
  | 'badEmail'
  | 'invalid'
  | 'throttled'
  | 'vippsInvalid'
  | 'vippsConflict';

/** The notices that describe a mistake in the field they sit under. */
const FIELD_ERRORS: ReadonlySet<Notice> = new Set([
  'badEmail',
  'invalid',
  'throttled',
  'vippsInvalid',
  'vippsConflict',
]);

/** «0:30» — minutes and zero-padded seconds, the way a phone shows a timer. */
function timer(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function verifyNotice(
  reason: Extract<LoginVerifyResult, { ok: false }>['reason'],
  vipps: boolean
): Notice {
  if (reason === 'invalid') return vipps ? 'vippsInvalid' : 'invalid';
  if (reason === 'conflict') return 'vippsConflict';
  return reason;
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

/**
 * The login itself: Vipps and an e-mail address, then the code that address
 * received. Knows nothing about where it is drawn — the heading, the intro and
 * what a good code leads to are the caller's.
 *
 * Two things it is careful NOT to say: whether the address is a customer (the
 * «sent» copy is conditional, and `onStartLogin` should resolve `ok` for every
 * address), and that a code was sent when asking for one failed.
 *
 * THE CODE FIELD fills from one paste, sends itself on the sixth digit, and
 * empties itself and takes the caret back after a wrong code. «Send a new code»
 * waits between asks, so an impatient tap does not spend the rate-limit
 * allowance on a code that is still valid.
 */
export function LoginPanel({
  labels,
  onStartLogin,
  onVerify,
  onSignedIn,
  onVipps,
  vippsNext = null,
  vippsLabel,
  vippsConfirm = null,
  memory: memoryProp,
  onMemoryChange,
  heading = () => null,
  intro,
  resendCooldownMs = 30_000,
  classNames,
  otpClassNames,
  vippsClassNames,
}: LoginPanelProps) {
  const id = useId();
  const [heldHere, setHeldHere] = useState<LoginPanelMemory>(() => loginMemoryFor(vippsConfirm));
  const controlled = memoryProp !== undefined && onMemoryChange !== undefined;
  const { mode, email, sentTo, resendAt } = controlled ? memoryProp : heldHere;
  const setMemory = controlled ? onMemoryChange : setHeldHere;
  const remember = (patch: Partial<LoginPanelMemory>) =>
    setMemory((previous) => ({ ...previous, ...patch }));
  const setEmail = (next: string) => remember({ email: next });
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [pending, startTransition] = useTransition();
  /** The instant the countdown last read. */
  const [now, setNow] = useState(() => Date.now());
  /** Put the caret back into the code field once it is usable again. */
  const [focusCode, setFocusCode] = useState(mode === 'code');
  /** A verify in flight, read synchronously: the sixth digit and a submit can
   * arrive in the same tick, before `pending` has rendered. */
  const verifying = useRef(false);
  const [checking, setChecking] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);

  const emailId = `${id}-email`;
  const codeId = `${id}-code`;
  const noticeId = `${id}-notice`;

  const waitSeconds = Math.max(0, Math.ceil((resendAt - now) / 1000));

  // One tick a second while the wait is on, and none at all once it is over.
  useEffect(() => {
    if (mode !== 'code' || resendAt <= Date.now()) return;
    const interval = setInterval(() => {
      const tick = Date.now();
      setNow(tick);
      if (tick >= resendAt) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, resendAt]);

  // A disabled input cannot hold focus, so the caret goes back when the field
  // is usable again.
  useEffect(() => {
    if (!focusCode || pending || mode !== 'code') return;
    setFocusCode(false);
    codeRef.current?.querySelector<HTMLInputElement>('input')?.focus();
  }, [focusCode, pending, mode]);

  function requestCode(address: string, resend: boolean) {
    startTransition(async () => {
      let result: LoginStartResult;
      try {
        result = await onStartLogin(address);
      } catch {
        result = { ok: false, reason: 'unreachable' };
      }
      if (!result.ok) {
        setNotice(result.reason === 'invalidEmail' ? 'badEmail' : 'unreachable');
        return;
      }
      const sentAt = Date.now();
      setCode('');
      setNotice(resend ? 'resent' : 'sent');
      setNow(sentAt);
      remember({ mode: 'code', sentTo: address, resendAt: sentAt + resendCooldownMs });
      setFocusCode(true);
    });
  }

  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    setEmail(trimmed);
    requestCode(trimmed, false);
  }

  function verify(value: string) {
    if (verifying.current) return;
    verifying.current = true;
    setChecking(true);
    const vipps = mode === 'vipps';
    startTransition(async () => {
      try {
        let outcome: LoginVerifyResult;
        try {
          outcome = await onVerify(value.trim(), {
            mode: vipps ? 'vipps' : 'email',
            email: sentTo,
          });
        } catch {
          outcome = { ok: false, reason: 'unreachable' };
        }
        if (outcome.ok) {
          setNotice(null);
          onSignedIn(outcome.guardian);
          return;
        }
        const next = verifyNotice(outcome.reason, vipps);
        setNotice(next);
        if (next === 'invalid' || next === 'vippsInvalid') {
          // Empty, and the caret back in it: the six digits on screen are
          // known to be wrong, and retyping over them is slower than typing.
          setCode('');
          setFocusCode(true);
        }
      } finally {
        verifying.current = false;
        setChecking(false);
      }
    });
  }

  function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    verify(code);
  }

  function switchEmail() {
    remember({ mode: 'start' });
    setCode('');
    setNotice(null);
  }

  const isFieldError = notice !== null && FIELD_ERRORS.has(notice);
  const noticeText = notice === null ? null : labels[`login.notice.${notice}`];

  // One live region for the whole flow, ABOVE the switch between the two
  // screens so it stays mounted across it: a region that arrives already
  // holding its sentence is often read as nothing at all. It doubles as the
  // description of whichever input the notice is about.
  const liveRegion = (
    <div aria-live="polite">
      {noticeText &&
        (isFieldError ? (
          <Field.Error id={noticeId}>{noticeText}</Field.Error>
        ) : (
          <p
            id={noticeId}
            className={slotClass(classNames, 'notice', 'text-sm text-muted-foreground')}
          >
            {noticeText}
          </p>
        ))}
    </div>
  );

  // The countdown on the button changes every second; this region says only
  // the two things worth hearing — how long, and that it is over.
  const cooldownSentence =
    waitSeconds > 0
      ? fillLabel(labels['login.cooldownWait'], { seconds: Math.ceil(resendCooldownMs / 1000) })
      : labels['login.cooldownReady'];
  const cooldownRegion = (
    <p aria-live="polite" className="sr-only">
      {mode === 'code' ? cooldownSentence : null}
    </p>
  );

  const link = slotClass(
    classNames,
    'link',
    'font-semibold text-primary underline underline-offset-4 disabled:no-underline disabled:opacity-60'
  );

  return (
    <div className={slotClass(classNames, 'root', 'space-y-6')}>
      {heading(mode === 'start' ? labels['login.heading'] : labels['login.codeHeading'])}
      {mode === 'vipps' && (
        // Text, never markup: `sentTo` may have come in on a URL.
        <p className="text-muted-foreground">
          {sentTo === ''
            ? labels['login.vippsSentToUnknown']
            : fillLabel(labels['login.vippsSentTo'], { to: sentTo })}
        </p>
      )}
      {liveRegion}
      {cooldownRegion}
      {mode === 'start' ? (
        <>
          {intro}
          {onVipps && (
            <>
              <VippsButton
                onVipps={onVipps}
                next={vippsNext}
                label={vippsLabel}
                labels={labels}
                classNames={vippsClassNames}
              />
              <div
                className={slotClass(
                  classNames,
                  'divider',
                  'flex items-center gap-4 text-sm text-muted-foreground'
                )}
                aria-hidden="true"
              >
                <span className="h-px flex-1 bg-border" />
                {labels['login.or']}
                <span className="h-px flex-1 bg-border" />
              </div>
            </>
          )}
          <p className="text-muted-foreground">{labels['login.emailIntro']}</p>
          <form onSubmit={submitEmail} className={slotClass(classNames, 'form', 'space-y-6')}>
            <Field>
              <Field.Label htmlFor={emailId}>{labels['login.emailLabel']}</Field.Label>
              <Input
                id={emailId}
                type="email"
                autoComplete="email"
                required
                value={email}
                aria-describedby={noticeText ? noticeId : undefined}
                aria-invalid={isFieldError || undefined}
                onChange={(event) => setEmail(event.target.value)}
                className={slotClass(classNames, 'input', BOOKING_INPUT_CLASS)}
              />
            </Field>
            <BookingButton
              type="submit"
              size="lg"
              className={slotClass(classNames, 'submit', 'w-full')}
              disabled={pending}
            >
              {labels['login.sendCode']}
            </BookingButton>
          </form>
        </>
      ) : (
        <>
          <form onSubmit={submitCode} className={slotClass(classNames, 'form', 'space-y-6')}>
            <Field>
              <Field.Label htmlFor={codeId}>{labels['login.codeLabel']}</Field.Label>
              <div ref={codeRef}>
                <OtpSlots
                  id={codeId}
                  value={code}
                  // Read-only rather than disabled while a request is out, so
                  // the caret stays in the field instead of falling out of a
                  // dialog; a wrong code then only has to empty it.
                  readOnly={checking}
                  invalid={isFieldError}
                  describedBy={`${codeId}-help${noticeText ? ` ${noticeId}` : ''}`}
                  labels={labels}
                  classNames={otpClassNames}
                  onChange={setCode}
                  onComplete={verify}
                />
              </div>
              <Field.Description id={`${codeId}-help`}>
                {mode === 'vipps'
                  ? labels['login.codeHelpVipps']
                  : fillLabel(labels['login.codeHelp'], { email: sentTo })}
              </Field.Description>
            </Field>
            <BookingButton
              type="submit"
              size="lg"
              className={slotClass(classNames, 'submit', 'w-full')}
              disabled={pending}
            >
              {labels['login.submitCode']}
            </BookingButton>
          </form>
          {/* A Vipps confirm's code went where the provider chose, so there is
              nothing to resend and no address to change — only the way back. */}
          <div
            className={slotClass(classNames, 'links', 'flex flex-wrap items-center gap-4 text-sm')}
          >
            {mode !== 'vipps' && (
              <button
                type="button"
                disabled={pending || waitSeconds > 0}
                onClick={() => requestCode(sentTo, true)}
                className={link}
              >
                {waitSeconds > 0
                  ? fillLabel(labels['login.resendIn'], { time: timer(waitSeconds) })
                  : labels['login.resend']}
              </button>
            )}
            <button type="button" disabled={pending} onClick={switchEmail} className={link}>
              {mode === 'vipps' ? labels['login.useEmailInstead'] : labels['login.switchEmail']}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
