import type { ReactNode } from 'react';
import type { AppShellAuthBranding, AppShellAuthConfig, AppShellContextRailConfig, AppShellIconRailConfig, AppShellRightPanelConfig } from './types.js';
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
    globalActions?: ReactNode;
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
