'use client';

import { useActionState, useId } from 'react';
import { useFormStatus } from 'react-dom';
import { bookingButtonClass } from './internal/ui.js';
import { type BookingLabel, labelText } from './labels.js';
import { type SlotClassNames, slotClass } from './slots.js';

export const VIPPS_BUTTON_LABEL_KEYS = [
  'vipps.button',
  'vipps.unavailable',
  'vipps.throttled',
] as const;
export type VippsButtonLabels = Record<(typeof VIPPS_BUTTON_LABEL_KEYS)[number], BookingLabel>;

/** Why a Vipps start did NOT end in a redirect. `null` is silence. */
export type VippsStartState = { ok: false; reason: 'unavailable' | 'throttled' } | null;

/**
 * The start action, in `useActionState`'s shape — so a server action with
 * this signature can be passed straight through and the button keeps working
 * before hydration. On success it is expected to navigate (redirect) and never
 * answer; the only answers the button shows are the reasons it did not.
 */
export type VippsStartAction = (
  previous: VippsStartState,
  formData: FormData
) => VippsStartState | Promise<VippsStartState>;

/**
 * - `root`: the `<form>`.
 * - `button`: the submit button. meda draws it in the bridge `primary`
 *   colours; a site that must show the provider's own brand colour passes
 *   it here (e.g. its orange background and white text).
 * - `notice`: the sentence under the button.
 */
export type VippsButtonSlot = 'root' | 'button' | 'notice';

export interface VippsButtonProps {
  /**
   * The start action, handed to `useActionState` unwrapped so a server action
   * can be passed straight through (the form then works before hydration, and
   * a framework redirect thrown from it propagates). Report failures by
   * returning `{ reason }` — they become the notice under the button. A thrown
   * error is not caught here; it reaches the host's error boundary.
   */
  onVipps: VippsStartAction;
  /** Where to land afterwards; rides along as a hidden `next` field. */
  next?: string | null;
  /** Replaces `labels['vipps.button']` (e.g. «Continue with Vipps» mid-flow). */
  label?: string;
  labels: VippsButtonLabels;
  classNames?: SlotClassNames<VippsButtonSlot>;
}

function SubmitButton({ label, className }: { label: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      data-slot="button"
      disabled={pending}
      aria-busy={pending || undefined}
      className={className}
    >
      {label}
    </button>
  );
}

/**
 * «Log in with Vipps» — one button, one action, no fields.
 *
 * A real `<form action>` rather than an `onClick`: the action ends in a
 * redirect, and a form submission is what lets the browser follow it as a
 * plain navigation. It also means the button works before hydration when the
 * action is a server action. `useFormStatus` must be read from INSIDE the
 * form, hence the small inner component.
 */
export function VippsButton({ onVipps, next = null, label, labels, classNames }: VippsButtonProps) {
  const [state, formAction] = useActionState(onVipps, null);
  const noticeId = `${useId()}-notice`;
  const notice = state === null ? null : labels[`vipps.${state.reason}`];

  return (
    <form
      action={formAction}
      className={slotClass(classNames, 'root', 'space-y-3')}
      aria-describedby={notice ? noticeId : undefined}
    >
      {next && <input type="hidden" name="next" value={next} />}
      <SubmitButton
        label={label ?? labelText(labels['vipps.button'])}
        className={bookingButtonClass({
          size: 'lg',
          className: slotClass(
            classNames,
            'button',
            'w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/40'
          ),
        })}
      />
      <div aria-live="polite">
        {notice && (
          <p
            id={noticeId}
            className={slotClass(classNames, 'notice', 'text-sm text-muted-foreground')}
          >
            {notice}
          </p>
        )}
      </div>
    </form>
  );
}
