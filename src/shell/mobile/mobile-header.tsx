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
  className,
}: MobileHeaderProps) {
  const ctx = useMedaShell();
  const band = useShellViewport();
  const isNested = !!parentLabel;

  if (band !== 'mobile') return null;

  return (
    <header
      data-meda-mobile-header={isNested ? 'nested' : 'root'}
      className={cn(
        'flex h-[var(--shell-header-height)] items-center justify-between border-b border-border bg-card px-3',
        className
      )}
    >
      {isNested ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          <span className="text-muted-foreground">{parentLabel}</span>
          {title && (
            <>
              <span className="text-muted-foreground/40" aria-hidden="true">
                ·
              </span>
              <span className="text-foreground">{title}</span>
            </>
          )}
        </button>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span aria-hidden="true">{ctx.workspace.icon}</span>
            <span>{ctx.workspace.name}</span>
          </div>
          {globalActions && <div className="flex items-center gap-1">{globalActions}</div>}
        </>
      )}
    </header>
  );
}
