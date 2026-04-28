'use client';
import { LayoutGrid, Menu, PanelTop, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppShellBody } from './app-shell.js';
import { ContextRail } from './context-rail.js';
import { IconRail } from './icon-rail.js';
import { MobileBottomNav } from './internal/mobile-bottom-nav.js';
import { MobileDrawers } from './internal/mobile-drawers.js';
import { MobileHeader } from './internal/mobile-header.js';
import { RightPanel } from './right-panel.js';
import { ShellHeader } from './shell-header.js';
import { ShellMain } from './shell-main.js';
import type {
  AppShellContextRailConfig,
  AppShellIconRailConfig,
  AppShellRightPanelConfig,
  MobileBottomNavItem,
} from './types.js';
import { useShellViewport } from './use-shell-viewport.js';

export interface AppShellWorkspaceProps {
  iconRail?: AppShellIconRailConfig;
  contextRail?: AppShellContextRailConfig;
  rightPanel?: AppShellRightPanelConfig;
  globalActions?: ReactNode;
  children: ReactNode;
}

export function AppShellWorkspace({
  iconRail,
  contextRail,
  rightPanel,
  globalActions,
  children,
}: AppShellWorkspaceProps) {
  const viewport = useShellViewport();
  const isMobile = viewport === 'mobile';

  if (isMobile) {
    // Derive the bottom-nav items from the variant config so each button maps
    // to a drawer that actually has content. Without this filter, partial
    // configs (e.g. iconRail only) would show Module/Panels/AI buttons that
    // dispatch into the void. Drawers themselves still mount unconditionally
    // when hasDrawerContent — the no-content drawers just never open.
    const navItems = buildMobileNavItems(iconRail, contextRail, rightPanel);
    const hasDrawerContent = navItems.length > 0;
    // Mobile uses a flex column so the body fits between MobileHeader and
    // MobileBottomNav. AppShellBody's fixed `100vh - headerHeight` only
    // accounts for the desktop header — using it here would push the bottom
    // nav past the wrapper's `h-screen overflow-hidden` and clip it off.
    return (
      <div className="flex h-full flex-col">
        <MobileHeader globalActions={globalActions} />
        <div className="relative flex flex-1 overflow-hidden">
          <ShellMain layout="workspace">{children}</ShellMain>
        </div>
        {hasDrawerContent && (
          <>
            <MobileBottomNav items={navItems} />
            <MobileDrawers
              menuItems={iconRail?.mainItems ?? []}
              module={contextRail?.module}
              panelViews={rightPanel?.panelViews ?? []}
              defaultView={rightPanel?.defaultView}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <ShellHeader globalActions={globalActions} />
      <AppShellBody>
        {iconRail && (
          <IconRail
            mainItems={iconRail.mainItems}
            utilityItems={iconRail.utilityItems}
            footer={iconRail.footer}
            activeId={iconRail.activeId}
          />
        )}
        {contextRail && (
          <ContextRail
            appId={contextRail.appId}
            module={contextRail.module}
            activeItemId={contextRail.activeItemId}
          />
        )}
        <ShellMain layout="workspace">{children}</ShellMain>
        {rightPanel && (
          <RightPanel panelViews={rightPanel.panelViews} defaultView={rightPanel.defaultView} />
        )}
      </AppShellBody>
    </>
  );
}

function buildMobileNavItems(
  iconRail: AppShellIconRailConfig | undefined,
  contextRail: AppShellContextRailConfig | undefined,
  rightPanel: AppShellRightPanelConfig | undefined
): MobileBottomNavItem[] {
  const items: MobileBottomNavItem[] = [];
  if (iconRail) {
    items.push({ id: 'menu', label: 'Menu', icon: Menu, opens: 'menu-drawer' });
  }
  if (contextRail?.module) {
    items.push({ id: 'module', label: 'Module', icon: LayoutGrid, opens: 'module-drawer' });
  }
  if (rightPanel) {
    items.push({ id: 'panels', label: 'Panels', icon: PanelTop, opens: 'panels-drawer' });
    if (rightPanel.panelViews.some((v) => v.id === 'ai')) {
      items.push({ id: 'ai', label: 'AI', icon: Sparkles, opens: 'ai-drawer' });
    }
  }
  return items;
}
