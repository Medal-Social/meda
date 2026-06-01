'use client';

import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import { useMedaShell } from '../shell-provider.js';
import { useShellViewport } from '../use-shell-viewport.js';

export interface MobileHeaderProps {
  /** When set, renders back button + parentLabel · title (nested mode). */
  parentLabel?: string;
  /** Optional — for routing-system link rendering. */
  parentTo?: string;
  /** Page title shown in nested mode. */
  title?: string;
  /** Back button handler (nested mode). */
  onBack?: () => void;
  /** Root mode only — renders to the right of workspace name. */
  globalActions?: ReactNode;
  /** Root mode only — rendered centered in the header (e.g. clock). */
  headerCenter?: ReactNode;
  className?: string;
}

/**
 * Mobile-only header.
 *
 * Root mode: workspace name + optional globalActions.
 * Nested mode (when parentLabel is set): ← parentLabel · pageTitle back button.
 *
 * Renders nothing on non-mobile viewports.
 */
export function MobileHeader({
  parentLabel,
  parentTo: _parentTo,
  title,
  onBack,
  globalActions,
  headerCenter,
  className,
}: MobileHeaderProps) {
  const ctx = useMedaShell();
  const band = useShellViewport();
  const isNested = !!parentLabel;

  if (band !== 'mobile') return null;

  return (
    <header
      data-testid="mobile-header"
      data-meda-mobile-header={isNested ? 'nested' : 'root'}
      className={cn(
        'relative flex h-[var(--shell-mobile-header-height)] items-center justify-between bg-background px-3',
        className
      )}
    >
      {isNested ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex min-h-9 max-w-full items-center gap-1.5 rounded-lg px-2 text-sm font-medium hover:bg-accent"
        >
          <ChevronLeft size={18} aria-hidden="true" />
          <span className="truncate text-muted-foreground">{parentLabel}</span>
          {title && (
            <>
              <span className="text-muted-foreground/40" aria-hidden="true">
                ·
              </span>
              <span className="truncate text-foreground">{title}</span>
            </>
          )}
        </button>
      ) : (
        <>
          {/* Workspace identity opens the menu drawer (same surface as the
              bottom-nav Menu button) — no separate hamburger needed. */}
          <button
            type="button"
            onClick={() => ctx.mobileDrawer.setOpen('menu-drawer')}
            aria-label="Open workspace menu"
            aria-haspopup="menu"
            className="-mx-1 flex min-w-0 items-center gap-2.5 rounded-lg px-1 py-1 text-sm font-semibold text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              className="inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-foreground ring-1 ring-border/70"
              aria-hidden="true"
            >
              {ctx.workspace.icon}
            </span>
            <span className="truncate text-[15px] leading-5">{ctx.workspace.name}</span>
          </button>
          {headerCenter && (
            <div className="-translate-x-1/2 pointer-events-none absolute left-1/2 flex max-w-[55%] items-center justify-center">
              <div className="pointer-events-auto flex min-w-0 items-center">{headerCenter}</div>
            </div>
          )}
          {globalActions && (
            <div className="flex shrink-0 items-center gap-1.5">{globalActions}</div>
          )}
        </>
      )}
    </header>
  );
}
