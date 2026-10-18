'use client';

import { type FormEvent, useId, useState, useTransition } from 'react';
import { Field } from '../../primitives/field.js';
import { Input } from '../../primitives/input.js';
import { renderLabel } from '../internal/label-parts.js';
import { BOOKING_INPUT_CLASS, BookingButton } from '../internal/ui.js';
import { type BookingLabel, fillLabel, labelText } from '../labels.js';
import { type SlotClassNames, slotClass } from '../slots.js';
import { type PortalActionFailure, type PortalActionResult, settle } from './action-result.js';

export const DATA_CONTROLS_LABEL_KEYS = [
  'dataControls.heading',
  'dataControls.export',
  'dataControls.delete',
  'dataControls.confirmHeading',
  'dataControls.consequences',
  'dataControls.confirmLabel',
  'dataControls.confirmHelp',
  'dataControls.wrongWord',
  'dataControls.deleteForever',
  'dataControls.cancel',
  'dataControls.unreachable',
  'dataControls.confirmWord',
] as const;

/**
 * `confirmWord` is the literal the visitor must type (e.g. «DELETE»);
 * `confirmLabel` and `wrongWord` take `{word}`.
 */
export type DataControlsLabels = Record<(typeof DATA_CONTROLS_LABEL_KEYS)[number], BookingLabel>;

/**
 * `root` (the section), `heading`, `actions` (the export/delete row),
 * `confirm` (the confirm panel form).
 */
export type DataControlsSlot = 'root' | 'heading' | 'actions' | 'confirm';

/**
 * The export's answer. With `filename` and `json` the screen turns it into a
 * file download (nothing of it is rendered into the page); a plain
 * `{ ok: true }` means the caller delivered the file itself.
 */
export type DataExportResult = { ok: true; filename?: string; json?: string } | PortalActionFailure;

export interface DataControlsProps {
  labels: DataControlsLabels;
  /** Take a copy of the visitor's data. */
  onExport: () => Promise<DataExportResult>;
  /**
   * Delete the visitor. Called only with the confirm word typed exactly
   * (trimmed); the backend should re-check it. On `{ ok: true }` the caller
   * navigates away (a full document load, so no cached dashboard survives).
   */
  onDelete: (confirmation: string) => Promise<PortalActionResult>;
  /** A callback answered `{ kind: 'session' }`: send the visitor to the login. */
  onSessionExpired?: () => void;
  classNames?: SlotClassNames<DataControlsSlot>;
}

function download(filename: string, json: string) {
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Deferred a tick: Safari starts the download after `click()` returns, and
  // a URL revoked synchronously is a download of nothing.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * «My data» — the two data-protection gestures: take a copy, and leave.
 *
 * The export is a file, not a page: the callback hands back the JSON as a
 * string and this turns it into a download, so nothing about the visitor is
 * rendered into the DOM or left in the history. The delete is two steps and
 * a typed word — the button alone is not the confirmation, the literal word
 * is, and the backend should re-check it because a page can be driven
 * without its buttons.
 */
export function DataControls({
  labels,
  onExport,
  onDelete,
  onSessionExpired,
  classNames,
}: DataControlsProps) {
  const id = useId();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const word = labelText(labels['dataControls.confirmWord']);
  const confirmId = `${id}-confirm`;
  const errorId = `${id}-error`;

  function failed(failure: PortalActionFailure): string | null {
    if (failure.kind === 'session') {
      onSessionExpired?.();
      return null;
    }
    return failure.message ?? labelText(labels['dataControls.unreachable']);
  }

  function exportData() {
    setExportError(null);
    startTransition(async () => {
      const result = await settle(onExport);
      if (result.ok) {
        if ('filename' in result && result.filename && result.json !== undefined) {
          download(result.filename, result.json);
        }
        return;
      }
      const message = failed(result);
      if (message !== null) setExportError(message);
    });
  }

  function deleteMe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const confirm = typed.trim();
    if (confirm !== word) {
      setError(fillLabel(labels['dataControls.wrongWord'], { word }));
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await settle(() => onDelete(confirm));
      if (result.ok) return;
      const message = failed(result);
      if (message !== null) setError(message);
    });
  }

  return (
    <section
      aria-labelledby="portal-data-heading"
      className={slotClass(classNames, 'root', 'space-y-4')}
    >
      <h2
        id="portal-data-heading"
        className={slotClass(classNames, 'heading', 'font-sans text-xl font-bold md:text-2xl')}
      >
        {labels['dataControls.heading']}
      </h2>
      <div className={slotClass(classNames, 'actions', 'flex flex-wrap items-center gap-3')}>
        <BookingButton variant="outline" onClick={exportData} disabled={pending}>
          {labels['dataControls.export']}
        </BookingButton>
        {!confirming && (
          <BookingButton
            variant="destructive"
            onClick={() => setConfirming(true)}
            disabled={pending}
          >
            {labels['dataControls.delete']}
          </BookingButton>
        )}
      </div>
      <div aria-live="polite">{exportError && <Field.Error>{exportError}</Field.Error>}</div>

      {confirming && (
        <form
          onSubmit={deleteMe}
          aria-labelledby={`${id}-delete-heading`}
          className={slotClass(
            classNames,
            'confirm',
            'space-y-4 rounded-lg border border-destructive/40 bg-destructive/10 px-5 py-4'
          )}
        >
          <p id={`${id}-delete-heading`} className="font-semibold">
            {labels['dataControls.confirmHeading']}
          </p>
          <p className="text-sm">{labels['dataControls.consequences']}</p>
          <Field>
            <Field.Label htmlFor={confirmId}>
              {renderLabel(labels['dataControls.confirmLabel'], { word })}
            </Field.Label>
            <Input
              id={confirmId}
              autoComplete="off"
              autoCapitalize="characters"
              value={typed}
              aria-describedby={`${confirmId}-help${error ? ` ${errorId}` : ''}`}
              aria-invalid={error ? true : undefined}
              onChange={(event) => {
                setTyped(event.target.value);
                setError(null);
              }}
              className={BOOKING_INPUT_CLASS}
            />
            <Field.Description id={`${confirmId}-help`}>
              {labels['dataControls.confirmHelp']}
            </Field.Description>
          </Field>
          <div aria-live="polite">{error && <Field.Error id={errorId}>{error}</Field.Error>}</div>
          <div className="flex flex-wrap items-center gap-3">
            <BookingButton type="submit" variant="destructive" disabled={pending}>
              {labels['dataControls.deleteForever']}
            </BookingButton>
            <BookingButton
              variant="ghost"
              disabled={pending}
              onClick={() => {
                setConfirming(false);
                setTyped('');
                setError(null);
              }}
            >
              {labels['dataControls.cancel']}
            </BookingButton>
          </div>
        </form>
      )}
    </section>
  );
}
