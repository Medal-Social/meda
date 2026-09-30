'use client';

import { type FormEvent, useState, useTransition } from 'react';
import { BookingButton } from '../internal/ui.js';
import { type SlotClassNames, slotClass } from '../slots.js';
import type { SaveResult } from '../types.js';

export const LOGOUT_BUTTON_LABEL_KEYS = ['logout.button', 'logout.unreachable'] as const;

export type LogoutButtonLabels = Record<(typeof LOGOUT_BUTTON_LABEL_KEYS)[number], string>;

/** `root` (the form), `button`, `error` (the live line under it). */
export type LogoutButtonSlot = 'root' | 'button' | 'error';

export interface LogoutButtonProps {
  labels: LogoutButtonLabels;
  /**
   * Ends the session. On `{ ok: true }` the caller navigates away itself
   * (one full document load, so nothing rendered under the old session
   * survives in a router cache). Anything else keeps the visitor here with a
   * message: navigating away would SAY logged out while the session may
   * still be live. A failure's `message` is shown when given, else
   * `logout.unreachable`.
   */
  onLogout: () => Promise<SaveResult>;
  classNames?: SlotClassNames<LogoutButtonSlot>;
}

/** «Log out», locked while the callback runs. */
export function LogoutButton({ labels, onLogout, classNames }: LogoutButtonProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function logout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      let result: SaveResult;
      try {
        result = await onLogout();
      } catch {
        result = { ok: false, message: '' };
      }
      if (!result.ok) setError(result.message || labels['logout.unreachable']);
    });
  }

  return (
    <form onSubmit={logout} className={slotClass(classNames, 'root')}>
      <BookingButton
        type="submit"
        variant="outline"
        disabled={pending}
        className={slotClass(classNames, 'button')}
      >
        {labels['logout.button']}
      </BookingButton>
      <p
        aria-live="polite"
        className={slotClass(classNames, 'error', 'mt-2 text-sm text-destructive')}
      >
        {error}
      </p>
    </form>
  );
}
