'use client';
import { LayoutGrid, Menu, PanelTop, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { CommandPalette } from './command-palette.js';
import { ContextRail } from './context-rail.js';
import { IconRail } from './icon-rail.js';
import { MobileBottomNav } from './internal/mobile-bottom-nav.js';
import { MobileDrawers } from './internal/mobile-drawers.js';
import { MobileHeader } from './internal/mobile-header.js';
import { useResolvedPanelViews } from './panel-views-provider.js';
import { RightPanel } from './right-panel.js';
import { ShellHeader } from './shell-header.js';
import { ShellMain } from './shell-main.js';
import type {
  AppShellAppTabsConfig,
  AppShellContextRailConfig,
  AppShellIconRailConfig,
  AppShellRightPanelConfig,
  AppShellWorkspaceConfig,
  MobileBottomNavItem,
  PanelView,
} from './types.js';
import { useShellViewport } from './use-shell-viewport.js';

const EMPTY_PANEL_VIEWS: PanelView[] = [];

export interface AppShellWorkspaceProps {
  iconRail?: AppShellIconRailConfig;
  contextRail?: AppShellContextRailConfig;
  rightPanel?: AppShellRightPanelConfig;
  workspace?: AppShellWorkspaceConfig;
  appTabs?: AppShellAppTabsConfig;
  globalActions?: ReactNode;
  headerCenter?: ReactNode;
  banners?: ReactNode;
  children: ReactNode;
}

export function AppShellWorkspace({
  iconRail,
  contextRail,
  rightPanel,
  workspace,
  appTabs,
  globalActions,
  headerCenter,
  banners,
  children,
}: AppShellWorkspaceProps) {
  const viewport = useShellViewport();
  const isMobile = viewport === 'mobile';
  const staticPanelViews = rightPanel?.panelViews ?? EMPTY_PANEL_VIEWS;
  const resolvedRightPanel = useResolvedPanelViews(staticPanelViews, rightPanel?.defaultView);

  // Derive the bottom-nav items from the variant config so each button maps
  // to a drawer that actually has content. Menu is always available because
  // the mobile drawer now carries workspace actions and the theme toggle.
  const navItems = buildMobileNavItems(contextRail, resolvedRightPanel.panelViews);
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
    <CommandPalette>
      <div className="flex h-screen flex-col">
        {isMobile ? (
          <MobileHeader globalActions={globalActions} />
        ) : (
          <ShellHeader
            globalActions={globalActions}
            headerCenter={headerCenter}
            appTabsRenderLink={appTabs?.renderLink}
            workspaceMenuItems={workspace?.menuItems}
            workspaceMenuFooter={workspace?.menuFooter}
          />
        )}
        {banners ? (
          <div data-meda-banners="" className="flex-shrink-0">
            {banners}
          </div>
        ) : (
          false
        )}
        <div className="relative flex flex-1 overflow-hidden">
          {!isMobile && iconRail && (
            <IconRail
              mainItems={iconRail.mainItems}
              utilityItems={iconRail.utilityItems}
              footer={iconRail.footer}
              activeId={iconRail.activeId}
              renderLink={iconRail.renderLink}
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
          {!isMobile && resolvedRightPanel.panelViews.length > 0 && (
            <RightPanel panelViews={staticPanelViews} defaultView={rightPanel?.defaultView} />
          )}
        </div>
        {isMobile && hasDrawerContent && <MobileBottomNav items={navItems} />}
        {isMobile && hasDrawerContent && (
          <MobileDrawers
            menuItems={mobileMenuItems}
            menuActiveId={iconRail?.activeId}
            menuRenderLink={iconRail?.renderLink}
            workspaceMenuItems={workspace?.menuItems}
            workspaceMenuFooter={workspace?.menuFooter}
            module={contextRail?.module}
            moduleAppId={contextRail?.appId}
            panelViews={resolvedRightPanel.panelViews}
            defaultView={resolvedRightPanel.defaultView}
          />
        )}
      </div>
    </CommandPalette>
  );
}

function buildMobileNavItems(
  contextRail: AppShellContextRailConfig | undefined,
  panelViews: PanelView[]
): MobileBottomNavItem[] {
  const items: MobileBottomNavItem[] = [
    { id: 'menu', label: 'Menu', icon: Menu, opens: 'menu-drawer' },
  ];
  if (
    contextRail?.module &&
    ((contextRail.module.items ?? []).length > 0 || Boolean(contextRail.module.render))
  ) {
    items.push({ id: 'module', label: 'Module', icon: LayoutGrid, opens: 'module-drawer' });
  }
  // Panels button only when there's an actual view to render — empty
  // panelViews would open an empty drawer (dead-end tap).
  if (panelViews.length > 0) {
    items.push({ id: 'panels', label: 'Panels', icon: PanelTop, opens: 'panels-drawer' });
    if (panelViews.some((v) => v.id === 'ai')) {
      items.push({ id: 'ai', label: 'AI', icon: Sparkles, opens: 'ai-drawer' });
    }
  }
  return items;
}
