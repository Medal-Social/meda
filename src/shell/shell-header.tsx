'use client';

import { ChevronDown, PanelRightClose, PanelRightOpen } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu.js';
import { cn } from '../lib/utils.js';
import { useMedaShell } from './shell-provider.js';
import { ThemeToggle } from './theme.js';
import { useShellViewport } from './use-shell-viewport.js';

// ---------------------------------------------------------------------------
// WorkspaceSwitcher
// ---------------------------------------------------------------------------

export interface WorkspaceSwitcherProps {
  workspaceMenuFooter?: ReactNode;
}

export function WorkspaceSwitcher({ workspaceMenuFooter }: WorkspaceSwitcherProps = {}) {
  const { workspace, workspaces } = useMedaShell();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent"
          />
        }
      >
        {workspace.icon != null && (
          <span className="shrink-0" aria-hidden="true">
            {workspace.icon}
          </span>
        )}
        <span>{workspace.name}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-[200px]">
        {/* Workspace list */}
        {workspaces.length > 0 && (
          <>
            {workspaces.map((ws) => (
              <DropdownMenuItem key={ws.id}>
                {/* TODO: wire setWorkspace once the provider exposes it. */}
                {ws.icon != null && <span aria-hidden="true">{ws.icon}</span>}
                {ws.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem>Manage workspaces</DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Profile</DropdownMenuItem>

        {/* ThemeToggle inline — rendered in a non-interactive wrapper
            because nesting a button inside MenuPrimitive.Item is invalid HTML. */}
        <div role="none" className="flex items-center px-1.5 py-1">
          <ThemeToggle />
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem>Sign out</DropdownMenuItem>

        {workspaceMenuFooter}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------------------
// AppTabs
// ---------------------------------------------------------------------------

export function AppTabs() {
  const { apps, activeAppId, setActiveApp } = useMedaShell();

  return (
    // WAI-ARIA: apps are routes, not tab-panels — use nav + aria-current="page"
    // instead of role="tablist" / role="tab" / aria-selected.
    <nav aria-label="Applications" className="flex items-center">
      {apps.map((app) => {
        const isActive = app.id === activeAppId;
        const Icon = app.icon;
        return (
          <button
            key={app.id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => {
              setActiveApp(app.id);
              // TODO(Phase 18.x): renderLink integration so clicking a tab also navigates
              // the consumer's router; setActiveApp alone updates context.
            }}
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
    </nav>
  );
}

// ---------------------------------------------------------------------------
// PanelToggle
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
// ShellHeader — opinionated 56px header
// ---------------------------------------------------------------------------

export interface ShellHeaderProps {
  globalActions?: ReactNode;
  className?: string;
}

export function ShellHeader({ globalActions, className }: ShellHeaderProps = {}) {
  const band = useShellViewport();
  if (band === 'mobile') return null;

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
