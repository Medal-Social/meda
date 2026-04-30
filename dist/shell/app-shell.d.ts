import type { ReactNode } from 'react';
import type { AppShellAppTabsConfig, AppShellAuthBranding, AppShellAuthConfig, AppShellContextRailConfig, AppShellIconRailConfig, AppShellRightPanelConfig, AppShellWorkspaceConfig } from './types.js';
interface AppShellBaseProps {
    children: ReactNode;
    className?: string;
}
export type AppShellProps = AppShellBaseProps & ({
    variant: 'auth';
    auth?: AppShellAuthConfig;
    branding?: AppShellAuthBranding;
    preview?: ReactNode;
    actions?: ReactNode;
} | {
    variant: 'workspace';
    iconRail?: AppShellIconRailConfig;
    contextRail?: AppShellContextRailConfig;
    rightPanel?: AppShellRightPanelConfig;
    /**
     * Configurable workspace dropdown — replaces the package-default
     * "Manage workspaces / Settings / Profile / Sign out" entries when
     * `menuItems` is provided. The theme toggle is preserved automatically.
     */
    workspace?: AppShellWorkspaceConfig;
    /**
     * Optional application-tab rendering config, used for router-specific
     * link integration.
     */
    appTabs?: AppShellAppTabsConfig;
    globalActions?: ReactNode;
    /**
     * Optional center-region header content. Replaces the default
     * application tabs when provided.
     */
    headerCenter?: ReactNode;
    /**
     * Optional chrome-level content rendered below the header and above
     * the workspace rail row.
     */
    banners?: ReactNode;
} | {
    variant: 'chat';
    globalActions?: ReactNode;
});
export declare function AppShell(props: AppShellProps): import("react/jsx-runtime").JSX.Element;
export declare function AppShellBody({ children, className }: {
    children: ReactNode;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export {};
