'use client';

import { cn } from '../../lib/utils.js';
import { useMedaShell } from '../shell-provider.js';
import type { MobileBottomNavItem } from '../types.js';
import { useShellViewport } from '../use-shell-viewport.js';

export interface MobileBottomNavProps {
  className?: string;
}

/**
 * Mobile-only bottom navigation bar.
 *
 * Renders 4 buttons sourced from `ctx.mobileBottomNav` (provider-controlled,
 * overrideable per-app via `mobileBottomNav` prop). Each button click opens
 * the corresponding drawer via `ctx.mobileDrawer.setOpen`.
 *
 * Hidden on non-mobile viewports and when the right panel is in fullscreen mode.
 */
export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const ctx = useMedaShell();
  const band = useShellViewport();

  if (band !== 'mobile') return null;
  if (ctx.panel.mode === 'fullscreen') return null;

  return (
    <nav
      aria-label="Mobile navigation"
      className={cn(
        'flex h-[var(--shell-bottom-nav-height)] items-center justify-around border-t border-border bg-card',
        className
      )}
    >
      {ctx.mobileBottomNav.map((item) => (
        <MobileBottomNavButton key={item.id} item={item} />
      ))}
    </nav>
  );
}

function MobileBottomNavButton({ item }: { item: MobileBottomNavItem }) {
  const ctx = useMedaShell();
  const Icon = item.icon;
  const label = typeof item.label === 'function' ? item.label() : item.label;

  const handleClick = () => {
    if (typeof item.opens === 'string') {
      ctx.mobileDrawer.setOpen(item.opens);
    } else {
      // Custom render fn — open a custom drawer keyed by the item's id
      ctx.mobileDrawer.setOpen(item.id);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className="flex h-full flex-1 flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground"
    >
      <Icon size={20} aria-hidden="true" />
      <span className="text-[10px]">{label}</span>
    </button>
  );
}
