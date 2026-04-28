import type { ReactNode } from 'react';
export interface MobileHeaderProps {
    /** When set, renders back button + parentLabel · title (nested mode). */
    parentLabel?: string;
    /** Optional — for routing-system link rendering. */
    parentTo?: string;
    /** Page title shown in nested mode. */
    title?: string;
    /** Back button handler (nested mode). */
    onBack?: () => void;
    /** Root mode only — renders to the right of workspace name. */
    globalActions?: ReactNode;
    className?: string;
}
/**
 * Mobile-only header.
 *
 * Root mode: workspace name + optional globalActions.
 * Nested mode (when parentLabel is set): ← parentLabel · pageTitle back button.
 *
 * Renders nothing on non-mobile viewports.
 */
export declare function MobileHeader({ parentLabel, parentTo: _parentTo, title, onBack, globalActions, className, }: MobileHeaderProps): import("react/jsx-runtime").JSX.Element | null;
