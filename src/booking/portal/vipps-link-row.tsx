'use client';

import { useActionState, useEffect, useId, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { cn } from '../../lib/utils.js';
import { BookingButton } from '../internal/ui.js';
import { type BookingLabel, labelText } from '../labels.js';
import { type SlotClassNames, slotClass } from '../slots.js';

export const VIPPS_LINK_ROW_LABEL_KEYS = [
  'vippsLink.heading',
  'vippsLink.linked',
  'vippsLink.pitch',
  'vippsLink.button',
  'vippsLink.success',
  'vippsLink.conflict',
  'vippsLink.failed',
  'vippsLink.unavailable',
  'vippsLink.throttled',
] as const;

export type VippsLinkRowLabels = Record<(typeof VIPPS_LINK_ROW_LABEL_KEYS)[number], BookingLabel>;

/** `root` (the section), `card` (the bordered row), `heading`, `button`, `notice` (the live line). */
export type VippsLinkRowSlot = 'root' | 'card' | 'heading' | 'button' | 'notice';

/** The outcome of a link attempt that just returned, as the server recorded it. */
export type VippsLinkFlash = 'linked' | 'link_conflict' | 'link_failed';

/**
 * What starting a link answers when it did NOT navigate to Vipps:
 * `missing` — the backend has no link route (the row takes itself away);
 * `session` — the session is dead; `unavailable` / `throttled` — say why.
 * `null` = nothing to report (e.g. the navigation is under way).
 */
export type VippsLinkStartResult = {
  ok: false;
  reason: 'missing' | 'session' | 'unavailable' | 'throttled';
} | null;

export interface VippsLinkRowProps {
  labels: VippsLinkRowLabels;
  /** Whether the profile says Vipps is linked — the ONLY source of the row's state. */
  linked: boolean;
  /** The server-recorded outcome of the link attempt that just returned, if any. */
  flash: VippsLinkFlash | null;
  /**
   * Starts linking. Runs as the form's action (so `useFormStatus` pending
   * applies); on success it navigates to Vipps and its answer is not seen.
   */
  onStart: () => Promise<VippsLinkStartResult>;
  /** A start answered `session`: send the visitor to the login. */
  onSessionExpired?: () => void;
  /**
   * Called once on mount with a non-null `flash`: the caller shows its own
   * toast for `linked` and spends the flash so a reload says nothing again.
   */
  onFlash?: (flash: VippsLinkFlash) => void;
  /** Also say `vippsLink.success` in the notice line for a `linked` flash (for callers without a toast). */
  announceSuccess?: boolean;
  classNames?: SlotClassNames<VippsLinkRowSlot>;
}

function LinkButton({ label, className }: { label: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <BookingButton
      type="submit"
      size="sm"
      disabled={pending}
      aria-busy={pending || undefined}
      className={cn(
        'rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/40',
        className
      )}
    >
      {label}
    </BookingButton>
  );
}

/** The sentence under the row: a failed start first, else what the return said. */
function noticeFor(
  state: VippsLinkStartResult,
  isLinked: boolean,
  flash: VippsLinkFlash | null,
  labels: VippsLinkRowLabels,
  announceSuccess: boolean
): string | null {
  if (state?.reason === 'unavailable') return labelText(labels['vippsLink.unavailable']);
  if (state?.reason === 'throttled') return labelText(labels['vippsLink.throttled']);
  if (flash === 'linked' && announceSuccess) return labelText(labels['vippsLink.success']);
  if (isLinked) return null;
  if (flash === 'link_conflict') return labelText(labels['vippsLink.conflict']);
  if (flash === 'link_failed') return labelText(labels['vippsLink.failed']);
  return null;
}

/**
 * «Vipps» on the profile: «linked», or a button that links the visitor's
 * Vipps account to the profile they are logged in to, so the next login is
 * one tap.
 *
 * A real `<form action>`: the start ends in a navigation to Vipps, and the
 * form's pending state covers it. On the way back the caller hands this row
 * the `flash` the server recorded: `linked` is the caller's toast
 * (`onFlash`), a conflict or a failure is a sentence under the row. Whether
 * the row reads «linked» comes ONLY from `linked`, the profile's own answer —
 * no flash can flip it.
 *
 * Layout-stable: the notice line is always mounted.
 */
export function VippsLinkRow({
  labels,
  linked,
  flash,
  onStart,
  onSessionExpired,
  onFlash,
  announceSuccess = false,
  classNames,
}: VippsLinkRowProps) {
  const id = useId();
  const [state, formAction] = useActionState<VippsLinkStartResult, FormData>(async () => {
    try {
      return await onStart();
    } catch {
      return { ok: false, reason: 'unavailable' };
    }
  }, null);
  const announced = useRef(false);

  useEffect(() => {
    if (announced.current || flash === null) return;
    announced.current = true;
    onFlash?.(flash);
  }, [flash, onFlash]);

  useEffect(() => {
    if (state?.reason === 'session') onSessionExpired?.();
  }, [state, onSessionExpired]);

  if (state?.reason === 'missing') return null;

  const sentence = noticeFor(state, linked, flash, labels, announceSuccess);
  const headingId = `${id}-heading`;
  const noticeId = `${id}-notice`;

  return (
    <section aria-labelledby={headingId} className={slotClass(classNames, 'root', 'space-y-2')}>
      <div
        className={slotClass(
          classNames,
          'card',
          'flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-5 py-4'
        )}
      >
        <div className="min-w-0">
          <h2 id={headingId} className={slotClass(classNames, 'heading', 'font-semibold')}>
            {labels['vippsLink.heading']}
          </h2>
          <p className="text-sm text-muted-foreground">
            {linked ? labels['vippsLink.linked'] : labels['vippsLink.pitch']}
          </p>
        </div>
        {!linked && (
          <form action={formAction} aria-describedby={sentence ? noticeId : undefined}>
            <LinkButton
              label={labelText(labels['vippsLink.button'])}
              className={classNames?.button}
            />
          </form>
        )}
      </div>
      <div aria-live="polite" className={slotClass(classNames, 'notice', 'min-h-5')}>
        {sentence && (
          <p id={noticeId} className="text-sm text-muted-foreground">
            {sentence}
          </p>
        )}
      </div>
    </section>
  );
}
