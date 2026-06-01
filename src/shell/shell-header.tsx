'use client';

import type { LucideIcon } from 'lucide-react';
import { ChevronDown, Monitor, Moon, PanelRight, Sun } from 'lucide-react';
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
import type { AppShellAppTabsConfig, PanelView, WorkspaceMenuItem } from './types.js';
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

/* v8 ignore next 9 — v8 phantom duplicate function record for renderShellIcon */
function renderShellIcon(icon: WorkspaceMenuItem['icon']): ReactNode {
  if (icon == null) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'function') {
    return createElement(icon as LucideIcon, { size: 16, 'aria-hidden': true });
  }
  // forwardRef/memo components are objects carrying a `$$typeof` symbol —
  // treat them like Lucide components. Plain ReactNode objects (arrays,
  // iterables, promises) have no `$$typeof` and are rendered as-is so they
  // don't crash createElement with "Element type is invalid".
  if (typeof icon === 'object' && icon !== null) {
    const candidate = icon as unknown as { $$typeof?: symbol };
    if (candidate.$$typeof != null) {
      return createElement(icon as unknown as LucideIcon, {
        size: 16,
        'aria-hidden': true,
      });
    }
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
      {renderShellIcon(item.icon)}
      {item.label}
    </DropdownMenuItem>
  );
}

/* v8 ignore next — v8 phantom duplicate function record for WorkspaceSwitcher (default params) */
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
            className="flex min-w-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold hover:bg-accent"
          />
        }
      >
        {workspace.icon != null && (
          <span
            className="inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-foreground ring-1 ring-border/70"
            aria-hidden="true"
          >
            {workspace.icon}
          </span>
        )}
        <span className="max-w-[13rem] truncate">{workspace.name}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-[240px]">
        {/* Workspace list */}
        {!useConfiguredItems && workspaces.length > 0 && (
          <>
            {workspaces.map((ws) => (
              <DropdownMenuItem key={ws.id}>
                {/* TODO: wire setWorkspace once the provider exposes it. */}
                {ws.icon != null && (
                  <span
                    className="inline-flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-foreground ring-1 ring-border/70"
                    aria-hidden="true"
                  >
                    {ws.icon}
                  </span>
                )}
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

export interface AppTabsProps extends AppShellAppTabsConfig {}

/* v8 ignore next — v8 phantom duplicate function record for AppTabs (default params) */
export function AppTabs({ renderLink }: AppTabsProps = {}) {
  const { apps, activeAppId, setActiveApp } = useMedaShell();

  return (
    // WAI-ARIA: apps are routes, not tab-panels — use nav + aria-current="page"
    // instead of role="tablist" / role="tab" / aria-selected.
    <nav aria-label="Applications" className="flex items-center">
      {apps.map((app) => {
        const isActive = app.id === activeAppId;
        const className = cn(
          'flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'border-b-2 border-primary text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        );
        const children = (
          <>
            {renderShellIcon(app.icon)}
            {app.label}
          </>
        );
        const handleClick = () => {
          setActiveApp(app.id);
        };

        if (renderLink && app.to) {
          return (
            <Fragment key={app.id}>
              {renderLink({
                app,
                isActive,
                className,
                children,
                linkProps: {
                  href: app.to,
                  className,
                  children,
                  'aria-current': isActive ? 'page' : undefined,
                  onClick: handleClick,
                },
              })}
            </Fragment>
          );
        }

        return (
          <button
            key={app.id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={handleClick}
            /* v8 ignore next — onMouseEnter placeholder lambda is never invoked in tests */
            onMouseEnter={() => undefined}
            className={className}
          >
            {children}
          </button>
        );
      })}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// PanelToggle
// ---------------------------------------------------------------------------

export interface PanelToggleProps {
  /** Panel views surfaced in the chevron dropdown. Empty → plain toggle. */
  panelViews?: PanelView[];
}

export function PanelToggle({ panelViews = [] }: PanelToggleProps = {}) {
  const { panel } = useMedaShell();
  const isOpen = panel.mode !== 'closed';

  // No registered views → a single button that just opens/closes the panel.
  if (panelViews.length === 0) {
    return (
      <button
        type="button"
        aria-label={isOpen ? 'Close right panel' : 'Open right panel'}
        aria-pressed={isOpen}
        onClick={() => panel.setMode(isOpen ? 'closed' : 'panel')}
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-accent px-2.5 text-muted-foreground transition-colors hover:text-foreground',
          isOpen && 'text-foreground'
        )}
      >
        <PanelRight size={18} aria-hidden="true" />
      </button>
    );
  }

  // Clicking a view toggles it: selecting the already-open view closes the
  // panel; selecting any other view opens the panel focused on that view.
  const handleSelect = (viewId: string) => {
    if (isOpen && panel.activeView === viewId) {
      panel.close();
    } else {
      panel.focus(viewId);
    }
  };

  // ONE grouped control: the whole pill (panel icon + chevron) is a single
  // dropdown trigger — not two separate buttons.
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Right panel views"
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-accent px-2.5 text-muted-foreground transition-colors hover:text-foreground data-[popup-open]:text-foreground',
              isOpen && 'text-foreground'
            )}
          />
        }
      >
        <PanelRight size={18} aria-hidden="true" />
        <ChevronDown size={14} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-64 rounded-xl p-1.5">
        <div className="px-2 pt-1.5 pb-1 font-bold text-[10.5px] uppercase tracking-wider text-muted-foreground">
          Panel views
        </div>
        {panelViews.map((view) => {
          const Icon = view.icon;
          const active = isOpen && panel.activeView === view.id;
          return (
            <DropdownMenuItem
              key={view.id}
              onClick={() => handleSelect(view.id)}
              className={cn(
                'gap-2.5 rounded-[9px] px-2.5 py-2 text-sm',
                active && 'text-foreground'
              )}
            >
              <span
                className={cn(
                  'grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[7px] transition-colors',
                  active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                )}
              >
                {Icon != null ? <Icon size={16} aria-hidden="true" /> : null}
              </span>
              <span className="flex-1 font-medium">{view.label}</span>
              {active ? <span className="size-1.5 rounded-full bg-primary" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------------------
// ShellHeader — opinionated 56px header
// ---------------------------------------------------------------------------

export interface ShellHeaderProps {
  globalActions?: ReactNode;
  /**
   * Optional center-region content. Replaces the default application tabs when
   * provided.
   */
  headerCenter?: ReactNode;
  /**
   * Optional leading content rendered in the LEFT header region immediately
   * after the workspace switcher (separated by whitespace only, no divider).
   */
  headerLeading?: ReactNode;
  appTabsRenderLink?: AppShellAppTabsConfig['renderLink'];
  className?: string;
  /**
   * Forwarded to the internal `<WorkspaceSwitcher>`. See
   * `WorkspaceSwitcherProps` for the full shape.
   */
  workspaceMenuItems?: WorkspaceMenuItem[];
  workspaceMenuFooter?: ReactNode;
  showPanelToggle?: boolean;
  /** Panel views forwarded to the header `<PanelToggle>` dropdown. */
  panelViews?: PanelView[];
}

/* v8 ignore next — v8 phantom duplicate function record for ShellHeader (default params) */
export function ShellHeader({
  globalActions,
  headerCenter,
  headerLeading,
  appTabsRenderLink,
  className,
  workspaceMenuItems,
  workspaceMenuFooter,
  showPanelToggle = true,
  panelViews = [],
}: ShellHeaderProps = {}) {
  const band = useShellViewport();
  if (band === 'mobile') return null;

  // Leading content (e.g. section tabs) sits in the LEFT region just after
  // the WorkspaceSwitcher — separated by whitespace only (no divider line),
  // matching the design prototype's topbar spacing.
  const leadingRegion =
    headerLeading != null ? (
      <div className="ml-2 flex min-w-0 items-center">{headerLeading}</div>
    ) : null;

  if (headerCenter !== undefined) {
    return (
      <header
        className={cn(
          'grid h-[var(--shell-header-height)] w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center',
          'gap-4 bg-background px-4',
          className
        )}
      >
        <div className="flex min-w-0 items-center gap-2 justify-self-start">
          <WorkspaceSwitcher menuItems={workspaceMenuItems} menuFooter={workspaceMenuFooter} />
          {leadingRegion}
        </div>
        <div className="flex min-w-0 items-center justify-center justify-self-center">
          {headerCenter}
        </div>
        <div className="flex min-w-0 items-center justify-end gap-2 justify-self-end">
          {globalActions}
          {showPanelToggle && <PanelToggle panelViews={panelViews} />}
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        'flex h-[var(--shell-header-height)] w-full items-center justify-between',
        'gap-4 bg-background px-4',
        className
      )}
    >
      {/* Left region: workspace identity and switcher + optional leading slot. */}
      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <WorkspaceSwitcher menuItems={workspaceMenuItems} menuFooter={workspaceMenuFooter} />
        {leadingRegion}
      </div>

      {/* Center region: the default application tabs. */}
      <div className="flex min-w-0 flex-1 items-center">
        <AppTabs renderLink={appTabsRenderLink} />
      </div>

      {/* Right region: optional globalActions slot then PanelToggle */}
      <div className="flex shrink-0 items-center gap-2">
        {globalActions}
        {showPanelToggle && <PanelToggle panelViews={panelViews} />}
      </div>
    </header>
  );
}
