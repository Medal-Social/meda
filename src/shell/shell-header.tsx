'use client';

import { ChevronDown, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { cn } from '../lib/utils.js';
import { useMedaShell } from './shell-provider.js';
import { ThemeToggle } from './theme.js';

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
// Task 7.3 — WorkspaceSwitcher
// ---------------------------------------------------------------------------

export interface WorkspaceSwitcherProps {
  workspaceMenuFooter?: ReactNode;
}

export function WorkspaceSwitcher({ workspaceMenuFooter }: WorkspaceSwitcherProps = {}) {
  const { workspace, workspaces } = useMedaShell();

  // Controlled open state — avoids portal/jsdom issues with @base-ui/react Menu.Portal.
  // The menu popup renders inline in the component tree for full test coverage.
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((o) => !o);
  const close = () => setOpen(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={toggle}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent"
      >
        {workspace.icon != null && (
          <span className="shrink-0" aria-hidden="true">
            {workspace.icon}
          </span>
        )}
        <span>{workspace.name}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {/* Backdrop to dismiss on outside click */}
      {open && <div role="none" className="fixed inset-0 z-40" onClick={close} />}

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-md border border-border',
            'bg-popover py-1 shadow-md'
          )}
        >
          {/* Workspace list */}
          {workspaces.length > 0 && (
            <>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
                  onClick={close}
                >
                  {ws.icon != null && <span aria-hidden="true">{ws.icon}</span>}
                  {ws.name}
                </button>
              ))}
              <hr className="my-1 border-border" />
            </>
          )}

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center px-3 py-1.5 text-sm hover:bg-accent"
            onClick={close}
          >
            Manage workspaces
          </button>

          <hr className="my-1 border-border" />

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center px-3 py-1.5 text-sm hover:bg-accent"
            onClick={close}
          >
            Settings
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center px-3 py-1.5 text-sm hover:bg-accent"
            onClick={close}
          >
            Profile
          </button>

          {/* Theme toggle inline per spec §22a */}
          <div className="flex items-center px-3 py-1.5">
            <ThemeToggle />
          </div>

          <hr className="my-1 border-border" />

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center px-3 py-1.5 text-sm hover:bg-accent"
            onClick={close}
          >
            Sign out
          </button>

          {workspaceMenuFooter}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task 7.4 — AppTabs
// ---------------------------------------------------------------------------

export function AppTabs() {
  const { apps, activeAppId, setActiveApp } = useMedaShell();

  return (
    <div className="flex items-center" role="tablist" aria-label="Applications">
      {apps.map((app) => {
        const isActive = app.id === activeAppId;
        const Icon = app.icon;
        return (
          <button
            key={app.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveApp(app.id)}
            // TODO(Phase 18): usePrefetch(app.to)
            onMouseEnter={() => {}}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon size={16} aria-hidden="true" />
            {app.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task 7.5 — PanelToggle
// ---------------------------------------------------------------------------

export function PanelToggle() {
  const { panel } = useMedaShell();
  const isOpen = panel.mode !== 'closed';

  const handleClick = () => {
    panel.setMode(isOpen ? 'closed' : 'panel');
  };

  return (
    <button
      type="button"
      aria-label={isOpen ? 'Close right panel' : 'Open right panel'}
      onClick={handleClick}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
        isOpen ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent'
      )}
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
