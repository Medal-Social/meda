'use client';

import type { LucideIcon } from 'lucide-react';
import { ChevronDown, Monitor, Moon, PanelRightClose, PanelRightOpen, Sun } from 'lucide-react';
import { createElement, Fragment, isValidElement, type ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu.js';
import { cn } from '../lib/utils.js';
import { useMedaShell } from './shell-provider.js';
import { useTheme } from './theme.js';
import type { WorkspaceMenuItem } from './types.js';
import { useShellViewport } from './use-shell-viewport.js';

// ---------------------------------------------------------------------------
// ThemeToggleMenuItem — theme toggle rendered as a proper menuitem so that
// role="menu" aria-required-children is satisfied. The DropdownMenuItem render
// prop replaces the base-ui <div> with a <button> that cycles the theme.
// ---------------------------------------------------------------------------

type Theme = 'light' | 'dark' | 'system';

const NEXT_THEME: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' };
const THEME_ICON: Record<Theme, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };
const THEME_LABEL: Record<Theme, string> = {
  light: 'Switch to dark theme',
  dark: 'Switch to system theme',
  system: 'Switch to light theme',
};

function ThemeToggleMenuItem() {
  const { theme, setTheme } = useTheme();
  const Icon = THEME_ICON[theme];
  return (
    <DropdownMenuItem onClick={() => setTheme(NEXT_THEME[theme])}>
      <Icon size={16} aria-hidden="true" />
      {THEME_LABEL[theme]}
    </DropdownMenuItem>
  );
}

// ---------------------------------------------------------------------------
// WorkspaceSwitcher
// ---------------------------------------------------------------------------

export interface WorkspaceSwitcherProps {
  /**
   * Configurable dropdown items. When provided, REPLACES the default
   * "Manage workspaces / Settings / Profile / Sign out" entries. The theme
   * toggle is still inserted automatically by meda — between the items and
   * the footer — so consumers don't have to reimplement theme cycling.
   *
   * When omitted, the package-default items render (1.x behavior).
   */
  menuItems?: WorkspaceMenuItem[];
  /**
   * Extra content rendered after all items and the theme toggle. Backwards-
   * compatible alias for the legacy `workspaceMenuFooter` prop.
   */
  menuFooter?: ReactNode;
  /** @deprecated Use `menuFooter` instead. */
  workspaceMenuFooter?: ReactNode;
}

function renderConfiguredIcon(icon: WorkspaceMenuItem['icon']): ReactNode {
  if (icon == null) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'function') {
    return createElement(icon as LucideIcon, { size: 16, 'aria-hidden': true });
  }
  // forwardRef/memo components are objects carrying a `$$typeof` symbol —
  // treat them like Lucide components. Any other object (arrays, fragments
  // produced by jsx-runtime, plain ReactNode objects) is rendered as-is so
  // it doesn't crash createElement with "Element type is invalid".
  if (
    typeof icon === 'object' &&
    icon !== null &&
    '$$typeof' in (icon as Record<string, unknown>) &&
    typeof (icon as { render?: unknown }).render === 'function'
  ) {
    return createElement(icon as LucideIcon, { size: 16, 'aria-hidden': true });
  }
  return icon;
}

function renderConfiguredItem(item: WorkspaceMenuItem): ReactNode {
  const handleSelect = () => item.onClick?.();
  // Childless anchor — Base UI merges the DropdownMenuItem's children into the
  // cloned render element. Passing children here would override the icon +
  // label children below and configured icons would silently disappear.
  // biome-ignore lint/a11y/useAnchorContent: children are injected at render time by Base UI's `render` prop
  const renderLink = item.href != null ? <a href={item.href} /> : undefined;

  return (
    <DropdownMenuItem
      render={renderLink}
      data-variant={item.variant ?? 'default'}
      className={item.variant === 'destructive' ? 'text-destructive' : undefined}
      onClick={handleSelect}
    >
      {renderConfiguredIcon(item.icon)}
      {item.label}
    </DropdownMenuItem>
  );
}

export function WorkspaceSwitcher({
  menuItems,
  menuFooter,
  workspaceMenuFooter,
}: WorkspaceSwitcherProps = {}) {
  const { workspace, workspaces } = useMedaShell();
  const resolvedFooter = menuFooter ?? workspaceMenuFooter;
  const useConfiguredItems = Array.isArray(menuItems);

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

        {useConfiguredItems ? (
          menuItems.map((item) => (
            <Fragment key={item.id}>
              {renderConfiguredItem(item)}
              {item.separatorAfter && <DropdownMenuSeparator />}
            </Fragment>
          ))
        ) : (
          <>
            <DropdownMenuItem>Manage workspaces</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Profile</DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <ThemeToggleMenuItem />
        {!useConfiguredItems && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </>
        )}

        {resolvedFooter}
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
  /**
   * Forwarded to the internal `<WorkspaceSwitcher>`. See
   * `WorkspaceSwitcherProps` for the full shape.
   */
  workspaceMenuItems?: WorkspaceMenuItem[];
  workspaceMenuFooter?: ReactNode;
}

export function ShellHeader({
  globalActions,
  className,
  workspaceMenuItems,
  workspaceMenuFooter,
}: ShellHeaderProps = {}) {
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
        <WorkspaceSwitcher menuItems={workspaceMenuItems} menuFooter={workspaceMenuFooter} />
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
