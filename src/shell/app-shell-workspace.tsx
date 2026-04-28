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
    const hasDrawerContent = Boolean(iconRail || contextRail || rightPanel);
    return (
      <>
        <MobileHeader globalActions={globalActions} />
        <AppShellBody>
          <ShellMain layout="workspace">{children}</ShellMain>
        </AppShellBody>
        <MobileBottomNav />
        {hasDrawerContent && (
          <MobileDrawers
            menuItems={iconRail?.mainItems ?? []}
            module={contextRail?.module}
            panelViews={rightPanel?.panelViews ?? []}
          />
        )}
      </>
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
