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
import type { AnchorHTMLAttributes, ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import { Fragment, useId, useRef, useState } from 'react';
import { cn } from '../lib/utils.js';
import { useMedaShell } from './shell-provider.js';
import type {
  ContextModule,
  ContextRailHeader,
  ContextRailScroll,
  ShellLinkRenderArgs,
} from './types.js';
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
  header?: ContextRailHeader;
  scroll?: ContextRailScroll;
  className?: string;
}

// ---------------------------------------------------------------------------
// ContextRailSeam — the single seam handle at the rail's right boundary. It is
// both the drag-to-resize separator AND the collapse grip, so there is exactly
// ONE highlight line: dragging the seam resizes, clicking the grip collapses.
// ---------------------------------------------------------------------------

interface ContextRailSeamProps {
  railId: string;
  currentWidth: number;
  onResize: (w: number) => void;
  onCommit: (w: number) => void;
}

function ContextRailSeam({ railId, currentWidth, onResize, onCommit }: ContextRailSeamProps) {
  const ctx = useMedaShell();
  const collapsed = ctx.contextRail.collapsed;
  const Icon = collapsed ? ChevronRight : ChevronLeft;
  const startWidthRef = useRef(currentWidth);
  const startXRef = useRef(0);
  const draggingRef = useRef(false);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (collapsed) return; // no resize while collapsed
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

  // Grip reveal: invisible until the rail is hovered (expanded); faint and
  // reachable when collapsed so the rail can always be reopened.
  const reveal = collapsed
    ? 'pointer-events-auto opacity-55'
    : 'pointer-events-none opacity-0 group-hover/seam:pointer-events-auto group-hover/seam:opacity-100';

  // ONE element: a full-height col-resize separator straddling the boundary,
  // carrying the single seam line (brand + glow on hover/focus) and the grip
  // pill. Dragging the seam resizes; clicking the grip (which stops pointer
  // propagation) collapses — no separate resize handle, so only one line.
  return (
    // Outer wrapper: positioning + pointer-driven resize. It is NOT itself a
    // widget role — the `separator` role lives on the thin seam line below and
    // the collapse grip is a sibling button, so no interactive roles nest
    // (avoids axe `nested-interactive`). One `group/seam` scope still drives the
    // shared hover/focus reveal for both the line and the grip.
    <div
      data-testid="context-rail-seam"
      data-collapsed={collapsed ? 'true' : 'false'}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={cn(
        'group/seam absolute top-0 right-0 bottom-0 z-20 w-3 translate-x-1/2',
        collapsed ? 'cursor-default' : 'cursor-col-resize'
      )}
    >
      {/* single seam line — carries the resize separator semantics; brand + glow
          on rail hover or grip focus, faint when collapsed */}
      {/* biome-ignore lint/a11y/useSemanticElements: <hr> can't carry the live resize value semantics; a span with role="separator" is the correct pattern */}
      {/* biome-ignore lint/a11y/useFocusableInteractive: the separator exposes the resize value to AT but is operated via pointer; the focusable keyboard control is the sibling grip <button> (keeping the separator out of the tab order avoids an axe nested-interactive violation) */}
      <span
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize context rail"
        aria-valuenow={currentWidth}
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={MAX_WIDTH}
        className={cn(
          'pointer-events-none absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 transition-[background-color,box-shadow] duration-150',
          collapsed ? 'bg-shell-border' : 'bg-transparent',
          'group-hover/seam:bg-[var(--color-brand-400)] group-hover/seam:shadow-[0_0_14px_-1px_var(--color-brand-400)]',
          'group-focus-visible/seam:bg-[var(--color-brand-400)] group-focus-visible/seam:shadow-[0_0_14px_-1px_var(--color-brand-400)]'
        )}
      />
      {/* grip pill — collapse/expand; stops propagation so grabbing it never starts a resize drag */}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => ctx.contextRail.setCollapsed(!collapsed)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
        aria-controls={railId}
        data-testid="context-rail-toggle"
        className={cn(
          'absolute top-1/2 left-1/2 grid h-12 w-[21px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-card text-[var(--color-brand-400)]',
          'border-[color-mix(in_oklab,var(--color-brand-400)_26%,transparent)]',
          'transition-[opacity,transform,box-shadow,border-color] duration-150',
          collapsed ? 'scale-90' : 'scale-[.82]',
          reveal,
          'group-hover/seam:scale-100 group-hover/seam:border-[var(--color-brand-400)] group-hover/seam:opacity-100 group-hover/seam:shadow-[0_6px_18px_-4px_color-mix(in_oklab,var(--color-brand-400)_65%,transparent)]',
          'focus-visible:scale-100 focus-visible:border-[var(--color-brand-400)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-brand-400)_35%,transparent)]'
        )}
      >
        <Icon size={14} aria-hidden />
      </button>
    </div>
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
  header = 'auto',
  scroll = 'auto',
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
  const hasRender = typeof module?.render === 'function';
  const showHeader = header === 'visible' || (header === 'auto' && items.length > 0 && !hasRender);

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
        'group/rail relative h-full shrink-0 bg-shell-context',
        !isDragging && 'transition-[width] duration-200 ease-in-out motion-reduce:transition-none',
        collapsed && 'w-0',
        className
      )}
      style={{ width: collapsed ? 0 : width }}
    >
      {/* Unified seam at the right boundary: drag-to-resize AND collapse grip,
          so there is exactly one highlight line. The seam line + grip reveal on
          rail hover (group/seam). Skipped when collapsible={false} so consumers
          opting out of the collapse behavior get a fixed rail. */}
      {collapsible && (
        <ContextRailSeam
          railId={railId}
          currentWidth={width}
          onResize={handleResize}
          onCommit={handleCommit}
        />
      )}

      {/* Inner overflow wrapper so the rail content clips cleanly during the
          width animation without clipping the absolute toggle above.
          aria-hidden + inert when collapsed so AT and keyboard users don't
          land in zero-width content. */}
      <div
        className="flex h-full min-w-0 flex-col overflow-hidden"
        aria-hidden={collapsed}
        inert={collapsed || undefined}
      >
        {showHeader && (
          <div className="shrink-0 border-b border-shell-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">{module.label}</h2>
            {module.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{module.description}</p>
            )}
          </div>
        )}

        <div
          data-meda-context-rail-scroll-area=""
          className={cn(
            'min-h-0 flex-1',
            scroll === 'auto' ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'
          )}
        >
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

                const linkProps = {
                  href: item.to,
                  'aria-current': isActive ? 'page' : undefined,
                  className: klass,
                  children: inner,
                } satisfies AnchorHTMLAttributes<HTMLAnchorElement>;

                if (renderLink) {
                  return (
                    <Fragment key={item.id}>
                      {renderLink({
                        item,
                        isActive,
                        className: klass,
                        children: inner,
                        linkProps,
                      })}
                    </Fragment>
                  );
                }
                return <a key={item.id} {...linkProps} />;
              })}
            </nav>
          )}
          {module.render?.({ workspaceId: ctx.workspace.id, appId })}
        </div>
      </div>
    </aside>
  );
}
