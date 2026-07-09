'use client';
import { LayoutGrid, Menu, PanelTop, Sparkles } from 'lucide-react';
import { type ReactNode, useContext } from 'react';
import { cn } from '../lib/utils.js';
import { CommandPalette, CommandRegistryContext } from './command-palette.js';
import { ContextRail } from './context-rail.js';
import { IconRail } from './icon-rail.js';
import { MobileBottomNav } from './internal/mobile-bottom-nav.js';
import { MobileDock } from './internal/mobile-dock.js';
import { MobileDrawers } from './internal/mobile-drawers.js';
import { MobileHeader } from './internal/mobile-header.js';
import { MobileWorkspaceSheet } from './internal/mobile-workspace-sheet.js';
import { useResolvedPanelViews } from './panel-views-provider.js';
import { RightPanel } from './right-panel.js';
import { ShellHeader } from './shell-header.js';
import { ShellMain } from './shell-main.js';
import type {
  AppShellAppTabsConfig,
  AppShellContextRailConfig,
  AppShellIconRailConfig,
  AppShellMobileNavConfig,
  AppShellRightPanelConfig,
  AppShellWorkspaceConfig,
  MobileBottomNavItem,
  PanelView,
  ShellMainLayout,
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
  headerLeading?: ReactNode;
  banners?: ReactNode;
  mainLayout?: ShellMainLayout;
  mainClassName?: string;
  /**
   * Whether to render the built-in `CommandPalette` (providing the
   * `CommandRegistryContext`) when no registry is already in context. Defaults
   * to `true` for backwards compatibility; set `false` to opt out when the host
   * app ships its own palette.
   */
  builtInCommandPalette?: boolean;
  /**
   * Opt-in mobile dock + workspace sheet. When provided, the mobile viewport
   * renders a floating dock + one workspace sheet instead of the legacy
   * bottom-nav + four drawers. Omit to keep the legacy mobile nav.
   */
  mobileNav?: AppShellMobileNavConfig;
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
  headerLeading,
  banners,
  mainLayout,
  mainClassName,
  builtInCommandPalette = true,
  mobileNav,
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
  const commandRegistry = useContext(CommandRegistryContext);
  const shell = (
    <div className="flex h-svh flex-col">
      {isMobile ? (
        <MobileHeader globalActions={globalActions} headerCenter={headerCenter} />
      ) : (
        <ShellHeader
          globalActions={globalActions}
          headerCenter={headerCenter}
          headerLeading={headerLeading}
          appTabsRenderLink={appTabs?.renderLink}
          workspaceMenuItems={workspace?.menuItems}
          workspaceMenuFooter={workspace?.menuFooter}
          showPanelToggle={resolvedRightPanel.panelViews.length > 0}
          panelViews={resolvedRightPanel.panelViews}
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
            labelVisibility={iconRail.labelVisibility}
          />
        )}
        {!isMobile && contextRail && (
          <ContextRail
            appId={contextRail.appId}
            module={contextRail.module}
            activeItemId={contextRail.activeItemId}
            renderLink={contextRail.renderLink}
            header={contextRail.header}
            scroll={contextRail.scroll}
          />
        )}
        <ShellMain
          layout={mainLayout ?? 'workspace'}
          className={cn(
            mainClassName,
            // Pad the scroll area so the floating dock never covers content.
            isMobile && mobileNav && 'pb-[calc(env(safe-area-inset-bottom)+80px)]'
          )}
        >
          {children}
        </ShellMain>
        {!isMobile && resolvedRightPanel.panelViews.length > 0 && (
          <RightPanel panelViews={staticPanelViews} defaultView={rightPanel?.defaultView} />
        )}
      </div>
      {/* Mobile nav: opt-in floating dock + workspace sheet, else the legacy
          bottom-nav + drawers. */}
      {isMobile && mobileNav ? (
        <>
          <MobileDock
            items={mobileNav.dock}
            activeTo={mobileNav.activeTo}
            renderLink={mobileNav.renderLink}
            variant={mobileNav.variant}
          />
          <MobileWorkspaceSheet
            tree={mobileNav.tree}
            activeTo={mobileNav.activeTo}
            renderLink={mobileNav.renderLink}
            workspaceMenuItems={workspace?.menuItems}
            workspaceMenuFooter={workspace?.menuFooter}
          />
        </>
      ) : (
        <>
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
              moduleActiveItemId={contextRail?.activeItemId}
              moduleRenderLink={contextRail?.renderLink}
              moduleHeader={contextRail?.header}
              moduleScroll={contextRail?.scroll}
              sectionTabs={headerLeading}
              panelViews={resolvedRightPanel.panelViews}
              defaultView={resolvedRightPanel.defaultView}
            />
          )}
        </>
      )}
    </div>
  );

  // Backwards-compatible default: meda provides the built-in CommandPalette
  // (and its CommandRegistryContext) so consumers calling useCommands()/
  // useCommandGroup() under the workspace shell keep working. When a registry is
  // already present, or the consumer opts out via builtInCommandPalette={false}
  // (e.g. apps that ship their own palette), render the bare shell to avoid a
  // duplicate dialog.
  if (commandRegistry || !builtInCommandPalette) {
    return shell;
  }
  return <CommandPalette>{shell}</CommandPalette>;
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
