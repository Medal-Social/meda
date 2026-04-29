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

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import { useId, useRef, useState } from 'react';
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

function ContextRailToggle({ railId }: { railId: string }) {
  const ctx = useMedaShell();
  const collapsed = ctx.contextRail.collapsed;
  // Lucide PanelLeft* icons render the chevron-with-wall pattern (similar
  // to Unifi). The wall reinforces "this is a sidebar toggle" rather than
  // a generic navigation chevron.
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;
  return (
    <button
      type="button"
      onClick={() => ctx.contextRail.setCollapsed(!collapsed)}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-expanded={!collapsed}
      aria-controls={railId}
      data-testid="context-rail-toggle"
      className={cn(
        // Pull-tab: 28w × 40h. Big enough to read the icon at a glance and to
        // grab confidently — matches Unifi's reference. Flat left edge
        // attached to the rail (no left border), rounded right. The whole tab
        // sticks fully out of the rail's outer edge.
        'absolute top-3 -right-7 z-20 inline-flex h-10 w-7 items-center justify-center',
        'before:absolute before:-inset-1 before:content-[""]',
        'rounded-r-md border border-l-0 border-border bg-card text-muted-foreground',
        'shadow-[2px_0_4px_rgb(0_0_0_/_0.08)]',
        'hover:bg-accent hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      <Icon size={18} aria-hidden />
    </button>
  );
}

// ---------------------------------------------------------------------------
// ContextRail
// ---------------------------------------------------------------------------

export function ContextRail({
  appId,
  module,
  hidden = false,
  collapsible = true,
  activeItemId,
  renderLink,
  className,
}: ContextRailProps) {
  const band = useShellViewport();
  const ctx = useMedaShell();
  // collapsible={false} means the rail must always render expanded — even if
  // the persisted layout state has collapsed: true (e.g. user collapsed the
  // rail before the prop flipped). Without this guard, the rail would stay
  // hidden forever with no in-component way to recover.
  const collapsed = collapsible ? ctx.contextRail.collapsed : false;
  // Per-instance id so multiple <ContextRail>s in one document don't clash on
  // duplicate `id="..."` (HTML invalid + breaks aria-controls relationships).
  const reactId = useId();
  const railId = `meda-context-rail-${reactId}`;

  // Local display width tracks pointer-move updates; ctx.contextRail.setWidth
  // is called on pointerUp to persist via useShellLayoutState.
  const [displayWidth, setDisplayWidth] = useState<number | null>(null);
  const width = displayWidth ?? ctx.contextRail.width;
  const items = module?.items ?? [];

  if (band === 'mobile') return null;

  if (hidden) {
    return <div aria-hidden="true" className="hidden" data-testid="context-rail-hidden" />;
  }

  if (!module || (items.length === 0 && !module.render)) {
    return <div aria-hidden="true" className="hidden" data-testid="context-rail-empty" />;
  }

  const handleResize = (w: number) => {
    setDisplayWidth(w);
  };

  const handleCommit = (w: number) => {
    setDisplayWidth(null);
    ctx.contextRail.setWidth(w);
  };

  // Only animate width during collapse/expand toggles, not during manual
  // pointer drag on the ResizeHandle. displayWidth is non-null only while
  // the user is mid-drag — using it as the drag signal suppresses the
  // transition then so the rail snaps to the cursor instead of lagging
  // behind it.
  const isDragging = displayWidth !== null;
  return (
    <aside
      id={railId}
      data-testid="context-rail"
      aria-label={module.label}
      className={cn(
        'relative h-full shrink-0 border-r border-shell-border bg-shell-context',
        !isDragging && 'transition-[width] duration-200 ease-in-out motion-reduce:transition-none',
        collapsed && 'w-0',
        className
      )}
      style={{ width: collapsed ? 0 : width }}
    >
      {/* Toggle: absolute, sits half on the rail's right edge. Stays visible
          even when the inner content shrinks to width 0 — when collapsed, the
          outer aside is also w-0 and the toggle anchors at the IconRail's
          right edge by virtue of -right-2.5. Skipped when collapsible={false}
          so consumers opting out of the collapse behavior get a fixed rail. */}
      {collapsible && <ContextRailToggle railId={railId} />}

      {/* Inner overflow wrapper so the rail content clips cleanly during the
          width animation without clipping the absolute toggle above.
          aria-hidden + inert when collapsed so AT and keyboard users don't
          land in zero-width content. */}
      <div
        className="h-full overflow-hidden"
        aria-hidden={collapsed}
        inert={collapsed || undefined}
      >
        {/* Header */}
        <div className="border-b border-shell-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">{module.label}</h2>
          {module.description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{module.description}</p>
          )}
        </div>

        {items.length > 0 && (
          <nav aria-label={`${module.label} navigation`} className="flex flex-col gap-0.5 p-2">
            {items.map((item) => {
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
        )}
        {module.render?.({ workspaceId: ctx.workspace.id, appId })}
      </div>

      {/* Right-edge resize handle — only when expanded (no rail edge to grab when collapsed) */}
      {!collapsed && (
        <ResizeHandle currentWidth={width} onResize={handleResize} onCommit={handleCommit} />
      )}
    </aside>
  );
}
