'use client';

import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  type LucideIcon,
  Monitor,
  Moon,
  Search,
  Sun,
} from 'lucide-react';
import { createElement, Fragment, isValidElement, type ReactNode, useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '../../components/ui/drawer.js';
import { cn } from '../../lib/utils.js';
import { useMedaShell } from '../shell-provider.js';
import { useTheme } from '../theme.js';
import type {
  MobileNavItem,
  MobileNavLinkArgs,
  MobileNavTree,
  WorkspaceMenuItem,
} from '../types.js';
import { WORKSPACE_SHEET_KEY } from './mobile-dock.js';

function renderIcon(icon: ReactNode | LucideIcon | undefined, size: number): ReactNode {
  if (icon == null) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'function' || typeof icon === 'object') {
    return createElement(icon as never, { size, 'aria-hidden': true });
  }
  return null;
}

const rowClass =
  'flex w-full items-center gap-3 rounded-[10px] px-2 py-2.5 text-left text-[13.5px] transition-colors hover:bg-accent';

export interface MobileWorkspaceSheetProps {
  tree: MobileNavTree;
  activeTo?: string;
  renderLink?: (args: MobileNavLinkArgs) => ReactNode;
  workspaceMenuItems?: WorkspaceMenuItem[];
  workspaceMenuFooter?: ReactNode;
}

/**
 * The one mobile workspace sheet — a calm, scannable list of the whole nav
 * tree that replaces the four drawers. Modules are light group labels,
 * submodules are rows: a `›` navigates, a `⌄` reveals a slim chip row of
 * preset views (accordion, one open at a time). Filters, layout, and saved
 * views deliberately stay on the page, not here. Opened from the dock's
 * workspace-selector slot; a workspace header on top surfaces the account menu.
 */
export function MobileWorkspaceSheet({
  tree,
  activeTo,
  renderLink,
  workspaceMenuItems,
  workspaceMenuFooter,
}: MobileWorkspaceSheetProps) {
  const ctx = useMedaShell();
  const open = ctx.mobileDrawer.open === WORKSPACE_SHEET_KEY;
  const close = () => ctx.mobileDrawer.setOpen(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);

  const navLink = (
    to: string,
    label: string,
    className: string,
    children: ReactNode,
    isActive: boolean
  ): ReactNode => {
    if (renderLink) {
      return renderLink({
        to,
        isActive,
        className,
        children,
        onNavigate: close,
        linkProps: {
          href: to,
          className,
          'aria-label': label,
          'aria-current': isActive ? 'page' : undefined,
          onClick: close,
        },
      });
    }
    return (
      <a href={to} className={className} aria-label={label} onClick={close}>
        {children}
      </a>
    );
  };

  const renderRow = (item: MobileNavItem) => {
    const isActive = Boolean(activeTo && item.to === activeTo);
    const hasViews = Boolean(item.views && item.views.length > 0);
    const icon = renderIcon(item.icon, 17);
    const badge = item.badge ? (
      <span className="rounded-full bg-accent px-1.5 py-0.5 text-[11px] text-muted-foreground">
        {item.badge}
      </span>
    ) : null;

    // Plain navigate row — no presets.
    if (!hasViews) {
      return navLink(
        item.to,
        item.label,
        cn(rowClass, isActive ? 'text-foreground' : 'text-foreground/90'),
        <>
          <span className="shrink-0 text-muted-foreground">{icon}</span>
          <span className="flex-1">{item.label}</span>
          {badge}
          <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" aria-hidden="true" />
        </>,
        isActive
      );
    }

    // Expandable row — reveals a slim chip row of preset views.
    const isOpen = expandedId === item.id;
    return (
      <Fragment key={item.id}>
        <button
          type="button"
          onClick={() => setExpandedId(isOpen ? null : item.id)}
          aria-expanded={isOpen}
          className={cn(rowClass, isOpen ? 'text-primary' : 'text-foreground/90')}
        >
          <span className={cn('shrink-0', isOpen ? 'text-primary' : 'text-muted-foreground')}>
            {icon}
          </span>
          <span className="flex-1">{item.label}</span>
          {badge}
          {isOpen ? (
            <ChevronUp className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
        </button>
        {isOpen ? (
          <div className="flex flex-wrap gap-1.5 pt-1 pb-2 pl-[37px]">
            {item.views?.map((view) => {
              const viewActive = Boolean(activeTo && view.to === activeTo);
              return (
                <Fragment key={view.id}>
                  {navLink(
                    view.to,
                    `${item.label} · ${view.label}`,
                    cn(
                      'rounded-full px-3 py-1.5 text-[12px] transition-colors',
                      viewActive
                        ? 'bg-primary/12 text-primary'
                        : 'border border-border text-muted-foreground hover:text-foreground'
                    ),
                    view.label,
                    viewActive
                  )}
                </Fragment>
              );
            })}
          </div>
        ) : null}
      </Fragment>
    );
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && close()} direction="bottom">
      <DrawerContent
        showOverlay
        className="max-h-[86vh] rounded-t-[22px] p-0 data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-[86vh]"
      >
        <DrawerHeader className="sr-only">
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>Jump to any area of the workspace.</DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-1 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          {/* Workspace header — identity + account menu toggle. */}
          <button
            type="button"
            onClick={() => setAccountOpen((v) => !v)}
            aria-expanded={accountOpen}
            className="flex w-full items-center gap-2.5 rounded-[10px] px-1.5 py-2 text-left hover:bg-accent"
          >
            <span className="inline-flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted ring-1 ring-border/70">
              {ctx.workspace.icon}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium text-sm">
              {ctx.workspace.name}
            </span>
            {accountOpen ? (
              <ChevronUp className="size-4 text-muted-foreground" aria-hidden="true" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
            )}
          </button>
          {accountOpen ? (
            <div className="mb-1 flex flex-col gap-0.5 border-b pb-2">
              {workspaceMenuItems?.map((item) => (
                <Fragment key={item.id}>
                  <WorkspaceMenuRow item={item} onClose={close} />
                  {item.separatorAfter ? <div className="my-1 h-px bg-border" /> : null}
                </Fragment>
              ))}
              <ThemeRow />
              {workspaceMenuFooter}
            </div>
          ) : null}

          {/* Search → command palette. */}
          <button
            type="button"
            onClick={() => {
              close();
              ctx.commandPalette.setOpen(true);
            }}
            className="my-2 flex w-full items-center gap-2 rounded-[10px] border px-3 py-2.5 text-left text-muted-foreground text-sm"
          >
            <Search className="size-4" aria-hidden="true" />
            Search…
          </button>

          {/* Nav tree. */}
          {tree.groups.map((group) => (
            <section key={group.id} aria-label={group.label}>
              <p className="px-2 pt-3 pb-1 text-[11px] text-muted-foreground">{group.label}</p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <Fragment key={item.id}>{renderRow(item)}</Fragment>
                ))}
              </div>
            </section>
          ))}

          {tree.footerItems && tree.footerItems.length > 0 ? (
            <>
              <div className="mx-2 my-2 h-px bg-border" />
              <div className="flex flex-col gap-0.5">
                {tree.footerItems.map((item) => (
                  <Fragment key={item.id}>{renderRow(item)}</Fragment>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function WorkspaceMenuRow({ item, onClose }: { item: WorkspaceMenuItem; onClose: () => void }) {
  const icon = renderIcon(item.icon, 16);
  const className = cn(rowClass, item.variant === 'destructive' && 'text-destructive');
  const handleClick = () => {
    item.onClick?.();
    onClose();
  };
  if (item.href != null) {
    return (
      <a href={item.href} className={className} onClick={handleClick}>
        <span className="shrink-0 text-muted-foreground">{icon}</span>
        {item.label}
      </a>
    );
  }
  return (
    <button type="button" className={className} onClick={handleClick}>
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      {item.label}
    </button>
  );
}

const NEXT_THEME = { light: 'dark', dark: 'system', system: 'light' } as const;
const THEME_ICON = { light: Sun, dark: Moon, system: Monitor } as const;
const THEME_LABEL = {
  light: 'Switch to dark theme',
  dark: 'Switch to system theme',
  system: 'Switch to light theme',
} as const;

function ThemeRow() {
  const { theme, setTheme } = useTheme();
  const Icon = THEME_ICON[theme];
  return (
    <button type="button" className={rowClass} onClick={() => setTheme(NEXT_THEME[theme])}>
      <span className="shrink-0 text-muted-foreground">
        <Icon size={16} aria-hidden="true" />
      </span>
      {THEME_LABEL[theme]}
    </button>
  );
}
