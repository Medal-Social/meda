import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import type { ReactNode } from 'react';

export function ShellHeaderFrame({
  left,
  center,
  right,
  className,
}: {
  left: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={[
        'relative z-[var(--z-sticky)] grid h-[var(--header-height)] w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 bg-[var(--header)] px-3 shadow-[var(--shadow-header)] sm:px-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {left}
      <div className="min-w-0">{center}</div>
      <div
        data-testid="shell-header-actions"
        className="hidden items-center justify-end gap-2 md:flex"
      >
        {right}
      </div>
    </header>
  );
}

export function ShellPanelToggle({
  panelOpen,
  onToggle,
}: {
  panelOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={panelOpen ? 'Close panel' : 'Open panel'}
      onClick={onToggle}
      className={
        panelOpen
          ? 'inline-flex h-9 items-center justify-center rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/12 px-2.5 text-[var(--primary)] transition-[background-color,color,border-color] duration-200 hover:bg-[var(--primary)]/18'
          : 'inline-flex h-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] px-2.5 text-[var(--muted-foreground)] transition-[background-color,color,border-color] duration-200 hover:bg-[var(--sidebar-accent)] hover:text-[var(--foreground)]'
      }
    >
      {panelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
    </button>
  );
}
