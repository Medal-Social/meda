'use client';

/**
 * ResizableShell — shadcn-style wrapper around react-resizable-panels v4.
 *
 * API surface: Group → ResizableShell, Panel → ResizableShellPanel,
 * Separator → ResizableHandle.
 *
 * Note: react-resizable-panels v4 renamed the exports:
 *   PanelGroup → Group, PanelResizeHandle → Separator
 * The v4 prop for layout direction is `orientation` (not `direction`).
 *
 * Persistence: left intentionally to consumers (ContextRail, RightPanel) because
 * they own the (workspaceId, appId) key needed to key useShellLayoutState.
 * ResizableShell is a layout primitive; don't couple it to the shell context hook.
 */

import type { ReactNode } from 'react';
import type { OnPanelResize } from 'react-resizable-panels';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { cn } from '../lib/utils.js';

// ---------------------------------------------------------------------------
// ResizableShell — wraps Group
// ---------------------------------------------------------------------------

export interface ResizableShellProps {
  /** Default: 'horizontal'. */
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  children: ReactNode;
}

export function ResizableShell({
  orientation = 'horizontal',
  className,
  children,
}: ResizableShellProps) {
  return (
    <Group orientation={orientation} className={cn('flex h-full w-full', className)}>
      {children}
    </Group>
  );
}

// ---------------------------------------------------------------------------
// ResizableShellPanel — wraps Panel
// ---------------------------------------------------------------------------

export interface ResizableShellPanelProps {
  /** Percent (0–100). */
  defaultSize?: number;
  /** Minimum size in percent. Token-aligned default: none (set by consumer). */
  minSize?: number;
  /** Maximum size in percent. Token-aligned default: none (set by consumer). */
  maxSize?: number;
  id?: string;
  collapsible?: boolean;
  collapsedSize?: number;
  /** Called on each resize. Uses the react-resizable-panels v4 signature. */
  onResize?: OnPanelResize;
  className?: string;
  children: ReactNode;
}

export function ResizableShellPanel({
  className,
  children,
  onResize,
  ...props
}: ResizableShellPanelProps) {
  return (
    <Panel className={cn('h-full', className)} onResize={onResize} {...props}>
      {children}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// ResizableHandle — wraps Separator
//
// Design spec §13: 4px wide, transparent until hover, then --ring color line
// + cursor col-resize. No drag preview; smooth update via CSS.
//
// Token note: spec says --border-emphasis but canonical token contract doesn't
// ship that token. Using --ring (brand-600 light / brand-400 dark) instead —
// matches the "primary color line on hover" intent from the Phase 10 plan.
// Swap to --border-emphasis if the contract grows that token later.
// ---------------------------------------------------------------------------

export interface ResizableHandleProps {
  className?: string;
  /** When true, renders a visible drag-indicator bar inside the handle. */
  withHandle?: boolean;
}

export function ResizableHandle({ className, withHandle = false }: ResizableHandleProps) {
  return (
    <Separator
      className={cn(
        // 4px wide, transparent until hover/active — then ring-color line
        'group relative w-1 shrink-0 cursor-col-resize transition-colors',
        'bg-transparent hover:bg-ring data-[separator]:hover:bg-ring',
        'focus-visible:bg-ring focus-visible:outline-none',
        className
      )}
    >
      {withHandle && (
        <div
          data-testid="resize-handle-indicator"
          className={cn(
            'absolute top-1/2 left-1/2 h-6 w-1 -translate-x-1/2 -translate-y-1/2',
            'rounded-sm bg-border opacity-0 transition-opacity group-hover:opacity-100'
          )}
        />
      )}
    </Separator>
  );
}
