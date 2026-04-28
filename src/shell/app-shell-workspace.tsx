'use client';
import { LayoutGrid, Menu, PanelTop, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
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

  // Derive the bottom-nav items from the variant config so each button maps
  // to a drawer that actually has content. Without this filter, partial
  // configs (e.g. iconRail only) would show Module/Panels/AI buttons that
  // dispatch into the void.
  const navItems = buildMobileNavItems(iconRail, contextRail, rightPanel);
  const hasDrawerContent = navItems.length > 0;

  // Mobile menu drawer needs both main and utility items — desktop IconRail
  // shows both, so dropping utilityItems here would orphan items like Help/
  // Settings on mobile. Concat preserves discoverability; visual separation
  // (divider in the drawer between main and utility) is a future polish.
  const mobileMenuItems = iconRail ? [...iconRail.mainItems, ...(iconRail.utilityItems ?? [])] : [];

  // ONE tree shape across both viewports. ShellMain stays at a fixed position
  // in its parent's children array so React preserves its subtree (and the
  // user's `children` state) when useShellViewport flips after mount or on
  // rotation. Conditional siblings render as `false` rather than disappearing.
  //
  // h-screen (not h-full) so this stays a bounded scroll container even when
  // rendered without an explicit-height ancestor (tests, direct imports). The
  // <AppShell> wrapper already enforces h-screen for the workspace variant, so
  // nested viewport-height divs collapse cleanly — no double-scroll.
  return (
    <div className="flex h-screen flex-col">
      {isMobile ? (
        <MobileHeader globalActions={globalActions} />
      ) : (
        <ShellHeader globalActions={globalActions} />
      )}
      <div className="relative flex flex-1 overflow-hidden">
        {!isMobile && iconRail && (
          <IconRail
            mainItems={iconRail.mainItems}
            utilityItems={iconRail.utilityItems}
            footer={iconRail.footer}
            activeId={iconRail.activeId}
          />
        )}
        {!isMobile && contextRail && (
          <ContextRail
            appId={contextRail.appId}
            module={contextRail.module}
            activeItemId={contextRail.activeItemId}
          />
        )}
        <ShellMain layout="workspace">{children}</ShellMain>
        {!isMobile && rightPanel && (
          <RightPanel panelViews={rightPanel.panelViews} defaultView={rightPanel.defaultView} />
        )}
      </div>
      {isMobile && hasDrawerContent && <MobileBottomNav items={navItems} />}
      {isMobile && hasDrawerContent && (
        <MobileDrawers
          menuItems={mobileMenuItems}
          module={contextRail?.module}
          panelViews={rightPanel?.panelViews ?? []}
          defaultView={rightPanel?.defaultView}
        />
      )}
    </div>
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
