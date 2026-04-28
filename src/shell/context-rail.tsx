'use client';

/**
 * ContextRail — spec §10
 *
 * Renders a resizable, collapsible, persisted context navigation rail.
 * Width is stored per-(workspaceId, appId) via useShellLayoutState through
 * the MedaShellProvider context.
 *
 * Resize integration note (Phase 9 / Pattern B):
 * The rail uses its own pointer-events resize handle on the right edge instead
 * of wrapping in <ResizableShell> (Pattern A). Pattern A requires migrating
 * <AppShellBody> to a PanelGroup layout — that is Phase 11 territory.
 * TODO(phase-11): replace pointer-events handle with <ResizableShellPanel>
 * once <AppShellBody> ships as a ResizableShell Group.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import { useRef, useState } from 'react';
import { cn } from '../lib/utils.js';
import { useMedaShell } from './shell-provider.js';
import type { ContextModule, ShellLinkRenderArgs } from './types.js';
import { useShellViewport } from './use-shell-viewport.js';

// ---------------------------------------------------------------------------
// Constants — spec §10 dimensions
// ---------------------------------------------------------------------------

const MIN_WIDTH = 240;
const MAX_WIDTH = 420;

// ---------------------------------------------------------------------------
// ContextRailProps
// ---------------------------------------------------------------------------

export interface ContextRailProps {
  /** Drives the persistence key for layout state. */
  appId: string;
  module?: ContextModule;
  /** Starting width in px. Falls back to provider's stored width (default 300). */
  defaultWidth?: number;
  collapsible?: boolean;
  /** When true, the rail evaporates — renders an aria-hidden placeholder. */
  hidden?: boolean;
  /** Optional active item id for nav active state (preferred over useMedaShell().selection). */
  activeItemId?: string;
  renderLink?: (args: ShellLinkRenderArgs) => ReactNode;
  className?: string;
}

// ---------------------------------------------------------------------------
// ResizeHandle — right-edge drag handle (Pattern B)
// ---------------------------------------------------------------------------

interface ResizeHandleProps {
  currentWidth: number;
  onResize: (w: number) => void;
  onCommit: (w: number) => void;
}

function ResizeHandle({ currentWidth, onResize, onCommit }: ResizeHandleProps) {
  const startWidthRef = useRef(currentWidth);
  const startXRef = useRef(0);
  const draggingRef = useRef(false);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // setPointerCapture may not be available in all test environments (jsdom)
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore — drag still functions via draggingRef
    }
    startWidthRef.current = currentWidth;
    startXRef.current = e.clientX;
    draggingRef.current = true;
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const next = Math.min(
      MAX_WIDTH,
      Math.max(MIN_WIDTH, startWidthRef.current + (e.clientX - startXRef.current))
    );
    onResize(next);
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const next = Math.min(
      MAX_WIDTH,
      Math.max(MIN_WIDTH, startWidthRef.current + (e.clientX - startXRef.current))
    );
    onCommit(next);
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: <hr> can't accept pointer events; div with role="separator" is the correct pattern here
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize context rail"
      aria-valuenow={currentWidth}
      aria-valuemin={MIN_WIDTH}
      aria-valuemax={MAX_WIDTH}
      tabIndex={0}
      className={cn(
        'absolute top-0 right-0 h-full w-1 cursor-col-resize',
        'opacity-0 transition-opacity hover:opacity-100 hover:bg-ring'
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
}

// ---------------------------------------------------------------------------
// ContextRailToggle — chevron button that flips ctx.contextRail.collapsed
// ---------------------------------------------------------------------------

function ContextRailToggle() {
  const ctx = useMedaShell();
  const collapsed = ctx.contextRail.collapsed;
  const Icon = collapsed ? ChevronRight : ChevronLeft;
  return (
    <button
      type="button"
      onClick={() => ctx.contextRail.setCollapsed(!collapsed)}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-expanded={!collapsed}
      aria-controls="meda-context-rail"
      data-testid="context-rail-toggle"
      className={cn(
        'absolute top-3 -right-2.5 z-20 inline-flex h-5 w-5 items-center justify-center',
        'rounded-md border border-border bg-card text-muted-foreground shadow-sm',
        'hover:bg-accent hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      <Icon size={14} aria-hidden />
    </button>
  );
}

// ---------------------------------------------------------------------------
// ContextRail
// ---------------------------------------------------------------------------

export function ContextRail({
  appId: _appId,
  module,
  hidden = false,
  collapsible: _collapsible = true,
  activeItemId,
  renderLink,
  className,
}: ContextRailProps) {
  const band = useShellViewport();
  const ctx = useMedaShell();
  const collapsed = ctx.contextRail.collapsed;

  // Local display width tracks pointer-move updates; ctx.contextRail.setWidth
  // is called on pointerUp to persist via useShellLayoutState.
  const [displayWidth, setDisplayWidth] = useState<number | null>(null);
  const width = displayWidth ?? ctx.contextRail.width;

  if (band === 'mobile') return null;

  if (hidden) {
    return <div aria-hidden="true" className="hidden" data-testid="context-rail-hidden" />;
  }

  if (!module || module.items.length === 0) {
    return <div aria-hidden="true" className="hidden" data-testid="context-rail-empty" />;
  }

  const handleResize = (w: number) => {
    setDisplayWidth(w);
  };

  const handleCommit = (w: number) => {
    setDisplayWidth(null);
    ctx.contextRail.setWidth(w);
  };

  return (
    <aside
      id="meda-context-rail"
      data-testid="context-rail"
      aria-label={module.label}
      className={cn(
        'relative h-full shrink-0 border-r border-shell-border bg-shell-context',
        'transition-[width] duration-200 ease-in-out motion-reduce:transition-none',
        collapsed && 'w-0',
        className
      )}
      style={{ width: collapsed ? 0 : width }}
    >
      {/* Toggle: absolute, sits half on the rail's right edge. Stays visible
          even when the inner content shrinks to width 0 — when collapsed, the
          outer aside is also w-0 and the toggle anchors at the IconRail's
          right edge by virtue of -right-2.5. */}
      <ContextRailToggle />

      {/* Inner overflow wrapper so the rail content clips cleanly during the
          width animation without clipping the absolute toggle above. */}
      <div className="h-full overflow-hidden">
        {/* Header */}
        <div className="border-b border-shell-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">{module.label}</h2>
          {module.description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{module.description}</p>
          )}
        </div>

        {/* Items list — fleshed out in Phase 9.2 (Commit 3) */}
        <nav aria-label={`${module.label} navigation`} className="flex flex-col gap-0.5 p-2">
          {module.items.map((item) => {
            const isActive = item.id === activeItemId;
            const klass = cn(
              'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            );
            const IconComp = item.icon;
            const inner = (
              <>
                <IconComp size={16} aria-hidden="true" className="shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.shortcut && (
                  <kbd className="ml-auto font-mono text-[10px] text-muted-foreground">
                    {item.shortcut}
                  </kbd>
                )}
              </>
            );

            if (renderLink) {
              return renderLink({ item, isActive, className: klass, children: inner });
            }
            return (
              <a
                key={item.id}
                href={item.to}
                aria-current={isActive ? 'page' : undefined}
                className={klass}
              >
                {inner}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Right-edge resize handle — only when expanded (no rail edge to grab when collapsed) */}
      {!collapsed && (
        <ResizeHandle currentWidth={width} onResize={handleResize} onCommit={handleCommit} />
      )}
    </aside>
  );
}
