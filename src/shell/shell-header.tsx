'use client';

import { ChevronDown, PanelRightClose, PanelRightOpen } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils.js';
import { useMedaShell } from './shell-provider.js';

// ---------------------------------------------------------------------------
// Legacy components — preserved for back-compat
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Task 7.3 stub — WorkspaceSwitcher (stub; full implementation in next commit)
// ---------------------------------------------------------------------------

export interface WorkspaceSwitcherProps {
  workspaceMenuFooter?: ReactNode;
}

export function WorkspaceSwitcher(_props: WorkspaceSwitcherProps = {}) {
  const { workspace } = useMedaShell();
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent"
    >
      <span>{workspace.name}</span>
      <ChevronDown size={14} aria-hidden="true" />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Task 7.4 stub — AppTabs (stub; full implementation in next commit)
// ---------------------------------------------------------------------------

export function AppTabs() {
  const { apps } = useMedaShell();
  return (
    <div className="flex items-center">
      {apps.map((app) => (
        <button key={app.id} type="button" className="px-3 py-2 text-sm">
          {app.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task 7.5 stub — PanelToggle (stub; full implementation in next commit)
// ---------------------------------------------------------------------------

export function PanelToggle() {
  const { panel } = useMedaShell();
  const isOpen = panel.mode !== 'closed';
  return (
    <button
      type="button"
      aria-label={isOpen ? 'Close right panel' : 'Open right panel'}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md"
    >
      {isOpen ? (
        <PanelRightClose size={18} aria-hidden="true" />
      ) : (
        <PanelRightOpen size={18} aria-hidden="true" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Task 7.2 — ShellHeader (opinionated 56px header, spec §8)
// ---------------------------------------------------------------------------

export interface ShellHeaderProps {
  globalActions?: ReactNode;
  className?: string;
}

export function ShellHeader({ globalActions, className }: ShellHeaderProps = {}) {
  return (
    <header
      className={cn(
        'flex h-[var(--shell-header-height)] w-full items-center justify-between',
        'border-b border-border bg-background px-3',
        className
      )}
    >
      {/* Left region: WorkspaceSwitcher then AppTabs (no separator between them) */}
      <div className="flex items-center">
        <WorkspaceSwitcher />
        <AppTabs />
      </div>

      {/* Right region: optional globalActions slot then mandatory PanelToggle */}
      <div className="flex items-center gap-2">
        {globalActions}
        <PanelToggle />
      </div>
    </header>
  );
}
