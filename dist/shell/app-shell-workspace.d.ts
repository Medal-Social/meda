import type { ReactNode } from 'react';
import type { AppShellContextRailConfig, AppShellIconRailConfig, AppShellRightPanelConfig } from './types.js';
export interface AppShellWorkspaceProps {
    iconRail?: AppShellIconRailConfig;
    contextRail?: AppShellContextRailConfig;
    rightPanel?: AppShellRightPanelConfig;
    globalActions?: ReactNode;
    children: ReactNode;
}
export declare function AppShellWorkspace({ iconRail, contextRail, rightPanel, globalActions, children, }: AppShellWorkspaceProps): import("react/jsx-runtime").JSX.Element;
