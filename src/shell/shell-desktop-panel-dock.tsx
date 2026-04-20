import * as React from 'react';

function ShellPanelResizeHandle({
  width,
  onWidthChange,
}: {
  width: number;
  onWidthChange: (width: number) => void;
}) {
  const startXRef = React.useRef(0);
  const startWidthRef = React.useRef(width);
  const cleanupRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;

    startXRef.current = event.clientX;
    startWidthRef.current = width;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      onWidthChange(startWidthRef.current + (startXRef.current - moveEvent.clientX));
    };

    const handlePointerEnd = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
      cleanupRef.current = null;
    };

    cleanupRef.current?.();
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);
    cleanupRef.current = handlePointerEnd;
  }

  return (
    <button
      type="button"
      aria-label="Resize panel"
      onPointerDown={handlePointerDown}
      className="absolute inset-y-0 left-0 z-10 flex w-2 shrink-0 cursor-col-resize items-center justify-center bg-transparent transition-colors hover:bg-[var(--primary)]/10"
    >
      <span className="h-12 w-px rounded-full bg-[var(--border-subtle)]" />
    </button>
  );
}

export function ShellDesktopPanelDock({
  defaultView,
  panelOpen,
  viewIds,
  width,
  onWidthChange,
  renderPanel,
  className,
}: {
  defaultView: string;
  panelOpen: boolean;
  viewIds?: string[];
  width: number;
  onWidthChange: (width: number) => void;
  renderPanel: (options: { defaultView: string; viewIds?: string[]; className?: string }) => React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-testid="desktop-panel-dock"
      aria-hidden={!panelOpen}
      data-state={panelOpen ? 'open' : 'closed'}
      className={
        panelOpen
          ? 'pointer-events-auto absolute inset-y-4 right-4 z-20 translate-x-0 opacity-100 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'
          : 'pointer-events-none absolute inset-y-4 right-4 z-20 translate-x-[calc(100%+1.25rem)] opacity-0 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'
      }
      style={{ width: `${width}px` }}
    >
      <div className="relative h-full w-full">
        <ShellPanelResizeHandle width={width} onWidthChange={onWidthChange} />
        {renderPanel({
          defaultView,
          viewIds,
          className:
            className ??
            'ml-2 rounded-[var(--meda-shell-panel-dock-radius)] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--side-panel)_90%,transparent)] shadow-[var(--meda-shell-panel-dock-shadow)] backdrop-blur-xl',
        })}
      </div>
    </div>
  );
}
