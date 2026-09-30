'use client';

import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { Sheet } from '../primitives/sheet.js';
import { labelParts } from './internal/label-parts.js';
import { BookingButton } from './internal/ui.js';
import {
  LOGIN_PANEL_LABEL_KEYS,
  LoginPanel,
  type LoginPanelLabels,
  type LoginPanelMemory,
  type LoginPanelProps,
  loginMemoryFor,
} from './login-panel.js';
import { type SlotClassNames, slotClass } from './slots.js';
import type { BookingGuardian } from './types.js';

export const LOGIN_SHEET_OWN_LABEL_KEYS = [
  'loginSheet.prompt',
  'loginSheet.trigger',
  'loginSheet.intro',
  'loginSheet.vipps',
  'loginSheet.close',
] as const;

export const LOGIN_SHEET_LABEL_KEYS = [
  ...LOGIN_SHEET_OWN_LABEL_KEYS,
  ...LOGIN_PANEL_LABEL_KEYS,
] as const;

/** `loginSheet.prompt` holds a `{trigger}` placeholder where the trigger button goes. */
export type LoginSheetLabels = Record<(typeof LOGIN_SHEET_OWN_LABEL_KEYS)[number], string> &
  LoginPanelLabels;

/**
 * - `prompt`: the «have an account? Log in» row.
 * - `trigger`: the button inside it.
 * - `content`: the sheet (`Sheet.Content`).
 * - `title`, `description`: the sheet's heading and intro.
 * - `close`: the close button.
 */
export type LoginSheetSlot = 'prompt' | 'trigger' | 'content' | 'title' | 'description' | 'close';

export interface LoginSheetProps
  extends Pick<
    LoginPanelProps,
    | 'onStartLogin'
    | 'onVerify'
    | 'onVipps'
    | 'vippsConfirm'
    | 'resendCooldownMs'
    | 'otpClassNames'
    | 'vippsClassNames'
  > {
  labels: LoginSheetLabels;
  /**
   * A good code. The sheet has already closed itself. `guardian` is who
   * logged in, or `null` when that read failed.
   */
  onSignedIn: (guardian: BookingGuardian | null) => void;
  /** Where a Vipps login should land (the caller's resume URL). */
  resumePath: string;
  /** Draw the prompt row. Off for a sheet opened for a Vipps confirm alone. Default `true`. */
  trigger?: boolean;
  classNames?: SlotClassNames<LoginSheetSlot>;
  panelClassNames?: LoginPanelProps['classNames'];
}

/**
 * The login as a booking flow offers it: a prompt row that opens a modal
 * sheet (bottom sheet on phones, centred dialog from `md` up). It is an OFFER
 * — the flow never waits on it — and it never navigates: a good code hands
 * the user back through `onSignedIn` and the flow fills its fields in place.
 *
 * The login's memory (which screen, which address, the resend wait) lives
 * here, above the sheet's content, which unmounts on close — so closing the
 * sheet to check the mail and reopening it lands back on the code screen with
 * the wait still running.
 */
export function LoginSheet({
  labels,
  onStartLogin,
  onVerify,
  onVipps,
  onSignedIn,
  resumePath,
  vippsConfirm = null,
  trigger = true,
  resendCooldownMs,
  classNames,
  panelClassNames,
  otpClassNames,
  vippsClassNames,
}: LoginSheetProps) {
  // Open from the start for a Vipps return: the user is here to type a code.
  const [open, setOpen] = useState(vippsConfirm !== null);
  const [memory, setMemory] = useState<LoginPanelMemory>(() => loginMemoryFor(vippsConfirm));
  /**
   * Set by a good code. The prompt row goes with it — the caller knows the
   * user now — so the sheet has no trigger to hand focus back to, and the
   * caller can put it on its own heading instead.
   */
  const [signedIn, setSignedIn] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger && !signedIn && (
        <p className={slotClass(classNames, 'prompt', 'text-sm text-muted-foreground')}>
          {labelParts(labels['loginSheet.prompt'], {
            trigger: (
              <Sheet.Trigger
                className={slotClass(
                  classNames,
                  'trigger',
                  'font-semibold text-primary underline underline-offset-4'
                )}
              >
                {labels['loginSheet.trigger']}
              </Sheet.Trigger>
            ),
          })}
        </p>
      )}
      <Sheet.Content className={slotClass(classNames, 'content', 'z-50')}>
        <LoginPanel
          labels={labels}
          memory={memory}
          onMemoryChange={setMemory}
          onStartLogin={onStartLogin}
          onVerify={onVerify}
          onVipps={onVipps}
          vippsNext={resumePath}
          vippsLabel={labels['loginSheet.vipps']}
          resendCooldownMs={resendCooldownMs}
          classNames={panelClassNames}
          otpClassNames={otpClassNames}
          vippsClassNames={vippsClassNames}
          onSignedIn={(guardian) => {
            setSignedIn(true);
            setOpen(false);
            onSignedIn(guardian);
          }}
          heading={(text) => (
            <Sheet.Title
              className={slotClass(classNames, 'title', 'pe-10 font-sans text-2xl font-bold')}
            >
              {text}
            </Sheet.Title>
          )}
          intro={
            <Sheet.Description
              className={slotClass(classNames, 'description', 'text-muted-foreground')}
            >
              {labels['loginSheet.intro']}
            </Sheet.Description>
          }
        />
        <Sheet.Close
          render={
            <BookingButton
              variant="ghost"
              size="icon-sm"
              className={slotClass(classNames, 'close', 'absolute top-4 right-4')}
            >
              <XIcon aria-hidden="true" />
              <span className="sr-only">{labels['loginSheet.close']}</span>
            </BookingButton>
          }
        />
      </Sheet.Content>
    </Sheet>
  );
}
