'use client';
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
    // MobileBottomNav opens the drawers via shell context state, so it has
    // nothing to do when no drawer content is configured. Gating both keeps
    // taps from setting state into the void.
    const hasDrawerContent = Boolean(iconRail || contextRail || rightPanel);
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
            <MobileBottomNav />
            <MobileDrawers
              menuItems={iconRail?.mainItems ?? []}
              module={contextRail?.module}
              panelViews={rightPanel?.panelViews ?? []}
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
