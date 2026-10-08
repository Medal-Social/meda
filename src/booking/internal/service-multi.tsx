'use client';

import { Check } from 'lucide-react';
import type { KeyboardEvent, ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import type { BookingFormat } from '../format.js';
import { labelText } from '../labels.js';
import { LiveStatus } from '../live-status.js';
import type {
  ServiceMultiLabels,
  ServicePartyPerson,
  ServiceScreenSlot,
  ServiceSelection,
} from '../service-screen.js';
import { type SlotClassNames, slotClass } from '../slots.js';
import { renderLabel } from './label-parts.js';
import { BookingButton } from './ui.js';

/**
 * The service step's multi-select parts (`ServiceScreenProps.selection`):
 * the per-person tabs, the sticky total bar and the checkbox card. Internal —
 * `ServiceScreen` composes them; the package does not export them.
 */

export const serviceTabId = (index: number) => `booking-service-tab-${index}`;
export const serviceTabPanelId = (index: number) => `booking-service-panel-${index}`;

/**
 * One tab per person on the multi-select step, a tick on everyone who has
 * something. The WAI-ARIA tabs pattern: one tab stop, arrows move between
 * people, Home / End jump to the ends; moving selects (one short panel, no
 * cost to showing it).
 */
export function PersonTabs({
  people,
  active,
  done,
  onSelect,
  labels,
  labelledBy,
  describedBy,
  classNames,
}: {
  people: ReadonlyArray<ServicePartyPerson>;
  active: number;
  done: (index: number) => boolean;
  onSelect: (index: number) => void;
  labels: ServiceMultiLabels;
  labelledBy: string;
  describedBy: string;
  classNames: SlotClassNames<ServiceScreenSlot> | undefined;
}) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = people.length - 1;
    const moves: Record<string, number> = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    };
    const next = Object.hasOwn(moves, event.key) ? (moves[event.key] as number) : null;
    if (next === null) return;
    event.preventDefault();
    onSelect(next);
    document.getElementById(serviceTabId(next))?.focus();
  }
  return (
    <div
      role="tablist"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onKeyDown={onKeyDown}
      className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1"
    >
      {people.map((person, index) => {
        const selected = index === active;
        const finished = done(index);
        return (
          <button
            key={person.key}
            type="button"
            role="tab"
            id={serviceTabId(index)}
            aria-selected={selected}
            // The tick, in words: «Theo · 7 år, ferdig». A name rather than a
            // visually hidden span — Chrome reads an absolutely positioned
            // span as a block and puts a space before the comma.
            aria-label={
              finished ? `${person.label}, ${labelText(labels['service.tabDone'])}` : undefined
            }
            // Only the open tab's panel is on the page.
            aria-controls={selected ? serviceTabPanelId(index) : undefined}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(index)}
            // Weight and ring carry the open tab alongside the colour, as the
            // category pills do. Focus is an outline, so it stacks on the
            // selection ring instead of replacing it with a fainter one.
            className={cn(
              'inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border-[1.5px] px-4 text-sm whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              selected
                ? 'border-primary bg-primary/10 font-bold text-foreground ring-2 ring-primary'
                : 'border-primary/35 font-normal text-primary hover:border-primary hover:bg-primary/5',
              classNames?.tab,
              selected && classNames?.tabSelected
            )}
          >
            {finished && <Check aria-hidden="true" className="size-4 shrink-0" />}
            {person.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The multi-select step's sticky bar: the running total, what is still
 * missing, and «Next». The same bar as `SummaryBar`, so the step reads as one
 * flow; a caller that also renders `SummaryBar` hides it on this step.
 *
 * «Next» is never disabled. A disabled button explains nothing and is skipped
 * by a screen reader's tab order; this one stays, the line says what is
 * missing, and the caller decides what pressing it does.
 */
export function TotalBar({
  selection,
  format,
  classNames,
}: {
  selection: ServiceSelection;
  format: BookingFormat;
  classNames: SlotClassNames<ServiceScreenSlot> | undefined;
}) {
  const { total, canContinue, labels } = selection;
  return (
    <div
      className={slotClass(
        classNames,
        'bar',
        'sticky bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md'
      )}
    >
      <LiveStatus
        text={selection.notice ?? null}
        className="px-5 text-sm font-medium text-foreground [&:not(:empty)]:pt-3"
      />
      <div className="flex h-16 items-center justify-between gap-4 px-5">
        {/* Polite and atomic: each tick is answered with the new total. The
            total runs while someone still has nothing, with what is missing
            under it. */}
        <div aria-live="polite" aria-atomic="true" className="min-w-0 text-sm tabular-nums">
          {total !== null && (
            <p className="truncate font-semibold">
              {renderLabel(labels['service.total'], {
                minutes: total.minutes,
                price: format.price(total.priceOre),
              })}
            </p>
          )}
          {!canContinue && (
            <p className="truncate text-muted-foreground">
              {renderLabel(labels['service.chooseFirst'])}
            </p>
          )}
        </div>
        <BookingButton size="lg" onClick={selection.onContinue}>
          {renderLabel(labels['service.continue'])}
        </BookingButton>
      </div>
    </div>
  );
}

/**
 * A service card on the multi-select step: a real checkbox inside its label.
 * Space (and Enter) toggles it, the label's whole box is the target, and a
 * screen reader hears «checkbox, checked».
 */
export function MultiServiceCard({
  name,
  selected,
  onPick,
  duration,
  price,
  className,
  selectedClassName,
}: {
  name: string;
  selected: boolean;
  onPick: () => void;
  duration: ReactNode;
  price: ReactNode;
  className?: string;
  selectedClassName?: string;
}) {
  return (
    <label
      className={cn(
        'flex min-h-14 w-full cursor-pointer items-center gap-4 rounded-lg border px-5 py-4 text-left transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary',
        selected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary',
        className,
        selected && selectedClassName
      )}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={selected}
        onChange={onPick}
        // Enter as well as Space: on a phone-sized list the card reads as a
        // button, and a keyboard visitor presses it like one.
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          onPick();
        }}
      />
      <span
        aria-hidden="true"
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] transition-colors',
          // The empty box needs 3:1 against the card to be seen at all.
          selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
        )}
      >
        {selected && <Check className="size-4" />}
      </span>
      <span className="flex min-w-0 flex-1 items-baseline justify-between gap-4">
        <span className="font-medium">{name}</span>
        <span className="flex items-baseline gap-4 text-right">
          <span className="text-sm text-muted-foreground tabular-nums">{duration}</span>
          {price}
        </span>
      </span>
    </label>
  );
}
