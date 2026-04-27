/**
 * ResizableShell — shadcn-style wrapper around react-resizable-panels v4.
 *
 * API surface: Group → ResizableShell, Panel → ResizableShellPanel,
 * Separator → ResizableHandle.
 *
 * Note: react-resizable-panels v4 renamed the exports:
 *   PanelGroup → Group, PanelResizeHandle → Separator
 * The v4 prop for layout direction is `orientation` (not `direction`).
 *
 * Persistence: left intentionally to consumers (ContextRail, RightPanel) because
 * they own the (workspaceId, appId) key needed to key useShellLayoutState.
 * ResizableShell is a layout primitive; don't couple it to the shell context hook.
 */
import type { ReactNode } from 'react';
import type { OnPanelResize } from 'react-resizable-panels';
export interface ResizableShellProps {
    /** Default: 'horizontal'. */
    orientation?: 'horizontal' | 'vertical';
    className?: string;
    children: ReactNode;
}
export declare function ResizableShell({ orientation, className, children, }: ResizableShellProps): import("react/jsx-runtime").JSX.Element;
export interface ResizableShellPanelProps {
    /** Percent (0–100). */
    defaultSize?: number;
    /** Minimum size in percent. Token-aligned default: none (set by consumer). */
    minSize?: number;
    /** Maximum size in percent. Token-aligned default: none (set by consumer). */
    maxSize?: number;
    id?: string;
    collapsible?: boolean;
    collapsedSize?: number;
    /** Called on each resize. Uses the react-resizable-panels v4 signature. */
    onResize?: OnPanelResize;
    className?: string;
    children: ReactNode;
}
export declare function ResizableShellPanel({ className, children, onResize, ...props }: ResizableShellPanelProps): import("react/jsx-runtime").JSX.Element;
export interface ResizableHandleProps {
    className?: string;
    /** When true, renders a visible drag-indicator bar inside the handle. */
    withHandle?: boolean;
}
export declare function ResizableHandle({ className, withHandle }: ResizableHandleProps): import("react/jsx-runtime").JSX.Element;
