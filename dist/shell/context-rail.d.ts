import type { ReactNode } from 'react';
import type { ContextModule, ContextRailHeader, ContextRailScroll, ShellLinkRenderArgs } from './types.js';
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
    header?: ContextRailHeader;
    scroll?: ContextRailScroll;
    className?: string;
}
export declare function ContextRail({ appId, module, hidden, collapsible, activeItemId, renderLink, header, scroll, className, }: ContextRailProps): import("react/jsx-runtime").JSX.Element | null;
