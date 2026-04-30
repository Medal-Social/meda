import type { ReactNode } from 'react';
import type { AppShellAppTabsConfig, AppShellContextRailConfig, AppShellIconRailConfig, AppShellRightPanelConfig, AppShellWorkspaceConfig, ShellMainLayout } from './types.js';
export interface AppShellWorkspaceProps {
    iconRail?: AppShellIconRailConfig;
    contextRail?: AppShellContextRailConfig;
    rightPanel?: AppShellRightPanelConfig;
    workspace?: AppShellWorkspaceConfig;
    appTabs?: AppShellAppTabsConfig;
    globalActions?: ReactNode;
    headerCenter?: ReactNode;
    banners?: ReactNode;
    mainLayout?: ShellMainLayout;
    mainClassName?: string;
    children: ReactNode;
}
export declare function AppShellWorkspace({ iconRail, contextRail, rightPanel, workspace, appTabs, globalActions, headerCenter, banners, mainLayout, mainClassName, children, }: AppShellWorkspaceProps): import("react/jsx-runtime").JSX.Element;
