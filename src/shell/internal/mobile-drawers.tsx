'use client';

import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import {
  cloneElement,
  createElement,
  Fragment,
  isValidElement,
  type MouseEvent,
  type ReactNode,
  useEffect,
} from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '../../components/ui/drawer.js';
import { cn } from '../../lib/utils.js';
import type { IconRailItem, IconRailProps } from '../icon-rail.js';
import { useMedaShell } from '../shell-provider.js';
import { useTheme } from '../theme.js';
import type {
  ContextModule,
  ContextRailHeader,
  ContextRailScroll,
  PanelView,
  ShellRenderContext,
  WorkspaceMenuItem,
} from '../types.js';

export interface MobileDrawersProps {
  /** Menu drawer source (icon-rail items). */
  menuItems?: IconRailItem[];
  /** Active menu item id, sourced from icon rail config. */
  menuActiveId?: string;
  /** Custom menu link renderer, sourced from icon rail config. */
  menuRenderLink?: IconRailProps['renderLink'];
  /** Workspace-level menu items rendered after icon rail links on mobile. */
  workspaceMenuItems?: WorkspaceMenuItem[];
  /** Workspace-level footer rendered after workspace items and the theme toggle. */
  workspaceMenuFooter?: ReactNode;
  /** Module drawer source (current app's context-rail module). */
  module?: ContextModule;
  /** App id used when rendering module custom content. */
  moduleAppId?: string;
  /** Header behavior mirrored from the desktop ContextRail. */
  moduleHeader?: ContextRailHeader;
  /** Scroll behavior mirrored from the desktop ContextRail. */
  moduleScroll?: ContextRailScroll;
  /** Panels drawer source. */
  panelViews?: PanelView[];
  /**
   * Default panel view id. Used when ctx.panel.activeView is null so the
   * mobile panels drawer opens to the same view as the desktop right panel.
   * Without this, mobile would always fall back to panelViews[0].
   */
  defaultView?: string;
  /** Custom content drawers keyed by id from MobileBottomNavItem.opens render fn. */
  customContent?: Record<string, (close: () => void) => ReactNode>;
  className?: string;
}

/**
 * Renders all four mobile drawer slots (Menu / Module / Panels / AI) plus
 * any custom-content drawers. Mount once near the AppShell root; drawers
 * open/close via `ctx.mobileDrawer.open` provider state.
 */
/* v8 ignore next — v8 phantom duplicate function record for MobileDrawers */
export function MobileDrawers({
  menuItems = [],
  menuActiveId,
  menuRenderLink,
  workspaceMenuItems,
  workspaceMenuFooter,
  module,
  moduleAppId,
  moduleHeader,
  moduleScroll,
  panelViews = [],
  defaultView,
  customContent = {},
}: MobileDrawersProps) {
  const ctx = useMedaShell();
  const open = ctx.mobileDrawer.open;
  const setOpen = ctx.mobileDrawer.setOpen;
  const close = () => setOpen(null);
  const renderCtx: ShellRenderContext = {
    workspaceId: ctx.workspace.id,
    appId: ctx.activeAppId,
  };
  const moduleRenderCtx: ShellRenderContext = {
    workspaceId: ctx.workspace.id,
    appId: moduleAppId ?? ctx.activeAppId,
  };

  return (
    <>
      <MenuDrawer
        open={open === 'menu-drawer'}
        onClose={close}
        items={menuItems}
        activeId={menuActiveId}
        renderLink={menuRenderLink}
        workspaceItems={workspaceMenuItems}
        workspaceFooter={workspaceMenuFooter}
      />
      <ModuleDrawer
        open={open === 'module-drawer'}
        onClose={close}
        module={module}
        renderCtx={moduleRenderCtx}
        header={moduleHeader}
        scroll={moduleScroll}
      />
      <PanelsDrawer
        open={open === 'panels-drawer'}
        onClose={close}
        panelViews={panelViews}
        defaultView={defaultView}
        renderCtx={renderCtx}
      />
      <AiDrawer
        open={open === 'ai-drawer'}
        onClose={close}
        panelViews={panelViews}
        renderCtx={renderCtx}
      />

      {/* Custom drawers from MobileBottomNavItem.opens render fns */}
      {Object.entries(customContent).map(([id, renderFn]) => (
        <Drawer key={id} open={open === id} onOpenChange={(o) => !o && close()} direction="bottom">
          <DrawerContent>{renderFn(close)}</DrawerContent>
        </Drawer>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Internal sub-drawers
// ---------------------------------------------------------------------------

function MenuDrawer({
  open,
  onClose,
  items,
  activeId,
  renderLink,
  workspaceItems,
  workspaceFooter,
}: {
  open: boolean;
  onClose: () => void;
  items: IconRailItem[];
  activeId?: string;
  renderLink?: IconRailProps['renderLink'];
  workspaceItems?: WorkspaceMenuItem[];
  workspaceFooter?: ReactNode;
}) {
  const hasIconItems = items.length > 0;
  const hasWorkspaceItems = Array.isArray(workspaceItems) && workspaceItems.length > 0;

  /* v8 ignore next — v8 phantom duplicate return statement for MenuDrawer */
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} direction="left">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Menu</DrawerTitle>
          <DrawerDescription className="sr-only">
            Switch between primary app areas.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-2 p-2">
          {hasIconItems && (
            <nav aria-label="Primary navigation" className="flex flex-col gap-0.5">
              {items.map((item) => (
                <MenuDrawerItem
                  key={item.id}
                  item={item}
                  isActive={item.id === activeId}
                  onClose={onClose}
                  renderLink={renderLink}
                />
              ))}
            </nav>
          )}
          {(hasIconItems || hasWorkspaceItems) && <div className="h-px bg-border" />}
          <nav aria-label="Workspace menu" className="flex flex-col gap-0.5">
            {workspaceItems?.map((item) => (
              <Fragment key={item.id}>
                <WorkspaceMenuDrawerItem item={item} onClose={onClose} />
                {item.separatorAfter && <div className="my-1 h-px bg-border" />}
              </Fragment>
            ))}
            <MobileThemeMenuItem onClose={onClose} />
          </nav>
          {workspaceFooter}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

const menuItemClassName =
  'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground';

function MenuDrawerItem({
  item,
  isActive,
  onClose,
  renderLink,
}: {
  item: IconRailItem;
  isActive: boolean;
  onClose: () => void;
  renderLink?: IconRailProps['renderLink'];
}) {
  const Icon = item.icon;
  const children = (
    <>
      <Icon size={18} aria-hidden="true" />
      <span>{item.label}</span>
    </>
  );
  const className = cn(menuItemClassName, isActive && 'bg-accent text-foreground');
  const linkProps = {
    href: item.to,
    className,
    children,
  };

  if (renderLink) {
    return closeAfterLinkClick(
      renderLink({
        item,
        isActive,
        className,
        children,
        linkProps,
      }),
      onClose
    );
  }

  return closeAfterLinkClick(<a {...linkProps} />, onClose);
}

type MenuLinkElementProps = {
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

function closeAfterLinkClick(link: ReactNode, onClose: () => void): ReactNode {
  if (!isValidElement<MenuLinkElementProps>(link)) {
    return link;
  }

  const originalOnClick = link.props.onClick;
  return cloneElement(link, {
    onClick: (event: MouseEvent<HTMLElement>) => {
      originalOnClick?.(event);
      onClose();
    },
  });
}

function renderWorkspaceIcon(icon: WorkspaceMenuItem['icon']): ReactNode {
  if (icon == null) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'function') {
    return createElement(icon as LucideIcon, { size: 18, 'aria-hidden': true });
  }
  if (typeof icon === 'object') {
    const candidate = icon as unknown as { $$typeof?: symbol };
    if (candidate.$$typeof != null) {
      return createElement(icon as unknown as LucideIcon, { size: 18, 'aria-hidden': true });
    }
  }
  return icon;
}

function WorkspaceMenuDrawerItem({
  item,
  onClose,
}: {
  item: WorkspaceMenuItem;
  onClose: () => void;
}) {
  const children = (
    <>
      {renderWorkspaceIcon(item.icon)}
      <span>{item.label}</span>
    </>
  );
  const className = cn(
    menuItemClassName,
    item.variant === 'destructive' && 'text-destructive hover:text-destructive'
  );
  const handleClick = () => {
    item.onClick?.();
    onClose();
  };

  if (item.href != null) {
    return closeAfterLinkClick(
      <a
        href={item.href}
        className={className}
        data-variant={item.variant ?? 'default'}
        onClick={() => item.onClick?.()}
      >
        {children}
      </a>,
      onClose
    );
  }

  return (
    <button
      type="button"
      data-variant={item.variant ?? 'default'}
      className={className}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

type Theme = 'light' | 'dark' | 'system';

const NEXT_THEME: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' };
const THEME_ICON: Record<Theme, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };
const THEME_LABEL: Record<Theme, string> = {
  light: 'Switch to dark theme',
  dark: 'Switch to system theme',
  system: 'Switch to light theme',
};

function MobileThemeMenuItem({ onClose }: { onClose: () => void }) {
  const { theme, setTheme } = useTheme();
  const Icon = THEME_ICON[theme];

  return (
    <button
      type="button"
      aria-label={THEME_LABEL[theme]}
      className={menuItemClassName}
      onClick={() => {
        setTheme(NEXT_THEME[theme]);
        onClose();
      }}
    >
      <Icon size={18} aria-hidden="true" />
      <span>{THEME_LABEL[theme]}</span>
    </button>
  );
}

function ModuleDrawer({
  open,
  onClose,
  module,
  renderCtx,
  header = 'auto',
  scroll = 'auto',
}: {
  open: boolean;
  onClose: () => void;
  module?: ContextModule;
  renderCtx: ShellRenderContext;
  header?: ContextRailHeader;
  scroll?: ContextRailScroll;
}) {
  const items = module?.items ?? [];
  if (!module || (items.length === 0 && !module.render)) return null;

  const hasRender = typeof module.render === 'function';
  const showHeader = header === 'visible' || (header === 'auto' && items.length > 0 && !hasRender);
  const title = (
    <>
      <DrawerTitle className={showHeader ? undefined : 'sr-only'}>{module.label}</DrawerTitle>
      {module.description && (
        <DrawerDescription className={showHeader ? 'text-muted-foreground text-xs' : 'sr-only'}>
          {module.description}
        </DrawerDescription>
      )}
    </>
  );

  /* v8 ignore next — v8 phantom duplicate return statement for ModuleDrawer */
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} direction="left">
      <DrawerContent>
        {showHeader ? <DrawerHeader>{title}</DrawerHeader> : title}
        <div
          data-meda-context-rail-scroll-area=""
          className={cn(
            'min-h-0 flex-1',
            scroll === 'auto' ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'
          )}
        >
          {items.length > 0 && (
            <nav className="flex flex-col gap-0.5 p-2">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.id}
                    href={item.to}
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>
          )}
          {module.render?.(renderCtx)}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function PanelsDrawer({
  open,
  onClose,
  panelViews,
  defaultView,
  renderCtx,
}: {
  open: boolean;
  onClose: () => void;
  panelViews: PanelView[];
  defaultView?: string;
  renderCtx: ShellRenderContext;
}) {
  const ctx = useMedaShell();
  const activeView = ctx.panel.activeView;
  const setActiveView = ctx.panel.setActiveView;

  // Hydrate ctx.panel.activeView from defaultView when the drawer opens — matches
  // desktop RightPanel behavior so the tab highlight (aria-current) and provider
  // state stay in sync across viewports. Without this, mobile shows the right
  // content but no tab is marked active.
  useEffect(() => {
    if (open && activeView == null && defaultView && panelViews.some((v) => v.id === defaultView)) {
      setActiveView(defaultView);
    }
  }, [open, activeView, defaultView, panelViews, setActiveView]);

  // Resolution order: explicit user selection → consumer-provided defaultView
  // → first view. Keeps mobile parity with desktop where defaultView is honored.
  const active =
    panelViews.find((v) => v.id === activeView) ??
    (defaultView ? panelViews.find((v) => v.id === defaultView) : undefined) ??
    panelViews[0];

  /* v8 ignore next — v8 phantom duplicate return statement for PanelsDrawer */
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} direction="bottom">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{active?.label ?? 'Panels'}</DrawerTitle>
          <DrawerDescription className="sr-only">
            Contextual panels for the current module.
          </DrawerDescription>
        </DrawerHeader>
        {panelViews.length > 1 && (
          <div className="flex items-center gap-1 border-b border-border px-3 py-2">
            {panelViews.map((view) => (
              <button
                key={view.id}
                type="button"
                onClick={() => ctx.panel.setActiveView(view.id)}
                aria-current={view.id === activeView ? 'true' : undefined}
                className={cn(
                  'rounded-md px-2 py-1 text-sm',
                  view.id === activeView
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent'
                )}
              >
                {view.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-3">{active?.render(renderCtx)}</div>
      </DrawerContent>
    </Drawer>
  );
}

function AiDrawer({
  open,
  onClose,
  panelViews,
  renderCtx,
}: {
  open: boolean;
  onClose: () => void;
  panelViews: PanelView[];
  renderCtx: ShellRenderContext;
}) {
  const ctx = useMedaShell();
  const aiView = panelViews.find((v) => v.id === 'ai');

  const setActiveView = ctx.panel.setActiveView;

  // Pin to ai view when drawer opens
  // biome-ignore lint/correctness/useExhaustiveDependencies: setActiveView is stable (from useMemo in provider)
  useEffect(() => {
    if (open && aiView) {
      setActiveView('ai');
    }
  }, [open, aiView]);

  if (!aiView) return null;

  /* v8 ignore next — v8 phantom duplicate return statement for AiDrawer */
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} direction="bottom">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{aiView.label}</DrawerTitle>
          <DrawerDescription className="sr-only">Open the AI assistant panel.</DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-3">{aiView.render(renderCtx)}</div>
      </DrawerContent>
    </Drawer>
  );
}
