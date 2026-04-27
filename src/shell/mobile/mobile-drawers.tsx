'use client';

import { type ReactNode, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '../../components/ui/drawer.js';
import { cn } from '../../lib/utils.js';
import type { IconRailItem } from '../icon-rail.js';
import { useMedaShell } from '../shell-provider.js';
import type { ContextModule, PanelView, ShellRenderContext } from '../types.js';

export interface MobileDrawersProps {
  /** Menu drawer source (icon-rail items). */
  menuItems?: IconRailItem[];
  /** Module drawer source (current app's context-rail module). */
  module?: ContextModule;
  /** Panels drawer source. */
  panelViews?: PanelView[];
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
  module,
  panelViews = [],
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

  return (
    <>
      <MenuDrawer open={open === 'menu-drawer'} onClose={close} items={menuItems} />
      <ModuleDrawer open={open === 'module-drawer'} onClose={close} module={module} />
      <PanelsDrawer
        open={open === 'panels-drawer'}
        onClose={close}
        panelViews={panelViews}
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
}: {
  open: boolean;
  onClose: () => void;
  items: IconRailItem[];
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
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={item.to}
                onClick={onClose}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </DrawerContent>
    </Drawer>
  );
}

function ModuleDrawer({
  open,
  onClose,
  module,
}: {
  open: boolean;
  onClose: () => void;
  module?: ContextModule;
}) {
  if (!module) return null;
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
        <nav className="flex flex-col gap-0.5 p-2">
          {module.items.map((item) => {
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
      </DrawerContent>
    </Drawer>
  );
}

function PanelsDrawer({
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
  const activeView = ctx.panel.activeView;
  const active = panelViews.find((v) => v.id === activeView) ?? panelViews[0];

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
