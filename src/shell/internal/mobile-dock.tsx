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
  /**
   * The active APP's id. When set, a slot is active iff `item.id === activeId`
   * — so the dock stays lit everywhere inside that app, not only on the exact
   * address in `activeTo`. Omit to keep the `to === activeTo` comparison.
   */
  activeId?: string;
  renderLink?: (args: MobileNavLinkArgs) => ReactNode;
  className?: string;
  /** `pill` (default) floating dock, or `bar` full-width labeled bottom bar. */
  variant?: 'pill' | 'bar';
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
 * Mobile dock — pinned destinations plus a workspace-sheet trigger. Two shapes:
 *
 * - `pill` (default): a floating, centered pill of icon-only slots, with any
 *   `emphasis: 'brand'` item (e.g. Pilot) as a standalone circle beside it.
 * - `bar`: a flat, full-width bottom bar of evenly-spread slots — each a larger
 *   icon + label with a tinted active state — mirroring the native app. The
 *   brand item sits inline as the last slot (a filled circle).
 *
 * Hidden on non-mobile viewports and when the right panel is fullscreen.
 */
export function MobileDock({
  items,
  activeTo,
  activeId,
  renderLink,
  className,
  variant = 'pill',
}: MobileDockProps) {
  const ctx = useMedaShell();
  const band = useShellViewport();

  if (band !== 'mobile') return null;
  if (ctx.panel.mode === 'fullscreen') return null;
  if (items.length === 0) return null;

  // `activeId` wins when supplied; otherwise fall back to the exact-address
  // comparison the dock has always used.
  const isItemActive = (item: MobileDockItem): boolean =>
    activeId != null ? item.id === activeId : Boolean(item.to && activeTo && item.to === activeTo);

  const runAction = (item: MobileDockItem) => {
    if (item.action === 'open-sheet') ctx.mobileDrawer.setOpen(WORKSPACE_SHEET_KEY);
    else if (item.action === 'open-ai') ctx.mobileDrawer.setOpen('ai-drawer');
    else if (item.action === 'open-command-palette') ctx.commandPalette.setOpen(true);
  };

  // ── Full-width bar (native-app style) ──────────────────────────────────
  if (variant === 'bar') {
    const renderBarSlot = (item: MobileDockItem): ReactNode => {
      const label = typeof item.label === 'function' ? item.label() : item.label;
      const isActive = isItemActive(item);
      const isBrand = item.emphasis === 'brand';
      const iconEl = isBrand ? (
        <span className="flex size-8 items-center justify-center rounded-full bg-[var(--color-brand-600)] text-white">
          {renderIcon(item.icon, 20)}
        </span>
      ) : (
        renderIcon(item.icon, 25)
      );
      let toneClass = 'text-muted-foreground hover:text-foreground';
      if (isBrand) toneClass = 'text-muted-foreground';
      else if (isActive) toneClass = 'font-medium text-primary';
      const slotClass = cn(
        'flex w-full flex-col items-center justify-center gap-1 py-2 text-[11px] leading-none transition-colors',
        toneClass
      );
      const children = (
        <>
          <span className="relative flex items-center justify-center">
            {iconEl}
            {item.badge ? (
              <span className="absolute -top-0.5 -right-1 size-2 rounded-full bg-primary ring-2 ring-card" />
            ) : null}
          </span>
          <span>{label}</span>
        </>
      );

      if (item.to && !item.action) {
        if (renderLink) {
          return renderLink({
            to: item.to,
            isActive,
            className: slotClass,
            children,
            onNavigate: () => undefined,
            linkProps: {
              href: item.to,
              className: slotClass,
              'aria-label': label,
              'aria-current': isActive ? 'page' : undefined,
            },
          });
        }
        return (
          <a
            href={item.to}
            className={slotClass}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            {children}
          </a>
        );
      }
      return (
        <button
          type="button"
          onClick={() => runAction(item)}
          aria-label={label}
          className={slotClass}
        >
          {children}
        </button>
      );
    };

    return (
      <nav
        data-testid="mobile-dock"
        aria-label="Dock"
        className={cn(
          'absolute inset-x-0 bottom-0 z-30 flex items-stretch border-t border-border bg-card pb-[env(safe-area-inset-bottom)]',
          className
        )}
      >
        {items.map((item) => (
          <div key={item.id} className="flex flex-1">
            {renderBarSlot(item)}
          </div>
        ))}
      </nav>
    );
  }

  // ── Floating pill (default) ────────────────────────────────────────────
  const pillItems = items.filter((item) => item.emphasis !== 'brand');
  const brandItems = items.filter((item) => item.emphasis === 'brand');

  const renderSlot = (item: MobileDockItem, size: number) => {
    const label = typeof item.label === 'function' ? item.label() : item.label;
    const isActive = isItemActive(item);
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

    // Action slot. Before `activeId` these never carried an active state, so
    // the `activeTo` fallback deliberately does NOT light them — only an
    // explicit `activeId` match does.
    const actionActive = activeId != null && item.id === activeId;
    return (
      <button
        type="button"
        onClick={() => runAction(item)}
        aria-label={label}
        className={cn(
          'relative flex items-center justify-center rounded-full p-1 transition-colors',
          actionActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        )}
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
          className="pointer-events-auto flex size-11 items-center justify-center rounded-full bg-[var(--color-brand-600)] text-white shadow-[0_6px_20px_rgba(91,45,140,0.35)]"
        >
          {renderSlot(item, 22)}
        </span>
      ))}
    </div>
  );
}
