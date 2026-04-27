/**
 * ContextRail — spec §10
 *
 * Renders a resizable, collapsible, persisted context navigation rail.
 * Width is stored per-(workspaceId, appId) via useShellLayoutState through
 * the MedaShellProvider context.
 *
 * Resize integration note (Phase 9 / Pattern B):
 * The rail uses its own pointer-events resize handle on the right edge instead
 * of wrapping in <ResizableShell> (Pattern A). Pattern A requires migrating
 * <AppShellBody> to a PanelGroup layout — that is Phase 11 territory.
 * TODO(phase-11): replace pointer-events handle with <ResizableShellPanel>
 * once <AppShellBody> ships as a ResizableShell Group.
 */
import type { ReactNode } from 'react';
import type { ContextModule, ShellLinkRenderArgs } from './types.js';
export interface ContextRailProps {
    /** Drives the persistence key for layout state. */
    appId: string;
    module?: ContextModule;
    /** Starting width in px. Falls back to provider's stored width (default 300). */
    defaultWidth?: number;
    collapsible?: boolean;
    /** When true, the rail evaporates — renders an aria-hidden placeholder. */
    hidden?: boolean;
    /** Optional active item id for nav active state (preferred over useMedaShell().selection). */
    activeItemId?: string;
    renderLink?: (args: ShellLinkRenderArgs) => ReactNode;
    className?: string;
}
export declare function ContextRail({ appId: _appId, module, hidden, collapsible: _collapsible, activeItemId, renderLink, className, }: ContextRailProps): import("react/jsx-runtime").JSX.Element | null;
