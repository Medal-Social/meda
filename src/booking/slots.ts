import type { ComponentType } from 'react';
import { cn } from '../lib/utils.js';

/**
 * Per-slot class overrides a screen accepts: `classNames={{ card: '…' }}`.
 * Merged AFTER the screen's own classes with tailwind-merge, so an override
 * wins over a conflicting default utility.
 */
export type SlotClassNames<Slot extends string> = Partial<Record<Slot, string>>;

/** `cn(base, classNames?.[slot])` — the one way a screen applies a slot override. */
export function slotClass<Slot extends string>(
  classNames: SlotClassNames<Slot> | undefined,
  slot: Slot,
  ...base: Parameters<typeof cn>
): string {
  return cn(...base, classNames?.[slot]);
}

/** Card-level renderer overrides: `components={{ ServiceCard: MyCard }}`. */
export type ScreenComponents<Map extends Record<string, ComponentType<never>>> = Partial<Map>;
