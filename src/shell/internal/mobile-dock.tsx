'use client';

import { createElement, isValidElement, type ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import { useMedaShell } from '../shell-provider.js';
import type { MobileDockItem, MobileNavLinkArgs } from '../types.js';
import { useShellViewport } from '../use-shell-viewport.js';

/** The key the workspace sheet listens on (reuses the single mobile-drawer state). */
export const WORKSPACE_SHEET_KEY = 'workspace-sheet';

export interface MobileDockProps {
  items: MobileDockItem[];
  activeTo?: string;
  renderLink?: (args: MobileNavLinkArgs) => ReactNode;
  className?: string;
}

function renderIcon(icon: MobileDockItem['icon'], size: number): ReactNode {
  if (icon == null) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'function' || typeof icon === 'object') {
    // Lucide component (function) or forwardRef/memo object.
    return createElement(icon as never, { size, 'aria-hidden': true });
  }
  return null;
}

/**
 * Floating mobile dock — a pill of pinned destinations plus a workspace-sheet
 * trigger, with any `emphasis: 'brand'` item rendered as a standalone circle
 * (e.g. Pilot) beside the pill. Replaces the bordered bottom bar. Hidden on
 * non-mobile viewports and when the right panel is fullscreen.
 */
export function MobileDock({ items, activeTo, renderLink, className }: MobileDockProps) {
  const ctx = useMedaShell();
  const band = useShellViewport();

  if (band !== 'mobile') return null;
  if (ctx.panel.mode === 'fullscreen') return null;
  if (items.length === 0) return null;

  const pillItems = items.filter((item) => item.emphasis !== 'brand');
  const brandItems = items.filter((item) => item.emphasis === 'brand');

  const runAction = (item: MobileDockItem) => {
    if (item.action === 'open-sheet') ctx.mobileDrawer.setOpen(WORKSPACE_SHEET_KEY);
    else if (item.action === 'open-ai') ctx.mobileDrawer.setOpen('ai-drawer');
    else if (item.action === 'open-command-palette') ctx.commandPalette.setOpen(true);
  };

  const renderSlot = (item: MobileDockItem, size: number) => {
    const label = typeof item.label === 'function' ? item.label() : item.label;
    const isActive = Boolean(item.to && activeTo && item.to === activeTo);
    const icon = renderIcon(item.icon, size);
    const badge = item.badge ? (
      <span className="absolute top-0 right-0 size-2 rounded-full bg-primary ring-2 ring-card" />
    ) : null;

    // Route link
    if (item.to && !item.action) {
      const className = cn(
        'relative flex items-center justify-center rounded-full p-1 transition-colors',
        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
      );
      const children = (
        <>
          {icon}
          {badge}
        </>
      );
      if (renderLink) {
        return renderLink({
          to: item.to,
          isActive,
          className,
          children,
          onNavigate: () => undefined,
          linkProps: {
            href: item.to,
            className,
            'aria-label': label,
            'aria-current': isActive ? 'page' : undefined,
          },
        });
      }
      return (
        <a
          href={item.to}
          className={className}
          aria-label={label}
          aria-current={isActive ? 'page' : undefined}
        >
          {children}
        </a>
      );
    }

    // Action slot
    return (
      <button
        type="button"
        onClick={() => runAction(item)}
        aria-label={label}
        className="relative flex items-center justify-center rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        {icon}
        {badge}
      </button>
    );
  };

  return (
    <div
      data-testid="mobile-dock"
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-center justify-center gap-2.5 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2',
        className
      )}
    >
      <nav
        aria-label="Dock"
        className="pointer-events-auto flex items-center gap-[18px] rounded-full border border-border bg-card px-4 py-2.5 shadow-[0_6px_20px_rgba(20,18,60,0.14)]"
      >
        {pillItems.map((item) => (
          <span key={item.id} className="flex">
            {renderSlot(item, 22)}
          </span>
        ))}
      </nav>
      {brandItems.map((item) => (
        <span
          key={item.id}
          className="pointer-events-auto flex size-11 items-center justify-center rounded-full bg-[#5B2D8C] text-white shadow-[0_6px_20px_rgba(91,45,140,0.35)]"
        >
          {renderSlot(item, 22)}
        </span>
      ))}
    </div>
  );
}
