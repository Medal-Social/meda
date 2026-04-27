'use client';

/**
 * RightPanel — spec §12
 *
 * Four-mode right panel: closed (0px), panel (resizable 300–520px),
 * expanded (~60vw), fullscreen (100vw/100vh takeover).
 *
 * Mode state lives in MedaShellProvider (panel.mode / panel.setMode).
 * Width is persisted per-(workspaceId, appId) via panel.width / panel.setWidth.
 *
 * Resize note (Pattern B):
 * Uses its own pointer-event resize handle on the LEFT edge instead of
 * wrapping in <ResizableShell>. Pattern A requires migrating <AppShellBody>
 * to a PanelGroup layout.
 * TODO(phase-15-refactor): swap to ResizableShell once AppShellBody is a PanelGroup
 */

import { Maximize2, Minimize2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils.js';
import { useMedaShell } from './shell-provider.js';
import type { PanelMode, PanelView, ShellRenderContext } from './types.js';
import { useShellViewport } from './use-shell-viewport.js';

// ---------------------------------------------------------------------------
// Constants — spec §12 dimensions
// ---------------------------------------------------------------------------

const MIN_WIDTH = 300;
const MAX_WIDTH = 520;

// ---------------------------------------------------------------------------
// RightPanelProps
// ---------------------------------------------------------------------------

export interface RightPanelProps {
  /** Views to render as tabs in the panel header. */
  panelViews?: PanelView[];
  /** Default active view id — set on mount when no activeView is set in context. */
  defaultView?: string;
  /**
   * Which open-modes this consumer allows.
   * Default is all three: ['panel', 'expanded', 'fullscreen'].
   * If only ['panel'], the cycle button is hidden.
   */
  modes?: PanelMode[];
  className?: string;
}

// ---------------------------------------------------------------------------
// ResizeHandle — left-edge drag handle (Pattern B)
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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore — drag still functions via draggingRef
    }
    startWidthRef.current = currentWidth;
    startXRef.current = e.clientX;
    draggingRef.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    // Left edge: drag left (clientX decreasing) widens panel
    const delta = startXRef.current - e.clientX;
    const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta));
    onResize(next);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const delta = startXRef.current - e.clientX;
    const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta));
    onCommit(next);
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: <hr> can't accept pointer events; div with role="separator" is the correct pattern here
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panel"
      aria-valuenow={currentWidth}
      aria-valuemin={MIN_WIDTH}
      aria-valuemax={MAX_WIDTH}
      tabIndex={0}
      className={cn(
        'absolute top-0 left-0 h-full w-1 cursor-col-resize',
        'opacity-0 transition-opacity hover:opacity-100 hover:bg-ring'
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
}

// ---------------------------------------------------------------------------
// RightPanel
// ---------------------------------------------------------------------------

export function RightPanel({
  panelViews = [],
  defaultView,
  modes = ['panel', 'expanded', 'fullscreen'],
  className,
}: RightPanelProps) {
  const band = useShellViewport();
  const ctx = useMedaShell();
  const { mode, activeView, width, setMode, setActiveView, setWidth } = ctx.panel;

  // Hydrate defaultView on mount if no active view set
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional one-time mount effect
  useEffect(() => {
    if (!activeView && defaultView) {
      setActiveView(defaultView);
    }
  }, []);

  // Local display width tracks pointer-move updates live;
  // setWidth (persist) is called on pointerUp.
  const [displayWidth, setDisplayWidth] = useState<number | null>(null);
  const resolvedWidth = displayWidth ?? width;

  // On mobile, the right panel renders as a drawer via <MobileDrawers > PanelsDrawer />.
  // The desktop-shaped <RightPanel> hides; consumers must mount <MobileDrawers> to expose
  // panel views on mobile.
  if (band === 'mobile') return null;

  const renderCtx: ShellRenderContext = {
    workspaceId: ctx.workspace.id,
    appId: ctx.activeAppId,
  };

  // Cycle through allowed open modes only (skip 'closed')
  const cycleOpenMode = () => {
    if (mode === 'closed') return;
    const openModes = modes.filter((m) => m !== 'closed');
    const idx = openModes.indexOf(mode as Exclude<PanelMode, 'closed'>);
    const next = openModes[(idx + 1) % openModes.length] ?? mode;
    setMode(next);
  };

  // Mode → inline width style
  const widthStyle: React.CSSProperties = (() => {
    switch (mode) {
      case 'closed':
        return { width: 0, pointerEvents: 'none' };
      case 'panel':
        return { width: `${resolvedWidth}px` };
      case 'expanded':
        return { width: '60vw' };
      case 'fullscreen':
        return { width: '100vw' };
    }
  })();

  // Z-index escalation: fullscreen covers header + rails
  const zIndexClass =
    mode === 'fullscreen' ? 'z-[var(--z-shell-fullscreen)]' : 'z-[var(--z-shell-panel)]';

  const activePanelView = panelViews.find((v) => v.id === activeView);

  const cycleAriaLabel =
    mode === 'panel' ? 'Expand panel' : mode === 'expanded' ? 'Maximize panel' : 'Restore panel';

  const handleResize = (w: number) => setDisplayWidth(w);
  const handleCommit = (w: number) => {
    setDisplayWidth(null);
    setWidth(w);
  };

  return (
    <aside
      data-meda-panel-mode={mode}
      aria-hidden={mode === 'closed' ? 'true' : undefined}
      className={cn(
        'relative h-full shrink-0 overflow-hidden border-l border-shell-border bg-shell-panel',
        'transition-[width] ease-[var(--motion-ease)] duration-[var(--motion-panel)]',
        mode === 'fullscreen' && 'fixed inset-0 h-screen w-screen border-none',
        zIndexClass,
        className
      )}
      style={widthStyle}
    >
      {mode !== 'closed' && (
        <div className="flex h-full flex-col">
          {/* Panel header: view tabs + mode cycle + close */}
          <div className="flex items-center justify-between border-b border-shell-border px-3 py-2">
            {/* View tabs */}
            <div className="flex items-center gap-1">
              {panelViews.map((view) => {
                const isActive = view.id === activeView;
                const Icon = view.icon;
                return (
                  <button
                    key={view.id}
                    type="button"
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => setActiveView(view.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Icon size={14} aria-hidden="true" />
                    <span>{view.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mode controls */}
            <div className="flex items-center gap-1">
              {modes.length > 1 && (
                <button
                  type="button"
                  aria-label={cycleAriaLabel}
                  onClick={cycleOpenMode}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {mode === 'fullscreen' ? (
                    <Minimize2 size={14} aria-hidden="true" />
                  ) : (
                    <Maximize2 size={14} aria-hidden="true" />
                  )}
                </button>
              )}
              <button
                type="button"
                aria-label="Close panel"
                onClick={() => setMode('closed')}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-y-auto">
            {activePanelView != null ? (
              activePanelView.render(renderCtx)
            ) : (
              <div className="p-4 text-muted-foreground text-sm">No panel view selected</div>
            )}
          </div>

          {/* Left-edge resize handle — panel mode only */}
          {mode === 'panel' && (
            <ResizeHandle
              currentWidth={resolvedWidth}
              onResize={handleResize}
              onCommit={handleCommit}
            />
          )}
        </div>
      )}
    </aside>
  );
}
