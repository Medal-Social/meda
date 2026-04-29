'use client';

import { cloneElement, isValidElement, type MouseEvent, type ReactNode, useEffect } from 'react';
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
import type { ContextModule, PanelView, ShellRenderContext } from '../types.js';

export interface MobileDrawersProps {
  /** Menu drawer source (icon-rail items). */
  menuItems?: IconRailItem[];
  /** Active menu item id, sourced from icon rail config. */
  menuActiveId?: string;
  /** Custom menu link renderer, sourced from icon rail config. */
  menuRenderLink?: IconRailProps['renderLink'];
  /** Module drawer source (current app's context-rail module). */
  module?: ContextModule;
  /** App id used when rendering module custom content. */
  moduleAppId?: string;
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
export function MobileDrawers({
  menuItems = [],
  menuActiveId,
  menuRenderLink,
  module,
  moduleAppId,
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
      />
      <ModuleDrawer
        open={open === 'module-drawer'}
        onClose={close}
        module={module}
        renderCtx={moduleRenderCtx}
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
}: {
  open: boolean;
  onClose: () => void;
  items: IconRailItem[];
  activeId?: string;
  renderLink?: IconRailProps['renderLink'];
}) {
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} direction="left">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Menu</DrawerTitle>
          <DrawerDescription className="sr-only">
            Switch between primary app areas.
          </DrawerDescription>
        </DrawerHeader>
        <nav className="flex flex-col gap-0.5 p-2">
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

function ModuleDrawer({
  open,
  onClose,
  module,
  renderCtx,
}: {
  open: boolean;
  onClose: () => void;
  module?: ContextModule;
  renderCtx: ShellRenderContext;
}) {
  const items = module?.items ?? [];
  if (!module || (items.length === 0 && !module.render)) return null;
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} direction="left">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{module.label}</DrawerTitle>
          {module.description && (
            <DrawerDescription className="text-muted-foreground text-xs">
              {module.description}
            </DrawerDescription>
          )}
        </DrawerHeader>
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
                  'rounded-md px-2 py-1 text-xs',
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
