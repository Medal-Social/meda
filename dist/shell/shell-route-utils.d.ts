import type { ReactNode } from 'react';
import type { ShellContentLayout, ShellTab } from './extras/types.js';
interface ShellRouteMatchLike {
    handle?: unknown;
    params?: Record<string, string | undefined>;
}
export declare function getShellContentLayoutFromMatches(matches: ShellRouteMatchLike[]): ShellContentLayout;
export declare function getShellTabsFromMatches(matches: ShellRouteMatchLike[], pathname: string): ShellTab[];
export declare function getShellActionsFromMatches(matches: ShellRouteMatchLike[], pathname: string): ReactNode;
export declare function getShellPanelViewsFromMatches(matches: ShellRouteMatchLike[]): string[] | undefined;
export {};
