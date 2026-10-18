import type { CSSProperties, ReactNode } from 'react';

/**
 * Chromatic captures every booking story in light and dark, on a phone and on
 * a desktop. Dark comes from the toolbar theme global, never from a story
 * named «Dark…» (see scripts/check-stories.mjs).
 */
export const bookingStoryParameters = {
  layout: 'padded',
  chromatic: {
    modes: {
      'light mobile': { theme: 'light', viewport: 390 },
      'dark mobile': { theme: 'dark', viewport: 390 },
      'light desktop': { theme: 'light', viewport: 1280 },
    },
  },
} as const;

/**
 * A second brand, set only through the shadcn variables the bridge maps —
 * the proof that a customer re-themes the screens without touching meda.
 */
const SECOND_BRAND: CSSProperties = {
  ['--primary' as string]: 'oklch(0.52 0.14 160)',
  ['--primary-foreground' as string]: 'oklch(0.98 0.01 160)',
  ['--ring' as string]: 'oklch(0.52 0.14 160)',
  ['--secondary' as string]: 'oklch(0.9 0.05 80)',
  ['--secondary-foreground' as string]: 'oklch(0.3 0.05 80)',
  ['--accent' as string]: 'oklch(0.94 0.03 160)',
  ['--accent-foreground' as string]: 'oklch(0.3 0.06 160)',
  ['--border' as string]: 'oklch(0.86 0.02 160)',
  ['--input' as string]: 'oklch(0.8 0.02 160)',
  ['--radius' as string]: '1rem',
};

export function SecondBrand({ children }: { children: ReactNode }) {
  return (
    <div data-brand="second" style={SECOND_BRAND} className="bg-background p-4 text-foreground">
      {children}
    </div>
  );
}

/** A phone-width column, as the booking flow is laid out on a customer site. */
export function BookingColumn({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-xl bg-background text-foreground">{children}</div>;
}
